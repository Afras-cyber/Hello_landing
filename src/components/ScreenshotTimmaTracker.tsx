import React, { useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import html2canvas from 'html2canvas';
import { createWorker } from 'tesseract.js';

interface ScreenshotTimmaTrackerProps {
  sessionId: string;
  enableDebugMode?: boolean;
}

interface BookingStepData {
  [key: string]: string | undefined;
  step: string;
  service?: string;
  specialist?: string;
  date?: string;
  time?: string;
  price?: string;
  duration?: string;
}

// Browser fingerprinting for unique session creation
const generateBrowserFingerprint = (): string => {
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
};

const ScreenshotTimmaTracker: React.FC<ScreenshotTimmaTrackerProps> = ({ 
  sessionId: propSessionId, 
  enableDebugMode = false 
}) => {
  // Create unique session ID per browser tab/session with enhanced uniqueness
  const [sessionId] = useState(() => {
    // Check if there's a session parameter in URL
    const urlParams = new URLSearchParams(window.location.search);
    const urlSessionId = urlParams.get('session') || urlParams.get('$session');
    
    if (urlSessionId && urlSessionId.length > 10) {
      console.log('📸 Using URL session ID:', urlSessionId);
      return urlSessionId;
    }
    
    // Generate truly unique session ID
    const browserFingerprint = generateBrowserFingerprint();
    const timestamp = Date.now();
    const randomUuid = crypto.randomUUID();
    const randomSuffix = Math.random().toString(36).substr(2, 12);
    const tabId = Math.random().toString(36).substr(2, 8);
    
    // Combine multiple sources of entropy
    const uniqueId = `session_${timestamp}_${randomUuid}_${browserFingerprint}_${tabId}_${randomSuffix}`;
    
    // Store in sessionStorage (tab-specific)
    const storageKey = `timma_screenshot_session_${Date.now()}`;
    sessionStorage.setItem(storageKey, uniqueId);
    
    // Add session to URL if not already present
    const currentUrl = new URL(window.location.href);
    if (!currentUrl.searchParams.has('$session')) {
      currentUrl.searchParams.set('$session', uniqueId);
      // Update URL without page reload
      window.history.replaceState({}, '', currentUrl.toString());
    }
    
    console.log('📸 Generated NEW unique session ID:', uniqueId);
    console.log('📸 Browser fingerprint:', browserFingerprint);
    console.log('📸 Updated URL with session:', currentUrl.toString());
    
    return uniqueId;
  });

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
    valmisDetected: false,
    ocrInProgress: false,
    lastOcrText: '',
    formSubmissionDetected: false,
    currentStepNumber: 1,
    lastFormData: null as any,
    iframeFound: false,
    iframeUrl: '',
    formDataDetected: false,
    messageEventsReceived: 0,
    sessionFingerprint: generateBrowserFingerprint().substring(0, 8)
  });
  
  const iframeInteractionCount = useRef(0);
  const bookingStartTime = useRef<number | null>(null);
  const lastIframeHeight = useRef<number>(0);
  const lastIframeUrl = useRef<string>('');
  const bookingSteps = useRef<BookingStepData[]>([]);
  const screenshotInterval = useRef<NodeJS.Timeout | null>(null);
  const valmisCheckInterval = useRef<NodeJS.Timeout | null>(null);
  const formCheckInterval = useRef<NodeJS.Timeout | null>(null);
  const ocrWorker = useRef<any>(null);
  const lastFormDataHash = useRef<string>('');
  const { toast } = useToast();

  const debugLog = (message: string, data?: any) => {
    if (enableDebugMode) {
      console.log(`📸 IFRAME SCREENSHOT DEBUG: ${message}`, data || '');
    }
  };

  // Enhanced form data detection with immediate conversion handling
  const detectFormDataInConsole = () => {
    // Store original console methods
    const originalLog = console.log;
    const originalInfo = console.info;
    const originalWarn = console.warn;
    const originalError = console.error;
    
    // Enhanced form data detection function
    const checkForFormData = (args: any[]) => {
      for (const arg of args) {
        if (arg && typeof arg === 'object') {
          // Check if this looks like Timma form data
          if ((arg.clientName || arg.clientEmail || arg.clientPhone) && 
              (arg.clientAddress || arg.clientCity || arg.clientPostalCode)) {
            
            const formDataString = JSON.stringify(arg);
            const currentHash = btoa(formDataString).substring(0, 12);
            
            if (currentHash !== lastFormDataHash.current) {
              lastFormDataHash.current = currentHash;
              debugLog('📝 FORM DATA DETECTED IN CONSOLE!', arg);
              
              setDebugStats(prev => ({
                ...prev,
                formDataDetected: true,
                lastFormData: arg,
                conversionDetected: true,
                currentBookingStep: 'form_data_captured',
                confidenceScore: 0.98,
                formSubmissionDetected: true
              }));
              
              // Immediate conversion handling
              handleFormSubmissionConversion({
                detectionMethod: 'console_form_data_enhanced',
                confidence: 0.98,
                formData: arg,
                sessionId: sessionId
              });
              
              // Take screenshot immediately
              setTimeout(() => {
                takeIframeScreenshot('form_data_detected_console');
              }, 100);
              
              if (enableDebugMode) {
                toast({
                  title: "🎉 TIMMA FORM DATA DETECTED!",
                  description: `Client: ${arg.clientName || 'Unknown'} - ${arg.clientEmail || 'No email'}`,
                  duration: 10000,
                });
              }
            }
          }
        }
      }
    };
    
    // Override all console methods
    console.log = (...args) => {
      originalLog(...args);
      checkForFormData(args);
    };
    
    console.info = (...args) => {
      originalInfo(...args);  
      checkForFormData(args);
    };
    
    console.warn = (...args) => {
      originalWarn(...args);
      checkForFormData(args);
    };
    
    console.error = (...args) => {
      originalError(...args);
      checkForFormData(args);
    };
    
    debugLog('📝 Enhanced console monitoring activated for session:', sessionId);
  };

  // Find Timma iframe
  const findTimmaIframe = (): HTMLIFrameElement | null => {
    const iframes = document.querySelectorAll('iframe') as NodeListOf<HTMLIFrameElement>;
    
    for (const iframe of iframes) {
      if (iframe.src.includes('timma.fi') || 
          iframe.src.includes('varaa.timma.fi') ||
          iframe.id.includes('timma') ||
          iframe.className.includes('timma')) {
        debugLog('🎯 Found Timma iframe:', iframe.src);
        setDebugStats(prev => ({
          ...prev,
          iframeFound: true,
          iframeUrl: iframe.src
        }));
        return iframe;
      }
    }
    
    debugLog('⚠️ No Timma iframe found');
    setDebugStats(prev => ({
      ...prev,
      iframeFound: false,
      iframeUrl: ''
    }));
    return null;
  };

  // Initialize OCR worker
  const initializeOCR = async () => {
    try {
      debugLog('🔍 Initializing OCR worker for iframe content...');
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

  // Take screenshot of ONLY the Timma iframe
  const takeIframeScreenshot = async (reason: string): Promise<string | null> => {
    try {
      const iframe = findTimmaIframe();
      if (!iframe) {
        debugLog('❌ Cannot take screenshot: Timma iframe not found');
        return null;
      }

      debugLog(`📸 Taking IFRAME-ONLY screenshot for: ${reason}`);
      
      // Get iframe position and dimensions
      const iframeRect = iframe.getBoundingClientRect();
      
      if (iframeRect.width === 0 || iframeRect.height === 0) {
        debugLog('❌ Iframe has zero dimensions, skipping screenshot');
        return null;
      }

      // Take screenshot of only the iframe area
      const canvas = await html2canvas(iframe, {
        useCORS: true,
        allowTaint: true,
        scale: 0.7,
        backgroundColor: '#ffffff',
        width: iframeRect.width,
        height: iframeRect.height,
        scrollX: 0,
        scrollY: 0,
        x: 0,
        y: 0
      });

      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => resolve(blob!), 'image/jpeg', 0.9);
      });

      const timestamp = Date.now();
      const filename = `iframe_screenshot_${sessionId}_${timestamp}.jpg`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('screenshots')
        .upload(filename, blob, {
          contentType: 'image/jpeg',
          upsert: false
        });

      if (uploadError) {
        console.error('Iframe screenshot upload error:', uploadError);
        return null;
      }

      const screenshotUrl = `screenshots/${filename}`;
      debugLog('✅ Iframe screenshot uploaded successfully', { screenshotUrl, dimensions: `${iframeRect.width}x${iframeRect.height}` });

      setScreenshotCount(prev => prev + 1);
      setDebugStats(prev => ({
        ...prev,
        screenshotsTaken: prev.screenshotsTaken + 1,
        lastScreenshotUrl: screenshotUrl
      }));

      // Analyze iframe screenshot with OCR only if it makes sense
      if (reason.includes('form_submitted') || reason.includes('confirmation') || reason.includes('valmis') || reason.includes('form_data')) {
        await analyzeIframeScreenshotWithOCR(screenshotUrl, reason);
      }

      return screenshotUrl;
      
    } catch (error) {
      console.error('❌ Iframe screenshot error:', error);
      return null;
    }
  };

  // OCR analysis focused on iframe content only
  const analyzeIframeScreenshotWithOCR = async (screenshotUrl: string, reason: string) => {
    try {
      if (!ocrWorker.current) {
        debugLog('⚠️ OCR worker not initialized, initializing now...');
        await initializeOCR();
      }

      setDebugStats(prev => ({
        ...prev,
        ocrInProgress: true
      }));

      debugLog('🔍 Starting iframe-focused OCR analysis', { screenshotUrl, reason });
      
      const { data: urlData } = await supabase.storage
        .from('screenshots')
        .createSignedUrl(screenshotUrl.replace('screenshots/', ''), 300);

      if (!urlData?.signedUrl) {
        debugLog('❌ Failed to get signed URL for iframe screenshot');
        return;
      }

      debugLog('📥 Downloading iframe screenshot for OCR analysis...');
      
      const { data: { text } } = await ocrWorker.current.recognize(urlData.signedUrl);
      
      debugLog('✅ Iframe OCR completed successfully', { textLength: text.length });
      console.log('🔍 IFRAME TUNNISTETTU TEKSTI:', text);
      
      setDebugStats(prev => ({
        ...prev,
        ocrInProgress: false,
        lastOcrText: text.substring(0, 200) + (text.length > 200 ? '...' : '')
      }));

      // Analyze only iframe-specific content
      const extractedData = {
        services: [] as string[],
        prices: [] as number[],
        totalAmount: 0,
        customerName: '',
        customerEmail: '',
        customerPhone: '',
        appointmentDate: '',
        appointmentTime: '',
        location: '',
        confirmationDetected: false,
        valmisDetected: false,
        formSubmissionDetected: false,
        stepDetected: 0,
        confidenceScore: 0
      };

      // Enhanced form submission detection for Timma iframe
      const timmaFormKeywords = [
        'täytä tiedot', 'yhteystiedot', 'nimi', 'sähköposti', 'puhelinnumero',
        'contact details', 'name', 'email', 'phone', 'lähetä', 'vahvista',
        'submit', 'confirm', 'tallenna', 'save', 'varaa aika', 'book now'
      ];

      // Timma-specific step detection
      const timmaStepKeywords = [
        { step: 1, keywords: ['valitse palvelu', 'choose service', 'palvelu'] },
        { step: 2, keywords: ['valitse aika', 'choose time', 'kalenteri', 'calendar'] },
        { step: 3, keywords: ['täytä tiedot', 'contact info', 'yhteystiedot'] },
        { step: 4, keywords: ['valmis', 'vahvistettu', 'confirmed', 'ready'] }
      ];

      // Timma booking confirmation detection
      const timmaConfirmationKeywords = [
        'varauksesi on vahvistettu',
        'varaus vahvistettu',
        'kiitos varauksesta',
        'aika varattu onnistuneesti',
        'varaus onnistui',
        'booking confirmed',
        'appointment confirmed',
        'thank you for booking'
      ];

      const lowerText = text.toLowerCase();
      let foundKeywords = [];

      // Check for Timma form submission indicators
      const hasTimmaFormKeywords = timmaFormKeywords.some(keyword => 
        lowerText.includes(keyword.toLowerCase())
      );
      if (hasTimmaFormKeywords) {
        extractedData.formSubmissionDetected = true;
        foundKeywords.push('timma_form_detected');
      }

      // Detect current Timma booking step
      for (const stepInfo of timmaStepKeywords) {
        const hasStepKeywords = stepInfo.keywords.some(keyword => 
          lowerText.includes(keyword.toLowerCase())
        );
        if (hasStepKeywords) {
          extractedData.stepDetected = stepInfo.step;
          foundKeywords.push(`timma_step_${stepInfo.step}`);
          break;
        }
      }

      // Check for Timma booking confirmations
      for (const keyword of timmaConfirmationKeywords) {
        if (lowerText.includes(keyword.toLowerCase())) {
          foundKeywords.push(keyword);
          extractedData.confirmationDetected = true;
        }
      }

      // Check for "Valmis" status in Timma
      if (lowerText.includes('valmis') && (lowerText.includes('varaus') || lowerText.includes('booking'))) {
        extractedData.valmisDetected = true;
        extractedData.confirmationDetected = true;
        foundKeywords.push('timma_valmis_status');
      }

      // Extract Timma prices (€ symbol)
      const priceMatches = text.match(/\d+[,.]?\d*\s*€/g);
      if (priceMatches) {
        extractedData.prices = priceMatches.map(price => 
          parseFloat(price.replace('€', '').replace(',', '.').trim())
        ).filter(price => !isNaN(price) && price > 0);
        
        if (extractedData.prices.length > 0) {
          extractedData.totalAmount = extractedData.prices.reduce((sum, price) => sum + price, 0);
        }
      }

      // Extract appointment details from Timma
      const dateMatch = text.match(/(\d{1,2})\.\s*([a-zA-ZäöåÄÖÅ]+)\s*(\d{4})/i);
      if (dateMatch) {
        extractedData.appointmentDate = `${dateMatch[1]}. ${dateMatch[2]} ${dateMatch[3]}`;
      }

      const timeMatch = text.match(/klo\s*(\d{1,2}[:.]\d{2}(?:\s*[-–]\s*\d{1,2}[:.]\d{2})?)/i);
      if (timeMatch) {
        extractedData.appointmentTime = timeMatch[1];
      }

      // Extract Timma service names
      const serviceLines = text.split('\n').filter(line => 
        line.includes('€') && line.length > 5 && !line.includes('Blondify')
      );
      
      extractedData.services = serviceLines.map(line => 
        line.replace(/\d+[,.]?\d*\s*€.*/, '').trim()
      ).filter(service => service.length > 2);

      // Calculate confidence score for Timma iframe
      if (extractedData.confirmationDetected) {
        extractedData.confidenceScore = 0.95;
        if (extractedData.valmisDetected) extractedData.confidenceScore = 0.99;
      } else if (extractedData.formSubmissionDetected && extractedData.stepDetected >= 3) {
        extractedData.confidenceScore = 0.85;
      } else if (extractedData.stepDetected > 0) {
        extractedData.confidenceScore = 0.3 + (extractedData.stepDetected * 0.15);
      }

      if (extractedData.prices.length > 0) extractedData.confidenceScore += 0.05;
      if (extractedData.appointmentDate) extractedData.confidenceScore += 0.05;

      console.log('📋 IFRAME OCR ANALYSIS RESULTS:', {
        foundKeywords,
        confirmationDetected: extractedData.confirmationDetected,
        valmisDetected: extractedData.valmisDetected,
        formSubmissionDetected: extractedData.formSubmissionDetected,
        stepDetected: extractedData.stepDetected,
        confidenceScore: extractedData.confidenceScore,
        services: extractedData.services,
        prices: extractedData.prices,
        totalAmount: extractedData.totalAmount,
        appointmentDate: extractedData.appointmentDate,
        appointmentTime: extractedData.appointmentTime
      });
      
      // Store iframe OCR results in database
      const { data: analysisData, error: analysisError } = await supabase
        .rpc('analyze_screenshot_conversion', {
          p_session_id: sessionId,
          p_screenshot_path: screenshotUrl,
          p_ocr_text: text,
          p_extracted_data: {
            analysis_reason: reason,
            screenshot_type: 'iframe_only',
            iframe_focused: true,
            canvas_dimensions: { width: 'iframe', height: 'iframe' },
            screenshot_timestamp: new Date().toISOString(),
            extracted_booking_details: extractedData,
            valmis_detected: extractedData.valmisDetected,
            form_submission_detected: extractedData.formSubmissionDetected,
            step_detected: extractedData.stepDetected,
            found_keywords: foundKeywords,
            ocr_confidence: extractedData.confidenceScore,
            timma_specific: true
          }
        });

      if (analysisError) {
        console.error('❌ Iframe OCR analysis storage error:', analysisError);
      } else {
        console.log('✅ Iframe OCR analysis stored successfully!', analysisData);
      }
      
      setDebugStats(prev => ({
        ...prev,
        ocrAnalyzed: prev.ocrAnalyzed + 1,
        confidenceScore: Math.max(prev.confidenceScore, extractedData.confidenceScore),
        detectedServices: extractedData.services,
        extractedPrices: extractedData.prices,
        totalAmount: extractedData.totalAmount,
        appointmentDate: extractedData.appointmentDate,
        appointmentTime: extractedData.appointmentTime,
        conversionDetected: extractedData.confirmationDetected || extractedData.formSubmissionDetected,
        valmisDetected: extractedData.valmisDetected,
        formSubmissionDetected: extractedData.formSubmissionDetected,
        currentStepNumber: extractedData.stepDetected || prev.currentStepNumber
      }));

      // Handle form submission conversion
      if (extractedData.formSubmissionDetected && !debugStats.conversionDetected) {
        await handleFormSubmissionConversion({
          detectionMethod: 'iframe_form_submission_ocr',
          confidence: extractedData.confidenceScore,
          stepDetected: extractedData.stepDetected,
          ocrText: text,
          foundKeywords
        });

        if (enableDebugMode) {
          toast({
            title: "📝 Timma Form Submission Detected!",
            description: `OCR detected form submission in iframe at step ${extractedData.stepDetected}`,
            duration: 8000,
          });
        }
      }

      // Handle booking confirmation
      if (extractedData.confirmationDetected) {
        await handleBookingConfirmation({
          detectionMethod: 'iframe_ocr_text_analysis',
          confidence: extractedData.confidenceScore,
          valmisDetected: extractedData.valmisDetected,
          ocrText: text,
          foundKeywords
        });

        if (enableDebugMode) {
          toast({
            title: extractedData.valmisDetected ? "🎉 TIMMA VALMIS Detected!" : "🎉 Timma Booking Confirmed!",
            description: `Iframe OCR detected: ${foundKeywords.join(', ')}`,
            duration: 8000,
          });
        }
      }
      
    } catch (error) {
      console.error('❌ Iframe OCR analysis error:', error);
      setDebugStats(prev => ({
        ...prev,
        ocrInProgress: false
      }));
    }
  };

  // New function to handle form submission conversion
  const handleFormSubmissionConversion = async (formData?: any) => {
    debugLog('📝 TIMMA FORM SUBMISSION CONVERSION DETECTED!', formData);
    
    const formSubmissionStep: BookingStepData = {
      step: 'timma_form_submitted_with_data',
      service: formData?.formData?.service || 'Unknown service',
      specialist: formData?.formData?.specialist || 'Unknown specialist'
    };
    
    await trackInteraction({
      type: 'timma_form_submission_conversion',
      element: 'timma_contact_form',
      text: 'Timma contact form submitted - conversion detected via form data',
      bookingStep: formSubmissionStep
    });

    try {
      const { error } = await supabase.from('booking_conversions').upsert({
        session_id: sessionId,
        booking_confirmation_detected: true,
        estimated_conversion: true,
        confidence_score: formData?.confidence || 0.95,
        iframe_interactions: iframeInteractionCount.current,
        booking_page_time: bookingStartTime.current 
          ? Math.floor((Date.now() - bookingStartTime.current) / 1000)
          : 0,
        utm_source: new URLSearchParams(window.location.search).get('utm_source'),
        utm_medium: new URLSearchParams(window.location.search).get('utm_medium'),
        utm_campaign: new URLSearchParams(window.location.search).get('utm_campaign'),
        success_indicators: JSON.stringify({
          booking_steps: bookingSteps.current,
          final_booking: formSubmissionStep,
          form_submission_detected: true,
          detection_method: formData?.detectionMethod || 'form_data_console',
          form_data: formData?.formData || {},
          iframe_focused: true,
          timma_specific: true,
          session_fingerprint: debugStats.sessionFingerprint
        })
      });

      if (error) {
        console.error('Error creating Timma form submission conversion:', error);
      } else {
        debugLog('✅ Timma form submission conversion record created successfully');
        
        setDebugStats(prev => ({
          ...prev,
          conversionDetected: true,
          formSubmissionDetected: true,
          currentBookingStep: 'timma_form_submitted'
        }));

        // Take screenshot after form submission detection
        await takeIframeScreenshot('form_submission_confirmed');
      }
    } catch (error) {
      console.error('Error in handleFormSubmissionConversion:', error);
    }
  };

  // Enhanced message handler
  const handleMessage = (event: MessageEvent) => {
    // Only handle messages from Timma domain
    if (!event.origin.includes('timma.fi') && event.origin !== window.location.origin) {
      return;
    }

    debugLog('Received Timma iframe message:', event.data);
    
    setDebugStats(prev => ({
      ...prev,
      messageEventsReceived: prev.messageEventsReceived + 1
    }));

    const data = event.data;
    
    if (data && typeof data === 'object') {
      // Check for form submission data
      if (data.type === 'form_submit' || data.type === 'form_submission' || data.clientName) {
        debugLog('📝 Timma form submission message received!', data);
        handleFormSubmissionConversion({
          detectionMethod: 'timma_iframe_message',
          confidence: 0.9,
          formData: data
        });
        takeIframeScreenshot('timma_form_submission_message');
      }
      
      if (data.type === 'booking_confirmation') {
        takeIframeScreenshot('timma_booking_confirmation_message');
        handleBookingConfirmation({
          detectionMethod: 'timma_message',
          confidence: 0.9
        });
      }
      
      trackInteraction({
        type: data.type || 'timma_iframe_message',
        element: data.element,
        text: data.text,
        x: data.x,
        y: data.y,
        iframeUrl: event.origin
      });
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
      debugLog('Tracking Timma iframe interaction', interactionData);
      
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
          screenshot_tracking: true,
          iframe_focused: true,
          timma_specific: true,
          valmis_detected: debugStats.valmisDetected,
          form_submission_detected: debugStats.formSubmissionDetected,
          session_fingerprint: debugStats.sessionFingerprint
        }
      });

      if (error) {
        console.error('❌ Error tracking Timma iframe interaction:', error);
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

      debugLog('Timma iframe interaction tracked successfully', {
        interactionId: data,
        totalInteractions: iframeInteractionCount.current,
        timeOnPage,
        bookingStep: interactionData.bookingStep
      });

      if (interactionData.type === 'timma_booking_confirmation' || 
          interactionData.type === 'timma_form_fill' ||
          interactionData.type === 'timma_form_submission_conversion' ||
          interactionData.type === 'timma_valmis_detected' ||
          interactionData.bookingStep?.step === 'timma_booking_confirmed') {
        await takeIframeScreenshot(`timma_interaction_${interactionData.type}`);
      }

    } catch (error) {
      console.error('❌ Error in trackInteraction:', error);
    }
  };

  const handleBookingConfirmation = async (bookingData?: any) => {
    debugLog('🎉 TIMMA BOOKING CONFIRMATION DETECTED!', bookingData);
    
    const finalBookingStep: BookingStepData = {
      step: bookingData?.valmisDetected ? 'timma_valmis_confirmed' : 'timma_booking_confirmed',
      service: bookingData?.service || debugStats.detectedServices[0],
      date: bookingData?.date,
      time: bookingData?.time,
      specialist: bookingData?.specialist,
      price: bookingData?.price
    };
    
    await trackInteraction({
      type: 'timma_booking_confirmation',
      element: 'timma_confirmation_page',
      text: bookingData?.valmisDetected ? 'Timma Valmis status confirmed' : 'Timma booking confirmed successfully',
      bookingStep: finalBookingStep
    });

    try {
      const { error } = await supabase.from('booking_conversions').upsert({
        session_id: sessionId,
        booking_confirmation_detected: true,
        estimated_conversion: true,
        confidence_score: bookingData?.valmisDetected ? 0.99 : 0.95,
        iframe_interactions: iframeInteractionCount.current,
        booking_page_time: bookingStartTime.current 
          ? Math.floor((Date.now() - bookingStartTime.current) / 1000)
          : 0,
        utm_source: new URLSearchParams(window.location.search).get('utm_source'),
        utm_medium: new URLSearchParams(window.location.search).get('utm_medium'),
        utm_campaign: new URLSearchParams(window.location.search).get('utm_campaign'),
        success_indicators: JSON.stringify({
          booking_steps: bookingSteps.current,
          detected_services: debugStats.detectedServices,
          final_booking: finalBookingStep,
          valmis_detected: bookingData?.valmisDetected || false,
          form_submission_detected: debugStats.formSubmissionDetected,
          detection_method: bookingData?.detectionMethod || 'timma_standard',
          ocr_keywords: bookingData?.foundKeywords || [],
          iframe_focused: true,
          timma_specific: true,
          session_fingerprint: debugStats.sessionFingerprint
        })
      });

      if (error) {
        console.error('Error creating Timma booking conversion:', error);
      } else {
        debugLog('✅ Timma booking conversion record created successfully');
      }
    } catch (error) {
      console.error('Error in handleBookingConfirmation:', error);
    }
  };

  const setupTimmaIframeTracking = () => {
    debugLog('🎯 Setting up enhanced Timma iframe tracking with unique session:', sessionId);
    setIsTrackingActive(true);
    bookingStartTime.current = Date.now();

    // Initialize console monitoring for form data
    detectFormDataInConsole();

    // Initialize OCR worker
    initializeOCR();

    // Take initial iframe screenshot
    takeIframeScreenshot('timma_iframe_page_load');

    trackInteraction({
      type: 'timma_iframe_page_load',
      element: 'timma_booking_iframe',
      text: `User arrived at Timma booking iframe with unique session: ${sessionId}`
    });

    // Monitor iframe changes less frequently since we focus on form data
    const periodicScreenshots = setInterval(() => {
      takeIframeScreenshot(`timma_periodic_${Date.now()}`);
    }, 30000); // Every 30 seconds

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
      clearInterval(periodicScreenshots);
      if (valmisCheckInterval.current) {
        clearInterval(valmisCheckInterval.current);
      }
      if (formCheckInterval.current) {
        clearInterval(formCheckInterval.current);
      }
      // Clean up OCR worker
      if (ocrWorker.current) {
        ocrWorker.current.terminate();
      }
    };
  };

  useEffect(() => {
    debugLog('🚀 Enhanced Timma Form Data Tracker initialized with unique session', { sessionId, enableDebugMode });
    
    const cleanup = setupTimmaIframeTracking();
    
    return cleanup;
  }, [sessionId, enableDebugMode]);

  if (!enableDebugMode) return null;

  return (
    <div className="fixed bottom-4 left-4 bg-black/90 text-white p-4 rounded-lg text-xs font-mono z-50 max-w-sm">
      <div className="font-bold text-purple-400 mb-2">📸 OCR + FORM TRACKER</div>
      <div className="space-y-1">
        <div>Session: {sessionId.substring(0, 12)}...</div>
        <div className="text-blue-300 text-xs">
          🔒 Fingerprint: {debugStats.sessionFingerprint}
        </div>
        <div className={`${isTrackingActive ? 'text-green-400' : 'text-red-400'}`}>
          Status: {isTrackingActive ? '✅ Active' : '❌ Waiting'}
        </div>
        <div className={`${debugStats.iframeFound ? 'text-green-400' : 'text-red-400'}`}>
          Iframe: {debugStats.iframeFound ? '✅ Found' : '❌ Not Found'}
        </div>
        <div>Screenshots: {debugStats.screenshotsTaken}</div>
        <div className={`${debugStats.ocrInProgress ? 'text-yellow-400' : 'text-green-400'}`}>
          OCR: {debugStats.ocrInProgress ? '🔄 Processing...' : `✅ ${debugStats.ocrAnalyzed} analyzed`}
        </div>
        <div>Interaktiot: {debugStats.totalInteractions}</div>
        <div>Viestit: {debugStats.messageEventsReceived}</div>
        <div>Aika sivulla: {debugStats.bookingPageTime}s</div>
        <div className={`${debugStats.confidenceScore > 0.7 ? 'text-green-400' : debugStats.confidenceScore > 0.4 ? 'text-yellow-400' : 'text-red-400'}`}>
          Luottamus: {(debugStats.confidenceScore * 100).toFixed(1)}%
        </div>
        <div className={`${debugStats.formDataDetected ? 'text-green-300 font-bold' : 'text-gray-400'}`}>
          📝 FORM DATA: {debugStats.formDataDetected ? '✅ DETECTED!' : '⏳ Monitoring'}
        </div>
        <div className={`${debugStats.formSubmissionDetected ? 'text-green-300 font-bold' : 'text-gray-400'}`}>
          📝 FORM: {debugStats.formSubmissionDetected ? '✅ SUBMITTED!' : '⏳ Monitoring'}
        </div>
        <div className={`${debugStats.valmisDetected ? 'text-green-300 font-bold' : 'text-gray-400'}`}>
          🏁 VALMIS: {debugStats.valmisDetected ? '✅ DETECTED!' : '⏳ Monitoring'}
        </div>
        <div className={`${debugStats.conversionDetected ? 'text-green-300' : 'text-gray-400'}`}>
          Konversio: {debugStats.conversionDetected ? '✅ Detected' : '⏳ Monitoring'}
        </div>
        <div className="text-blue-300">
          Vaihe: {debugStats.currentStepNumber}/4 ({debugStats.currentBookingStep})
        </div>
        {debugStats.lastFormData && (
          <div className="text-green-300 text-xs border-t border-gray-600 pt-1 mt-1">
            Form: {debugStats.lastFormData.clientName || 'Unknown'} - {debugStats.lastFormData.clientEmail || 'No email'}
          </div>
        )}
        {debugStats.lastOcrText && (
          <div className="text-pink-300 text-xs border-t border-gray-600 pt-1 mt-1">
            OCR: {debugStats.lastOcrText}
          </div>
        )}
        {debugStats.lastScreenshotUrl && (
          <div className="text-yellow-300 text-xs">
            Last: {debugStats.lastScreenshotUrl.substring(20, 40)}...
          </div>
        )}
      </div>
    </div>
  );
};

export default ScreenshotTimmaTracker;
