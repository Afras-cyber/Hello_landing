import React, { useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import html2canvas from 'html2canvas';
import { createWorker } from 'tesseract.js';
import { generateBrowserFingerprint } from '@/utils/sessionId';

interface FullPageScreenshotTrackerProps {
  sessionId: string;
  enableDebugMode?: boolean;
}

interface BookingStepData {
  step: string;
  service?: string;
  specialist?: string;
  date?: string;
  time?: string;
  price?: string;
  duration?: string;
}

const FullPageScreenshotTracker: React.FC<FullPageScreenshotTrackerProps> = ({ 
  sessionId, 
  enableDebugMode = false 
}) => {
  const [isTrackingActive, setIsTrackingActive] = useState(false);
  const [screenshotCount, setScreenshotCount] = useState(0);
  const [debugStats, setDebugStats] = useState({
    totalInteractions: 0,
    screenshotsTaken: 0,
    ocrAnalyzed: 0,
    bookingPageTime: 0,
    confidenceScore: 0,
    currentBookingStep: 'not_started',
    detectedServices: [] as string[],
    extractedPrices: [] as number[],
    totalAmount: 0,
    appointmentDate: '',
    appointmentTime: '',
    conversionDetected: false,
    lastScreenshotUrl: '',
    formDetected: false,
    ocrInProgress: false,
    lastOcrText: '',
    formSubmissionDetected: false,
    currentStepNumber: 1,
    lastFormData: null as any,
    iframeFound: false,
    iframeUrl: '',
    formDataDetected: false,
    messageEventsReceived: 0,
    sessionFingerprint: generateBrowserFingerprint().substring(0, 8),
    contactFormFilled: false,
    nameFieldDetected: false,
    emailFieldDetected: false,
    phoneFieldDetected: false,
    timmaFormDataDetected: false,
    consoleConversionDetected: false,
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    clientAddress: '',
    clientCity: '',
    clientPostalCode: '',
    acceptEmailMarketing: false,
    acceptSmsMarketing: false,
    hasSuccessGreen: false,
    greenPercentage: '0',
    ocrColorConversionDetected: false
  });
  
  const iframeInteractionCount = useRef(0);
  const bookingStartTime = useRef<number | null>(null);
  const bookingSteps = useRef<BookingStepData[]>([]);
  const screenshotInterval = useRef<NodeJS.Timeout | null>(null);
  const ocrWorker = useRef<any>(null);
  const lastFormDataHash = useRef<string>('');
  const originalConsoleMethods = useRef<any>({});
  const { toast } = useToast();

  const debugLog = (message: string, data?: any) => {
    if (enableDebugMode) {
      console.log(`📸 FULL PAGE SCREENSHOT DEBUG: ${message}`, data || '');
    }
  };

  // Browser fingerprinting for unique session creation
  function generateBrowserFingerprint(): string {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx!.textBaseline = 'top';
    ctx!.font = '14px Arial';
    ctx!.fillText('Browser fingerprint', 2, 2);
    
    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      screen.colorDepth,
      new Date().getTimezoneOffset(),
      canvas.toDataURL(),
      navigator.hardwareConcurrency || 'unknown',
      navigator.maxTouchPoints || 0
    ].join('|');
    
    // Simple hash function
    let hash = 0;
    for (let i = 0; i < fingerprint.length; i++) {
      const char = fingerprint.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return Math.abs(hash).toString(36);
  }

  // Enhanced console interception for all methods
  const setupEnhancedConsoleInterception = () => {
    debugLog('🎧 Setting up enhanced console interception for ALL console methods');
    
    // Store all original console methods
    const consoleMethods = ['log', 'info', 'warn', 'error', 'table', 'group', 'groupCollapsed', 'groupEnd', 'dir', 'dirxml'];
    
    consoleMethods.forEach(method => {
      if (console[method as keyof Console]) {
        originalConsoleMethods.current[method] = console[method as keyof Console];
      }
    });
    
    // Override all console methods
    consoleMethods.forEach(method => {
      if (console[method as keyof Console]) {
        (console as any)[method] = (...args: any[]) => {
          // Call original method first
          originalConsoleMethods.current[method].apply(console, args);
          
          // Analyze all arguments for Timma client data and confirmation text
          analyzeConsoleArguments(args, method);
        };
      }
    });
  };

  // Analyze console arguments for client data and confirmation text
  const analyzeConsoleArguments = (args: any[], method: string) => {
    try {
      // Priority 1: Check for structured client data (most reliable)
      for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        
        // Check direct objects
        if (arg && typeof arg === 'object' && !Array.isArray(arg)) {
          const clientData = extractClientDataFromObject(arg);
          if (clientData) {
            debugLog('🎯 CLIENT DATA DETECTED in console.' + method + '!', clientData);
            handleClientDataDetection(clientData, `console_${method}`);
            return; // Found best data, exit
          }
        }
        
        // Check arrays containing objects
        if (Array.isArray(arg) && arg.length > 0) {
          for (const item of arg) {
            if (item && typeof item === 'object') {
              const clientData = extractClientDataFromObject(item);
              if (clientData) {
                debugLog('🎯 CLIENT DATA DETECTED in console.' + method + ' array!', clientData);
                handleClientDataDetection(clientData, `console_${method}_array`);
                return; // Found best data, exit
              }
            }
          }
        }
        
        // Check nested structures
        if (arg && typeof arg === 'object') {
          const nestedData = findNestedClientData(arg);
          if (nestedData) {
            debugLog('🎯 NESTED CLIENT DATA DETECTED in console.' + method + '!', nestedData);
            handleClientDataDetection(nestedData, `console_${method}_nested`);
            return; // Found best data, exit
          }
        }
      }

      // Priority 2: Fallback to simple text search if no structured data found
      if (debugStats.conversionDetected) return;

      const consoleStr = args
        .map(arg => {
          if (typeof arg === 'string') return arg;
          if (typeof arg === 'object' && arg !== null) {
            try { return JSON.stringify(arg); } catch (e) { return '[Unserializable Object]';}
          }
          return String(arg);
        })
        .join(' ')
        .toLowerCase();
      
      if (consoleStr) {
        const hasConfirmationText = consoleStr.includes('vahvistettu') || consoleStr.includes('kiitos varauksesta') || consoleStr.includes('varaus onnistui');
        if (hasConfirmationText) {
          debugLog(`🎉 High confidence conversion detected via Console TEXT analysis! (method: ${method})`);
          handleOcrAndColorConversion({
            detectionMethod: 'console_text_analysis',
            confidence: 0.96,
            ocrText: `Console log (${method}): ${consoleStr.substring(0, 200)}`,
            colorAnalysis: { detectionSource: 'console_text' },
          });
          return; // Found text conversion, exit
        }
      }

    } catch (error) {
      debugLog('Error analyzing console arguments:', error);
    }
  };

  // Extract client data from object
  const extractClientDataFromObject = (obj: any): any | null => {
    if (!obj || typeof obj !== 'object') return null;
    
    const hasClientName = obj.clientName && typeof obj.clientName === 'string';
    const hasClientPhone = obj.clientPhone && typeof obj.clientPhone === 'string';
    const hasClientEmail = obj.clientEmail && typeof obj.clientEmail === 'string';
    
    // Must have at least name and either phone or email
    if (hasClientName && (hasClientPhone || hasClientEmail)) {
      return {
        clientName: obj.clientName,
        clientPhone: obj.clientPhone || '',
        clientEmail: obj.clientEmail || '',
        clientAddress: obj.clientAddress || '',
        clientCity: obj.clientCity || '',
        clientPostalCode: obj.clientPostalCode || '',
        acceptEmailMarketing: obj.acceptEmailMarketing || false,
        acceptSmsMarketing: obj.acceptSmsMarketing || false,
        clientMessage: obj.clientMessage || '',
        socialSecurityNumber: obj.socialSecurityNumber || '',
        // Also capture booking details if present
        clientStart: obj.clientStart || '',
        clientEnd: obj.clientEnd || '',
        additionalServices: obj.additionalServices || []
      };
    }
    
    return null;
  };

  // Find nested client data recursively
  const findNestedClientData = (obj: any, depth = 0): any | null => {
    if (depth > 3 || !obj || typeof obj !== 'object') return null;
    
    // Check current level
    const directData = extractClientDataFromObject(obj);
    if (directData) return directData;
    
    // Check nested objects and arrays
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const value = obj[key];
        
        if (Array.isArray(value)) {
          for (const item of value) {
            const nestedData = findNestedClientData(item, depth + 1);
            if (nestedData) return nestedData;
          }
        } else if (value && typeof value === 'object') {
          const nestedData = findNestedClientData(value, depth + 1);
          if (nestedData) return nestedData;
        }
      }
    }
    
    return null;
  };

  // Handle client data detection
  const handleClientDataDetection = async (clientData: any, detectionMethod: string = 'console') => {
    if (debugStats.conversionDetected) {
      debugLog('Skipping console conversion, another conversion already detected.');
      return;
    }
    debugLog('🔥 PROCESSING CLIENT DATA FOR CONVERSION', clientData);
    
    // Update stats immediately with all client information
    setDebugStats(prev => ({
      ...prev,
      timmaFormDataDetected: true,
      consoleConversionDetected: true,
      conversionDetected: true,
      confidenceScore: 0.99,
      currentBookingStep: 'client_data_detected_via_console',
      lastFormData: clientData,
      contactFormFilled: true,
      nameFieldDetected: !!clientData.clientName,
      emailFieldDetected: !!clientData.clientEmail,
      phoneFieldDetected: !!clientData.clientPhone,
      clientName: clientData.clientName || '',
      clientEmail: clientData.clientEmail || '',
      clientPhone: clientData.clientPhone || '',
      clientAddress: clientData.clientAddress || '',
      clientCity: clientData.clientCity || '',
      clientPostalCode: clientData.clientPostalCode || '',
      acceptEmailMarketing: clientData.acceptEmailMarketing || false,
      acceptSmsMarketing: clientData.acceptSmsMarketing || false
    }));

    // Create enhanced booking step data
    const finalBookingStep: BookingStepData = {
      step: 'client_console_data_captured',
      service: 'Timma Booking Service',
      date: clientData.clientStart ? new Date(clientData.clientStart).toLocaleDateString('fi-FI') : '',
      time: clientData.clientStart ? new Date(clientData.clientStart).toLocaleTimeString('fi-FI', { hour: '2-digit', minute: '2-digit' }) : '',
      duration: clientData.clientStart && clientData.clientEnd ? 
        Math.round((new Date(clientData.clientEnd).getTime() - new Date(clientData.clientStart).getTime()) / (1000 * 60)) + ' min' : ''
    };
    
    // Track the interaction
    await trackInteraction({
      type: 'enhanced_client_data_console_detection',
      element: 'console_client_data',
      text: `Client data detected: ${clientData.clientName}, ${clientData.clientPhone || clientData.clientEmail}`,
      bookingStep: finalBookingStep
    });

    // Save enhanced booking details to database
    try {
      const appointmentDateString = clientData.clientStart ? new Date(clientData.clientStart).toISOString() : null;
      
      const { error: detailsError } = await supabase.from('enhanced_booking_details').upsert({
        session_id: sessionId,
        customer_name: clientData.clientName,
        customer_email: clientData.clientEmail,
        customer_phone: clientData.clientPhone,
        client_address: clientData.clientAddress,
        client_city: clientData.clientCity,
        client_postal_code: clientData.clientPostalCode,
        accept_email_marketing: clientData.acceptEmailMarketing,
        accept_sms_marketing: clientData.acceptSmsMarketing,
        client_message: clientData.clientMessage,
        social_security_number: clientData.socialSecurityNumber,
        console_detection_method: detectionMethod,
        console_raw_data: clientData,
        service_names: ['Timma Booking Service'],
        appointment_date: appointmentDateString,
        appointment_time: clientData.clientStart ? new Date(clientData.clientStart).toLocaleTimeString('fi-FI', { hour: '2-digit', minute: '2-digit' }) : null,
        location: 'Blondify | Jätkäsaari',
        extracted_text: `Console client data: ${JSON.stringify(clientData)}`,
        raw_ocr_data: {
          detection_method: 'console_interception',
          console_method: detectionMethod,
          client_data: clientData,
          timestamp: new Date().toISOString()
        }
      }, {
        onConflict: 'session_id'
      });

      if (detailsError) {
        console.error('Error saving enhanced booking details:', detailsError);
      } else {
        debugLog('✅ Enhanced booking details saved successfully');
      }
    } catch (error) {
      console.error('Error in enhanced booking details save:', error);
    }

    // Save conversion to database
    try {
      const { error } = await supabase.from('booking_conversions').upsert({
        session_id: sessionId,
        booking_confirmation_detected: true,
        estimated_conversion: false, // This is a real conversion with client data
        confidence_score: 0.99,
        console_detected: true,
        console_detection_timestamp: new Date().toISOString(),
        client_contact_data: {
          clientName: clientData.clientName,
          clientPhone: clientData.clientPhone,
          clientEmail: clientData.clientEmail,
          clientAddress: clientData.clientAddress,
          clientCity: clientData.clientCity,
          clientPostalCode: clientData.clientPostalCode,
          acceptEmailMarketing: clientData.acceptEmailMarketing,
          acceptSmsMarketing: clientData.acceptSmsMarketing
        },
        iframe_interactions: iframeInteractionCount.current,
        booking_page_time: bookingStartTime.current 
          ? Math.floor((Date.now() - bookingStartTime.current) / 1000)
          : 0,
        utm_source: new URLSearchParams(window.location.search).get('utm_source'),
        utm_medium: new URLSearchParams(window.location.search).get('utm_medium'),
        utm_campaign: new URLSearchParams(window.location.search).get('utm_campaign'),
        success_indicators: JSON.stringify({
          booking_steps: bookingSteps.current,
          final_booking: finalBookingStep,
          client_data: clientData,
          detection_method: 'enhanced_console_interception',
          console_detection: true,
          full_page_screenshot: true,
          session_fingerprint: debugStats.sessionFingerprint,
          console_method: detectionMethod,
          appointment_details: {
            start: clientData.clientStart,
            end: clientData.clientEnd,
            additional_services: clientData.additionalServices
          }
        })
      }, {
        onConflict: 'session_id'
      });

      if (error) {
        console.error('Error creating console conversion:', error);
      } else {
        debugLog('✅ Console conversion record created successfully');
        
        // Take final screenshot
        await takeFullPageScreenshot('console_client_data_conversion_confirmed');

        if (enableDebugMode) {
          toast({
            title: "🎉 CLIENT DATA DETECTED!",
            description: `Console detected: ${clientData.clientName} - ${clientData.clientPhone || clientData.clientEmail}`,
            duration: 10000,
          });
        }
      }
    } catch (error) {
      console.error('Error in handleClientDataDetection:', error);
    }
  };

  const handleOcrAndColorConversion = async (details: { detectionMethod: string; confidence: number; ocrText: string; colorAnalysis: any; }) => {
    debugLog('🔥 PROCESSING OCR+COLOR CONVERSION', details);

    setDebugStats(prev => ({
      ...prev,
      ocrColorConversionDetected: true,
      conversionDetected: true,
      confidenceScore: Math.max(prev.confidenceScore, details.confidence),
      currentBookingStep: 'ocr_color_conversion',
    }));

    const conversionStep: BookingStepData = {
      step: 'ocr_color_conversion_captured',
      service: 'OCR/Color Detected Service',
    };

    await trackInteraction({
      type: 'ocr_color_conversion',
      element: 'full_page_screenshot',
      text: `Conversion detected via OCR and color analysis.`,
      bookingStep: conversionStep,
    });
    
    try {
      const { error } = await supabase.from('booking_conversions').upsert({
        session_id: sessionId,
        booking_confirmation_detected: true,
        estimated_conversion: true,
        confidence_score: details.confidence,
        console_detected: false,
        success_indicators: JSON.stringify({
          booking_steps: bookingSteps.current,
          final_booking: conversionStep,
          detection_method: 'ocr_and_color',
          ocr_text_snippet: details.ocrText.substring(0, 200),
          color_analysis: details.colorAnalysis,
          session_fingerprint: debugStats.sessionFingerprint,
        })
      }, { onConflict: 'session_id' });

      if (error) {
        console.error('Error creating OCR/Color conversion:', error);
      } else {
        debugLog('✅ OCR/Color conversion record created/updated successfully');
        if (enableDebugMode) {
          toast({
            title: "🎉 OCR+COLOR CONVERSION!",
            description: `High confidence conversion detected on page.`,
            duration: 10000,
          });
        }
      }
    } catch (error) {
      console.error('Error in handleOcrAndColorConversion:', error);
    }
  };

  // Initialize OCR worker
  const initializeOCR = async () => {
    try {
      debugLog('🔍 Initializing OCR worker for full page content...');
      ocrWorker.current = await createWorker('fin+eng', 1, {
        logger: (m) => {
          if (enableDebugMode && m.status === 'recognizing text') {
            debugLog(`OCR Progress: ${(m.progress * 100).toFixed(1)}%`);
          }
        }
      });
      debugLog('✅ OCR worker initialized successfully');
    } catch (error) {
      console.error('❌ OCR worker initialization failed:', error);
    }
  };

  // Take screenshot of entire page
  const takeFullPageScreenshot = async (reason: string): Promise<string | null> => {
    try {
      debugLog(`📸 Taking FULL PAGE screenshot for: ${reason}`);
      
      // Take screenshot of entire page
      const canvas = await html2canvas(document.body, {
        useCORS: true,
        allowTaint: true,
        scale: 0.5,
        backgroundColor: '#ffffff',
        height: window.innerHeight,
        width: window.innerWidth,
        scrollX: 0,
        scrollY: 0
      });

      // Immediately analyze for conversion signals if one is not already found
      if (!debugStats.conversionDetected) {
        await analyzeScreenshotWithOcrAndColor(canvas, reason);
      }

      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => resolve(blob!), 'image/jpeg', 0.8);
      });

      const timestamp = Date.now();
      const filename = `fullpage_screenshot_${sessionId}_${timestamp}.jpg`;
      
      // Upload to storage without requiring authentication
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('screenshots')
        .upload(filename, blob, {
          contentType: 'image/jpeg',
          upsert: false
        });

      if (uploadError) {
        console.error('Full page screenshot upload error:', uploadError);
        return null;
      }

      const screenshotUrl = `screenshots/${filename}`;
      debugLog('✅ Full page screenshot uploaded successfully', { 
        screenshotUrl, 
        dimensions: `${canvas.width}x${canvas.height}` 
      });

      setScreenshotCount(prev => prev + 1);
      setDebugStats(prev => ({
        ...prev,
        screenshotsTaken: prev.screenshotsTaken + 1,
        lastScreenshotUrl: screenshotUrl
      }));

      return screenshotUrl;
      
    } catch (error) {
      console.error('❌ Full page screenshot error:', error);
      return null;
    }
  };

  const analyzeCanvasColors = (canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return { dominantColor: null, hasSuccessGreen: false, greenPercentage: '0' };

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const colorCounts: { [key: string]: number } = {};
    let maxCount = 0;
    let dominantColor: string | null = null;
    let greenPixelCount = 0;
    const ignoredColor = '255,255,255'; // ignore white background

    // sample 1 pixel every 10 to speed up
    for (let i = 0; i < data.length; i += 4 * 10) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const rgb = `${r},${g},${b}`;
        
        if (rgb === ignoredColor) continue;

        colorCounts[rgb] = (colorCounts[rgb] || 0) + 1;
        if (colorCounts[rgb] > maxCount) {
            maxCount = colorCounts[rgb];
            dominantColor = rgb;
        }
        
        // Success green: high green, low red & blue
        if (g > r + b && g > 120) {
            greenPixelCount++;
        }
    }

    const totalSampledPixels = data.length / (4 * 10);
    const greenPercentage = (greenPixelCount / totalSampledPixels) * 100;

    return {
        dominantColor,
        hasSuccessGreen: greenPixelCount > 0, // at least 1 pixel is green
        greenPercentage: greenPercentage.toFixed(2)
    };
  };

  const analyzeScreenshotWithOcrAndColor = async (canvas: HTMLCanvasElement, reason: string) => {
    if (debugStats.conversionDetected) {
      debugLog('📸 Skipping further analysis, conversion already detected.');
      return;
    }

    // 1. Color Analysis
    const colorAnalysis = analyzeCanvasColors(canvas);
    debugLog('🎨 Color analysis complete', colorAnalysis);
    setDebugStats(prev => ({
      ...prev,
      hasSuccessGreen: colorAnalysis.hasSuccessGreen,
      greenPercentage: colorAnalysis.greenPercentage,
    }));

    // 2. OCR Analysis
    if (!ocrWorker.current) {
      debugLog('⚠️ OCR worker not ready, skipping OCR for this screenshot.');
      return;
    }
    
    try {
      debugLog('🤖 Starting OCR analysis...');
      setDebugStats(prev => ({ ...prev, ocrInProgress: true }));
      
      const { data: { text } } = await ocrWorker.current.recognize(canvas);
      
      debugLog('🤖 OCR analysis complete', { text: text.substring(0, 100) });
      setDebugStats(prev => ({ ...prev, ocrInProgress: false, ocrAnalyzed: prev.ocrAnalyzed + 1, lastOcrText: text.substring(0,100) + '...' }));

      // 3. Conversion Logic
      const lowerText = text.toLowerCase();
      const hasConfirmationText = lowerText.includes('vahvistettu') || lowerText.includes('kiitos varauksesta') || lowerText.includes('varaus onnistui');
      
      if (colorAnalysis.hasSuccessGreen && hasConfirmationText) {
          debugLog('🎉 High confidence conversion detected via OCR + Color analysis!');
          await handleOcrAndColorConversion({
              detectionMethod: 'ocr_and_color',
              confidence: 0.98,
              ocrText: text,
              colorAnalysis,
          });
      }
    } catch (error) {
        console.error('❌ OCR Analysis error:', error);
        setDebugStats(prev => ({ ...prev, ocrInProgress: false }));
    }
  };

  const trackInteraction = async (interactionData: {
    type: string;
    element?: string;
    text?: string;
    x?: number;
    y?: number;
    iframeUrl?: string;
    bookingStep?: BookingStepData;
  }) => {
    try {
      debugLog('Tracking full page interaction', interactionData);
      
      const timestampOffset = Date.now() - (bookingStartTime.current || Date.now());
      
      const { data, error } = await supabase.rpc('track_iframe_interaction', {
        p_session_id: sessionId,
        p_interaction_type: interactionData.type,
        p_element_selector: interactionData.element || null,
        p_element_text: interactionData.text || null,
        p_x_coordinate: interactionData.x || null,
        p_y_coordinate: interactionData.y || null,
        p_timestamp_offset: Math.floor(timestampOffset / 1000),
        p_iframe_url: interactionData.iframeUrl || null,
        p_interaction_data: {
          session_id: sessionId,
          timestamp: new Date().toISOString(),
          user_agent: navigator.userAgent,
          page_url: window.location.href,
          timestamp_offset: Math.floor(timestampOffset / 1000),
          booking_step: interactionData.bookingStep ? JSON.stringify(interactionData.bookingStep) : null,
          full_page_screenshot: true,
          session_fingerprint: debugStats.sessionFingerprint,
          enhanced_console_detection: true
        }
      });

      if (error) {
        console.error('❌ Error tracking full page interaction:', error);
        return;
      }

      iframeInteractionCount.current++;
      
      if (interactionData.bookingStep) {
        bookingSteps.current.push(interactionData.bookingStep);
      }
      
      const timeOnPage = bookingStartTime.current 
        ? Math.floor((Date.now() - bookingStartTime.current) / 1000)
        : 0;

      setDebugStats(prev => ({
        ...prev,
        totalInteractions: iframeInteractionCount.current,
        bookingPageTime: timeOnPage,
        currentBookingStep: interactionData.bookingStep?.step || prev.currentBookingStep
      }));

      debugLog('Full page interaction tracked successfully', {
        interactionId: data,
        totalInteractions: iframeInteractionCount.current,
        timeOnPage,
        bookingStep: interactionData.bookingStep
      });

    } catch (error) {
      console.error('❌ Error in trackInteraction:', error);
    }
  };

  const handlePostMessage = (event: MessageEvent) => {
    if (!event.origin.includes('timma.fi') && !event.origin.includes('varaa.timma.fi')) {
      return;
    }

    debugLog('POSTMESSAGE received from Timma', { origin: event.origin, data: event.data });
    setDebugStats(prev => ({ ...prev, messageEventsReceived: prev.messageEventsReceived + 1 }));

    const data = event.data;

    // 1. Try to find structured client data (most reliable)
    if (data && typeof data === 'object') {
      const clientData = findNestedClientData(data); // Re-use the existing recursive search function
      if (clientData) {
        debugLog('🎯 CLIENT DATA DETECTED in postMessage!', clientData);
        handleClientDataDetection(clientData, 'postMessage');
        return; // Conversion detected, no need for fallback
      }
    }

    // 2. Fallback to simple text search for confirmation keywords
    if (debugStats.conversionDetected) return; // Don't run fallback if already found

    let dataStr = '';
    if (typeof data === 'string') {
      dataStr = data.toLowerCase();
    } else if (data && typeof data === 'object') {
      dataStr = JSON.stringify(data).toLowerCase();
    }

    if (dataStr) {
        const hasConfirmationText = dataStr.includes('vahvistettu') || dataStr.includes('kiitos varauksesta') || dataStr.includes('varaus onnistui') || dataStr.includes('confirmed') || dataStr.includes('success');
        if(hasConfirmationText) {
            debugLog('🎉 High confidence conversion detected via PostMessage text analysis!');
            handleOcrAndColorConversion({
              detectionMethod: 'postMessage_text_analysis',
              confidence: 0.97,
              ocrText: `PostMessage data: ${dataStr.substring(0, 200)}`,
              colorAnalysis: { detectionSource: 'postMessage' },
            });
        }
    }
  };

  const setupFullPageTracking = () => {
    debugLog('🎯 Setting up full page tracking with session:', sessionId);
    setIsTrackingActive(true);
    bookingStartTime.current = Date.now();

    // Initialize enhanced console interception
    setupEnhancedConsoleInterception();

    // Initialize OCR worker
    initializeOCR();

    // Take initial screenshot
    takeFullPageScreenshot('page_load');

    trackInteraction({
      type: 'page_load',
      element: 'full_page',
      text: `User arrived at booking page with session: ${sessionId}`
    });

    // Take periodic screenshots to monitor form filling
    const periodicScreenshots = setInterval(() => {
      takeFullPageScreenshot(`periodic_${Date.now()}`);
    }, 15000); // Every 15 seconds

    screenshotInterval.current = periodicScreenshots;

    return () => {
      // Restore original console methods
      Object.keys(originalConsoleMethods.current).forEach(method => {
        if (originalConsoleMethods.current[method]) {
          (console as any)[method] = originalConsoleMethods.current[method];
        }
      });
      
      if (screenshotInterval.current) {
        clearInterval(screenshotInterval.current);
      }
      // Clean up OCR worker
      if (ocrWorker.current) {
        ocrWorker.current.terminate();
      }
    };
  };

  useEffect(() => {
    debugLog('🚀 Full Page Screenshot Tracker initialized with session', { sessionId, enableDebugMode });
    
    window.addEventListener('message', handlePostMessage);
    const cleanupTracking = setupFullPageTracking();
    
    return () => {
      window.removeEventListener('message', handlePostMessage);
      cleanupTracking();
    };
  }, [sessionId, enableDebugMode]);

  if (!enableDebugMode) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-black/90 text-white p-4 rounded-lg text-xs font-mono z-50 max-w-sm">
      <div className="font-bold text-green-400 mb-2">📸 FULL PAGE TRACKER</div>
      <div className="space-y-1">
        <div>Session: {sessionId.substring(0, 12)}...</div>
        <div className="text-blue-300 text-xs">
          🔒 Fingerprint: {debugStats.sessionFingerprint}
        </div>
        <div className={`${isTrackingActive ? 'text-green-400' : 'text-red-400'}`}>
          Status: {isTrackingActive ? '✅ Active' : '❌ Waiting'}
        </div>
        <div>Screenshots: {debugStats.screenshotsTaken}</div>
        <div className="text-blue-300">
          PostMessages: {debugStats.messageEventsReceived}
        </div>
        <div className={`${debugStats.ocrInProgress ? 'text-yellow-400' : 'text-green-400'}`}>
          OCR: {debugStats.ocrInProgress ? '🔄 Processing...' : `✅ ${debugStats.ocrAnalyzed} analyzed`}
        </div>
        <div>Time on page: {debugStats.bookingPageTime}s</div>
        <div className={`${debugStats.confidenceScore > 0.7 ? 'text-green-400' : debugStats.confidenceScore > 0.4 ? 'text-yellow-400' : 'text-red-400'}`}>
          Confidence: {(debugStats.confidenceScore * 100).toFixed(1)}%
        </div>
        <div className={`${debugStats.contactFormFilled ? 'text-green-300 font-bold' : 'text-gray-400'}`}>
          📝 FORM: {debugStats.contactFormFilled ? '✅ DETECTED!' : '⏳ Monitoring'}
        </div>
        <div className={`${debugStats.nameFieldDetected ? 'text-green-300' : 'text-gray-400'}`}>
          👤 Name: {debugStats.nameFieldDetected ? `✅ ${debugStats.clientName.substring(0, 15)}` : '❌'}
        </div>
        <div className={`${debugStats.emailFieldDetected ? 'text-green-300' : 'text-gray-400'}`}>
          📧 Email: {debugStats.emailFieldDetected ? `✅ ${debugStats.clientEmail.substring(0, 15)}` : '❌'}
        </div>
        <div className={`${debugStats.phoneFieldDetected ? 'text-green-300' : 'text-gray-400'}`}>
          📱 Phone: {debugStats.phoneFieldDetected ? `✅ ${debugStats.clientPhone}` : '❌'}
        </div>
        <div className={`${debugStats.clientAddress ? 'text-green-300' : 'text-gray-400'}`}>
          🏠 Address: {debugStats.clientAddress ? `✅ ${debugStats.clientAddress.substring(0, 15)}` : '❌'}
        </div>
        <div className={`${debugStats.acceptEmailMarketing ? 'text-green-300' : debugStats.acceptSmsMarketing ? 'text-yellow-300' : 'text-gray-400'}`}>
          📬 Marketing: {debugStats.acceptEmailMarketing ? '✅ Email' : debugStats.acceptSmsMarketing ? '✅ SMS' : '❌'}
        </div>
        <div className={`${debugStats.hasSuccessGreen ? 'text-green-300 font-bold' : 'text-gray-400'}`}>
          🎨 Green Signal: {debugStats.hasSuccessGreen ? `✅ KYLLÄ (${debugStats.greenPercentage}%)` : '❌ EI'}
        </div>
        <div className={`${debugStats.consoleConversionDetected || debugStats.ocrColorConversionDetected ? 'text-green-300 font-bold animate-pulse' : debugStats.conversionDetected ? 'text-green-300' : 'text-gray-400'}`}>
          Conversion: {debugStats.consoleConversionDetected ? '🎯 CONSOLE!' : debugStats.ocrColorConversionDetected ? '🎨 OCR+COLOR!' : debugStats.conversionDetected ? '✅ Detected' : '⏳ Monitoring'}
        </div>
        <div className={`${debugStats.timmaFormDataDetected ? 'text-green-300 font-bold' : 'text-gray-400'}`}>
          🎯 TIMMA: {debugStats.timmaFormDataDetected ? '✅ CLIENT DATA!' : '⏳ Listening'}
        </div>
        <div className="text-blue-300">
          Step: {debugStats.currentStepNumber}/4 ({debugStats.currentBookingStep.substring(0, 15)})
        </div>
        {debugStats.lastScreenshotUrl && (
          <div className="text-yellow-300 text-xs">
            Last: {debugStats.lastScreenshotUrl.substring(20, 40)}...
          </div>
        )}
        {debugStats.lastFormData && (
          <div className="text-green-300 text-xs border-t border-green-600 pt-1 mt-1">
            Client: {debugStats.lastFormData.clientName?.substring(0, 20)}
          </div>
        )}
      </div>
    </div>
  );
};

export default FullPageScreenshotTracker;
