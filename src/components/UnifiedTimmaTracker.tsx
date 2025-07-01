
import React, { useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { trackBookingEvent } from '@/utils/gtmTracking';

interface UnifiedTimmaTrackerProps {
  sessionId: string;
  enableDebugMode?: boolean;
}

interface TimmaDetection {
  type: 'console' | 'api' | 'visual' | 'url' | 'form';
  confidence: number;
  data: any;
  timestamp: string;
}

interface TimmaStats {
  totalInteractions: number;
  apiCalls: number;
  urlChanges: number;
  formSubmissions: number;
  visualChanges: number;
  conversionDetected: boolean;
  detections: TimmaDetection[];
  currentUrl: string;
  lastActivity: number;
}

const UnifiedTimmaTracker: React.FC<UnifiedTimmaTrackerProps> = ({ 
  sessionId, 
  enableDebugMode = false 
}) => {
  const [stats, setStats] = useState<TimmaStats>({
    totalInteractions: 0,
    apiCalls: 0,
    urlChanges: 0,
    formSubmissions: 0,
    visualChanges: 0,
    conversionDetected: false,
    detections: [],
    currentUrl: '',
    lastActivity: Date.now()
  });

  const originalFetch = useRef<typeof fetch>();
  const originalConsole = useRef<{
    log: typeof console.log;
    info: typeof console.info;
    warn: typeof console.warn;
    error: typeof console.error;
  }>();
  const intervalRefs = useRef<NodeJS.Timeout[]>([]);
  const observerRefs = useRef<MutationObserver[]>([]);
  const { toast } = useToast();

  const debugLog = (message: string, data?: any) => {
    if (enableDebugMode) {
      console.log(`🎯 UNIFIED TIMMA: ${message}`, data || '');
    }
  };

  // Add detection to stats
  const addDetection = (detection: TimmaDetection) => {
    setStats(prev => ({
      ...prev,
      detections: [...prev.detections.slice(-9), detection], // Keep last 10
      lastActivity: Date.now()
    }));

    if (detection.confidence >= 0.9 && !stats.conversionDetected) {
      handleConversionDetected(detection);
    }
  };

  // Enhanced console monitoring for Timma client data
  const setupConsoleMonitoring = () => {
    debugLog('Setting up enhanced console monitoring');
    
    const originalMethods = {
      log: console.log,
      info: console.info,
      warn: console.warn,
      error: console.error
    };
    
    originalConsole.current = originalMethods;

    const interceptConsole = (methodName: keyof typeof originalMethods, originalMethod: Function) => {
      (console as any)[methodName] = (...args: any[]) => {
        originalMethod.apply(console, args);
        
        // Process arguments for Timma booking data
        args.forEach((arg, index) => {
          if (arg && typeof arg === 'object') {
            // Enhanced Timma client data detection
            if (isTimmaClientData(arg)) {
              const detection: TimmaDetection = {
                type: 'console',
                confidence: 1.0,
                data: {
                  method: methodName,
                  clientData: sanitizeClientData(arg),
                  argIndex: index
                },
                timestamp: new Date().toISOString()
              };
              
              debugLog(`🎉 Timma client data detected via console.${methodName}`, detection);
              addDetection(detection);
            }
            
            // Look for booking confirmation messages
            const objStr = JSON.stringify(arg).toLowerCase();
            if (objStr.includes('booking') && (
              objStr.includes('confirmed') || 
              objStr.includes('success') || 
              objStr.includes('vahvistettu')
            )) {
              addDetection({
                type: 'console',
                confidence: 0.8,
                data: { method: methodName, confirmationData: arg },
                timestamp: new Date().toISOString()
              });
            }
          }
        });
      };
    };

    Object.entries(originalMethods).forEach(([method, original]) => {
      interceptConsole(method as keyof typeof originalMethods, original);
    });
  };

  // Check if object contains Timma client data
  const isTimmaClientData = (obj: any): boolean => {
    const hasName = obj.clientName || obj.name || obj.customer_name;
    const hasContact = obj.clientEmail || obj.email || obj.clientPhone || obj.phone;
    const hasService = obj.service || obj.serviceName || obj.selectedService;
    
    return !!(hasName && hasContact) || !!(hasName && hasService);
  };

  // Sanitize client data for privacy
  const sanitizeClientData = (data: any) => {
    const sanitized = { ...data };
    
    // Mask sensitive data
    if (sanitized.clientEmail || sanitized.email) {
      const email = sanitized.clientEmail || sanitized.email;
      sanitized.maskedEmail = email.substring(0, 3) + '***@***';
      delete sanitized.clientEmail;
      delete sanitized.email;
    }
    
    if (sanitized.clientPhone || sanitized.phone) {
      const phone = sanitized.clientPhone || sanitized.phone;
      sanitized.maskedPhone = phone.substring(0, 5) + '***';
      delete sanitized.clientPhone;
      delete sanitized.phone;
    }

    return sanitized;
  };

  // Monitor Timma API calls
  const setupApiMonitoring = () => {
    debugLog('Setting up Timma API monitoring');
    
    originalFetch.current = window.fetch;
    
    window.fetch = async (...args) => {
      const [url, options] = args;
      const urlString = typeof url === 'string' ? url : url.toString();
      
      if (urlString.includes('timma.fi') || urlString.includes('varaa.timma.fi')) {
        debugLog('Timma API call detected', { url: urlString, method: options?.method });
        
        setStats(prev => ({
          ...prev,
          apiCalls: prev.apiCalls + 1,
          totalInteractions: prev.totalInteractions + 1
        }));

        try {
          const response = await originalFetch.current!(...args);
          const clonedResponse = response.clone();
          
          // Check booking endpoints
          if (urlString.includes('booking') || urlString.includes('reservation') || urlString.includes('varaa')) {
            try {
              const responseData = await clonedResponse.json();
              debugLog('Booking API response', responseData);
              
              if (responseData.success || responseData.confirmed || responseData.id) {
                addDetection({
                  type: 'api',
                  confidence: 0.95,
                  data: { url: urlString, response: responseData },
                  timestamp: new Date().toISOString()
                });
              }
            } catch (e) {
              debugLog('Non-JSON API response');
            }
          }
          
          return response;
        } catch (error) {
          debugLog('API request failed', error);
          throw error;
        }
      }
      
      return originalFetch.current!(...args);
    };
  };

  // Monitor iframe URL changes and visual indicators
  const setupIframeMonitoring = () => {
    debugLog('Setting up iframe monitoring');
    
    const checkIframes = () => {
      const timmaIframes = document.querySelectorAll('iframe[src*="timma"], iframe[src*="varaa.timma.fi"]') as NodeListOf<HTMLIFrameElement>;
      
      timmaIframes.forEach((iframe, index) => {
        try {
          // Monitor src changes
          const currentSrc = iframe.src;
          if (currentSrc !== stats.currentUrl) {
            setStats(prev => ({
              ...prev,
              currentUrl: currentSrc,
              urlChanges: prev.urlChanges + 1
            }));

            // Check for success URLs
            if (currentSrc.includes('success') || 
                currentSrc.includes('confirmation') || 
                currentSrc.includes('vahvistus') ||
                currentSrc.includes('kiitos')) {
              addDetection({
                type: 'url',
                confidence: 0.9,
                data: { url: currentSrc, iframeIndex: index },
                timestamp: new Date().toISOString()
              });
            }
          }

          // Try to access iframe content for visual detection
          try {
            const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
            if (iframeDoc) {
              const bodyText = iframeDoc.body.textContent?.toLowerCase() || '';
              
              // Finnish booking confirmation keywords
              const confirmationKeywords = [
                'varauksesi on vahvistettu',
                'varaus vahvistettu',
                'kiitos varauksesta',
                'aika varattu',
                'booking confirmed',
                'vahvistettu'
              ];

              const hasConfirmation = confirmationKeywords.some(keyword => 
                bodyText.includes(keyword)
              );

              if (hasConfirmation) {
                addDetection({
                  type: 'visual',
                  confidence: 0.95,
                  data: { bodyText: bodyText.substring(0, 200), iframeIndex: index },
                  timestamp: new Date().toISOString()
                });
              }

              // Monitor background color changes (light = success page)
              const bgColor = window.getComputedStyle(iframeDoc.body).backgroundColor;
              const rgbMatch = bgColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
              if (rgbMatch) {
                const [, r, g, b] = rgbMatch.map(Number);
                const isLight = r > 200 && g > 200 && b > 200;
                
                if (isLight) {
                  setStats(prev => ({
                    ...prev,
                    visualChanges: prev.visualChanges + 1
                  }));
                }
              }
            }
          } catch (error) {
            // Cross-origin access blocked - expected
          }
        } catch (error) {
          debugLog('Iframe monitoring error', error);
        }
      });
    };

    // Set up periodic iframe checking
    const interval = setInterval(checkIframes, 2000);
    intervalRefs.current.push(interval);
  };

  // Monitor DOM mutations for form submissions
  const setupFormMonitoring = () => {
    debugLog('Setting up form monitoring');
    
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element;
              
              // Check for new forms or form elements
              const forms = element.querySelectorAll?.('form') || [];
              if (forms.length > 0 || element.tagName === 'FORM') {
                setStats(prev => ({
                  ...prev,
                  formSubmissions: prev.formSubmissions + 1
                }));
                
                debugLog('New form detected');
              }

              // Check for success indicators
              const successElements = element.querySelectorAll?.(
                '[class*="success"], [class*="confirmed"], [class*="vahvistettu"]'
              ) || [];
              
              if (successElements.length > 0) {
                addDetection({
                  type: 'visual',
                  confidence: 0.8,
                  data: { successElements: successElements.length },
                  timestamp: new Date().toISOString()
                });
              }
            }
          });
        }
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'id']
    });

    observerRefs.current.push(observer);
  };

  // Handle conversion detection
  const handleConversionDetected = async (detection: TimmaDetection) => {
    if (stats.conversionDetected) return;

    debugLog('🎉 CONVERSION DETECTED!', detection);
    
    setStats(prev => ({
      ...prev,
      conversionDetected: true
    }));

    // Track interaction
    try {
      await supabase.rpc('track_iframe_interaction', {
        p_session_id: sessionId,
        p_interaction_type: 'unified_conversion_detected',
        p_element_selector: `${detection.type}_detection`,
        p_element_text: `Unified Timma conversion via ${detection.type}`,
        p_timestamp_offset: Math.floor((Date.now() - stats.lastActivity) / 1000),
        p_interaction_data: {
          detection_method: detection.type,
          confidence: detection.confidence,
          detection_data: detection.data,
          all_detections: stats.detections.length,
          stats: {
            totalInteractions: stats.totalInteractions,
            apiCalls: stats.apiCalls,
            urlChanges: stats.urlChanges,
            formSubmissions: stats.formSubmissions,
            visualChanges: stats.visualChanges
          }
        }
      });

      // Update booking conversion
      await supabase.from('booking_conversions').upsert({
        session_id: sessionId,
        booking_confirmation_detected: true,
        estimated_conversion: true,
        confidence_score: detection.confidence,
        success_indicators: {
          unified_detection: true,
          detection_method: detection.type,
          confidence: detection.confidence,
          total_detections: stats.detections.length,
          detection_data: detection.data,
          timestamp: detection.timestamp
        }
      });

      // GTM tracking - fix: pass correct object structure
      trackBookingEvent({
        sessionId: sessionId,
        bookingTime: Math.floor((Date.now() - stats.lastActivity) / 1000),
        interactionCount: stats.totalInteractions,
        source: 'unified_timma_conversion',
        value: 200,
        bookingDetails: {
          detection_method: detection.type,
          confidence: detection.confidence,
          detection_data: detection.data
        }
      });

      if (enableDebugMode) {
        toast({
          title: "🎉 Unified Conversion Detected!",
          description: `Method: ${detection.type} (${(detection.confidence * 100).toFixed(0)}% confidence)`,
          duration: 5000,
        });
      }

    } catch (error) {
      console.error('Error handling conversion:', error);
    }
  };

  // Initialize all monitoring
  useEffect(() => {
    debugLog('🚀 Initializing Unified Timma Tracker', { sessionId });
    
    setupConsoleMonitoring();
    setupApiMonitoring();
    setupIframeMonitoring();
    setupFormMonitoring();
    
    // Cleanup function
    return () => {
      // Restore original console methods
      if (originalConsole.current) {
        Object.assign(console, originalConsole.current);
      }
      
      // Restore original fetch
      if (originalFetch.current) {
        window.fetch = originalFetch.current;
      }
      
      // Clear intervals
      intervalRefs.current.forEach(clearInterval);
      
      // Disconnect observers
      observerRefs.current.forEach(observer => observer.disconnect());
      
      debugLog('🧹 Unified Timma Tracker cleanup completed');
    };
  }, [sessionId]);

  // Debug panel
  if (!enableDebugMode) return null;

  return (
    <div className="fixed top-4 right-4 bg-blue-900/90 text-white p-3 rounded-lg text-xs font-mono z-50 max-w-sm">
      <div className="font-bold text-blue-300 mb-2">🎯 UNIFIED TIMMA TRACKER</div>
      <div className="space-y-1">
        <div>Total Interactions: {stats.totalInteractions}</div>
        <div>API Calls: {stats.apiCalls}</div>
        <div>URL Changes: {stats.urlChanges}</div>
        <div>Form Events: {stats.formSubmissions}</div>
        <div>Visual Changes: {stats.visualChanges}</div>
        <div className={`${stats.conversionDetected ? 'text-green-300 font-bold animate-pulse' : 'text-gray-400'}`}>
          Conversion: {stats.conversionDetected ? '✅ DETECTED' : '⏳ Monitoring'}
        </div>
        <div className="text-purple-300 text-xs">
          Detections: {stats.detections.length}
        </div>
        {stats.detections.length > 0 && (
          <div className="text-blue-300 text-xs">
            Last: {stats.detections[stats.detections.length - 1]?.type} 
            ({(stats.detections[stats.detections.length - 1]?.confidence * 100).toFixed(0)}%)
          </div>
        )}
        <div className="text-purple-300 text-xs">
          Activity: {Math.floor((Date.now() - stats.lastActivity) / 1000)}s ago
        </div>
      </div>
    </div>
  );
};

export default UnifiedTimmaTracker;
