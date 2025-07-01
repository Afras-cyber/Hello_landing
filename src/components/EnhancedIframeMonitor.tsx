
import React, { useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface EnhancedIframeMonitorProps {
  sessionId: string;
  enableDebugMode?: boolean;
}

interface IframeMonitorStats {
  iframeLoaded: boolean;
  urlChanges: number;
  postMessages: number;
  domMutations: number;
  networkRequests: number;
  formSubmissions: number;
  successUrlDetected: boolean;
  timmaApiCalls: number;
  currentIframeUrl: string;
  lastActivityTime: number;
  conversionDetected: boolean;
  conversionMethod: string;
}

const EnhancedIframeMonitor: React.FC<EnhancedIframeMonitorProps> = ({ 
  sessionId, 
  enableDebugMode = false 
}) => {
  const [stats, setStats] = useState<IframeMonitorStats>({
    iframeLoaded: false,
    urlChanges: 0,
    postMessages: 0,
    domMutations: 0,
    networkRequests: 0,
    formSubmissions: 0,
    successUrlDetected: false,
    timmaApiCalls: 0,
    currentIframeUrl: '',
    lastActivityTime: Date.now(),
    conversionDetected: false,
    conversionMethod: ''
  });

  const mutationObserver = useRef<MutationObserver | null>(null);
  const networkInterceptor = useRef<any>(null);
  const messageListener = useRef<((event: MessageEvent) => void) | null>(null);
  const urlCheckInterval = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  const debugLog = (message: string, data?: any) => {
    if (enableDebugMode) {
      console.log(`🔍 ENHANCED IFRAME MONITOR: ${message}`, data || '');
    }
  };

  // Enhanced postMessage monitoring
  const setupPostMessageMonitoring = () => {
    debugLog('Setting up enhanced postMessage monitoring');
    
    messageListener.current = (event: MessageEvent) => {
      debugLog('PostMessage received', { origin: event.origin, data: event.data });
      
      setStats(prev => ({
        ...prev,
        postMessages: prev.postMessages + 1,
        lastActivityTime: Date.now()
      }));

      // Check for Timma-specific messages
      if (event.origin.includes('timma.fi') || event.origin.includes('varaa.timma.fi')) {
        debugLog('Timma-specific postMessage detected', event.data);
        
        // Analyze message for conversion indicators
        if (event.data && typeof event.data === 'object') {
          const dataStr = JSON.stringify(event.data).toLowerCase();
          
          if (dataStr.includes('success') || 
              dataStr.includes('confirmed') || 
              dataStr.includes('vahvistettu') ||
              dataStr.includes('booking_complete')) {
            handleConversionDetection('postMessage', event.data);
          }
          
          if (dataStr.includes('form_submit') || dataStr.includes('booking_data')) {
            setStats(prev => ({
              ...prev,
              formSubmissions: prev.formSubmissions + 1
            }));
          }
        }
      }
      
      trackIframeInteraction('postmessage_received', {
        origin: event.origin,
        dataType: typeof event.data,
        hasData: !!event.data
      });
    };

    window.addEventListener('message', messageListener.current);
  };

  // DOM mutation monitoring for iframe changes
  const setupDOMMonitoring = () => {
    debugLog('Setting up DOM mutation monitoring');
    
    mutationObserver.current = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        setStats(prev => ({
          ...prev,
          domMutations: prev.domMutations + 1
        }));

        // Check for iframe-related mutations
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element;
              
              // New iframe detected
              if (element.tagName === 'IFRAME') {
                debugLog('New iframe detected via DOM mutation', element.getAttribute('src'));
                handleIframeDetection(element as HTMLIFrameElement);
              }
              
              // Check for iframes in subtree
              const iframes = element.querySelectorAll?.('iframe');
              if (iframes && iframes.length > 0) {
                debugLog(`New iframes in subtree: ${iframes.length}`);
                iframes.forEach(iframe => handleIframeDetection(iframe));
              }
            }
          });
        }
        
        // Attribute changes on iframes
        if (mutation.type === 'attributes' && 
            mutation.target.nodeType === Node.ELEMENT_NODE) {
          const element = mutation.target as Element;
          
          if (element.tagName === 'IFRAME' && mutation.attributeName === 'src') {
            const newSrc = element.getAttribute('src');
            debugLog('Iframe src changed', { oldSrc: stats.currentIframeUrl, newSrc });
            
            setStats(prev => ({
              ...prev,
              urlChanges: prev.urlChanges + 1,
              currentIframeUrl: newSrc || ''
            }));
            
            // Check for success URLs
            if (newSrc && (
              newSrc.includes('success') || 
              newSrc.includes('confirmation') ||
              newSrc.includes('vahvistus') ||
              newSrc.includes('complete')
            )) {
              handleConversionDetection('url_change', { url: newSrc });
            }
          }
        }
      });
    });

    mutationObserver.current.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['src']
    });
  };

  // Network request monitoring (if available)
  const setupNetworkMonitoring = () => {
    debugLog('Attempting to set up network monitoring');
    
    try {
      // Override fetch to monitor API calls
      const originalFetch = window.fetch;
      window.fetch = async (...args) => {
        const [url, options] = args;
        const urlString = typeof url === 'string' ? url : url.toString();
        
        if (urlString.includes('timma.fi') || urlString.includes('varaa.timma.fi')) {
          debugLog('Timma API call detected', { url: urlString, method: options?.method });
          
          setStats(prev => ({
            ...prev,
            timmaApiCalls: prev.timmaApiCalls + 1,
            networkRequests: prev.networkRequests + 1
          }));
          
          // Monitor the response
          try {
            const response = await originalFetch(...args);
            const clonedResponse = response.clone();
            
            // Check if it's a booking-related endpoint
            if (urlString.includes('booking') || urlString.includes('reservation')) {
              try {
                const responseData = await clonedResponse.json();
                debugLog('Booking API response', responseData);
                
                if (responseData.success || responseData.confirmed) {
                  handleConversionDetection('api_response', responseData);
                }
              } catch (e) {
                // Response might not be JSON
                debugLog('Non-JSON API response');
              }
            }
            
            return response;
          } catch (error) {
            debugLog('Network request failed', error);
            throw error;
          }
        }
        
        return originalFetch(...args);
      };
      
      networkInterceptor.current = () => {
        window.fetch = originalFetch;
      };
      
    } catch (error) {
      debugLog('Network monitoring setup failed', error);
    }
  };

  // URL monitoring for iframe content
  const setupURLMonitoring = () => {
    debugLog('Setting up URL change monitoring');
    
    urlCheckInterval.current = setInterval(() => {
      const iframes = document.querySelectorAll('iframe[src*="timma"]') as NodeListOf<HTMLIFrameElement>;
      
      iframes.forEach((iframe, index) => {
        try {
          // Try to access iframe location (will fail for cross-origin)
          const iframeLocation = iframe.contentWindow?.location.href;
          
          if (iframeLocation && iframeLocation !== stats.currentIframeUrl) {
            debugLog(`Iframe ${index} URL changed`, { 
              oldUrl: stats.currentIframeUrl, 
              newUrl: iframeLocation 
            });
            
            setStats(prev => ({
              ...prev,
              urlChanges: prev.urlChanges + 1,
              currentIframeUrl: iframeLocation
            }));
            
            // Check for success indicators in URL
            if (iframeLocation.includes('success') || 
                iframeLocation.includes('confirmation') ||
                iframeLocation.includes('vahvistus')) {
              handleConversionDetection('iframe_url_success', { url: iframeLocation });
            }
          }
        } catch (error) {
          // Cross-origin access blocked - this is expected
          debugLog('Cross-origin iframe URL access blocked (expected)');
        }
      });
    }, 2000);
  };

  // Handle iframe detection
  const handleIframeDetection = (iframe: HTMLIFrameElement) => {
    debugLog('Processing detected iframe', iframe.src);
    
    setStats(prev => ({
      ...prev,
      iframeLoaded: true,
      currentIframeUrl: iframe.src
    }));

    // Add load event listener
    iframe.addEventListener('load', () => {
      debugLog('Iframe load event fired', iframe.src);
      
      trackIframeInteraction('iframe_loaded', {
        src: iframe.src,
        timestamp: Date.now()
      });
    });

    // Try to inject monitoring script (will fail for cross-origin)
    iframe.addEventListener('load', () => {
      try {
        const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
        if (iframeDoc) {
          debugLog('Injecting monitoring script into iframe');
          
          const script = iframeDoc.createElement('script');
          script.textContent = `
            (function() {
              console.log('Enhanced iframe monitor loaded');
              
              // Monitor form submissions
              document.addEventListener('submit', function(e) {
                parent.postMessage({
                  type: 'enhanced_monitor_form_submit',
                  formData: 'form_submitted',
                  timestamp: Date.now()
                }, '*');
              });
              
              // Monitor successful booking indicators
              const checkForSuccess = () => {
                const bodyText = document.body.textContent.toLowerCase();
                const url = window.location.href.toLowerCase();
                
                if (bodyText.includes('vahvistettu') || 
                    bodyText.includes('confirmed') ||
                    bodyText.includes('success') ||
                    url.includes('success') ||
                    url.includes('confirmation')) {
                  parent.postMessage({
                    type: 'enhanced_monitor_success_detected',
                    method: 'iframe_content_analysis',
                    url: window.location.href,
                    timestamp: Date.now()
                  }, '*');
                }
              };
              
              // Check immediately and on changes
              checkForSuccess();
              const observer = new MutationObserver(checkForSuccess);
              observer.observe(document.body, { childList: true, subtree: true });
            })();
          `;
          
          iframeDoc.head.appendChild(script);
          debugLog('Monitoring script injected successfully');
        }
      } catch (error) {
        debugLog('Cannot inject script into iframe (cross-origin)', error);
      }
    });
  };

  // Handle conversion detection
  const handleConversionDetection = async (method: string, data: any) => {
    debugLog(`🎉 CONVERSION DETECTED via ${method}!`, data);
    
    setStats(prev => ({
      ...prev,
      conversionDetected: true,
      conversionMethod: method
    }));

    await trackIframeInteraction('enhanced_conversion_detected', {
      method,
      data,
      confidence: 0.95
    });

    // Save conversion to database
    try {
      const { error } = await supabase.from('booking_conversions').upsert({
        session_id: sessionId,
        booking_confirmation_detected: true,
        estimated_conversion: true,
        confidence_score: 0.95,
        verification_notes: `Enhanced iframe monitoring detected conversion via ${method}`,
        success_indicators: JSON.stringify({
          detection_method: method,
          monitoring_data: data,
          stats: stats,
          enhanced_monitoring: true
        })
      });

      if (error) {
        console.error('Error saving enhanced conversion:', error);
      } else {
        debugLog('✅ Enhanced conversion saved successfully');
        
        if (enableDebugMode) {
          toast({
            title: "🔍 Enhanced Conversion Detected!",
            description: `Method: ${method}`,
            duration: 5000,
          });
        }
      }
    } catch (error) {
      console.error('Error in handleConversionDetection:', error);
    }
  };

  // Track iframe interactions
  const trackIframeInteraction = async (type: string, data: any) => {
    try {
      await supabase.rpc('track_iframe_interaction', {
        p_session_id: sessionId,
        p_interaction_type: type,
        p_element_selector: 'enhanced_iframe_monitor',
        p_element_text: `Enhanced monitoring: ${type}`,
        p_timestamp_offset: Math.floor((Date.now() - stats.lastActivityTime) / 1000),
        p_interaction_data: {
          ...data,
          enhanced_monitoring: true,
          stats: stats
        }
      });
    } catch (error) {
      console.error('Error tracking enhanced iframe interaction:', error);
    }
  };

  // Initialize monitoring
  useEffect(() => {
    debugLog('🚀 Enhanced Iframe Monitor initializing', { sessionId });
    
    setupPostMessageMonitoring();
    setupDOMMonitoring();
    setupNetworkMonitoring();
    setupURLMonitoring();
    
    // Initial iframe detection
    const existingIframes = document.querySelectorAll('iframe') as NodeListOf<HTMLIFrameElement>;
    existingIframes.forEach(handleIframeDetection);
    
    // Cleanup function
    return () => {
      if (messageListener.current) {
        window.removeEventListener('message', messageListener.current);
      }
      
      if (mutationObserver.current) {
        mutationObserver.current.disconnect();
      }
      
      if (networkInterceptor.current) {
        networkInterceptor.current();
      }
      
      if (urlCheckInterval.current) {
        clearInterval(urlCheckInterval.current);
      }
      
      debugLog('Enhanced Iframe Monitor cleanup completed');
    };
  }, [sessionId]);

  if (!enableDebugMode) return null;

  return (
    <div className="fixed top-4 right-4 bg-purple-900/90 text-white p-3 rounded-lg text-xs font-mono z-50 max-w-xs">
      <div className="font-bold text-purple-300 mb-2">🔍 ENHANCED MONITOR</div>
      <div className="space-y-1">
        <div className={`${stats.iframeLoaded ? 'text-green-400' : 'text-yellow-400'}`}>
          Iframe: {stats.iframeLoaded ? '✅ Loaded' : '⏳ Waiting'}
        </div>
        <div>URL Changes: {stats.urlChanges}</div>
        <div>PostMessages: {stats.postMessages}</div>
        <div>DOM Mutations: {stats.domMutations}</div>
        <div>API Calls: {stats.timmaApiCalls}</div>
        <div>Form Submits: {stats.formSubmissions}</div>
        <div className={`${stats.conversionDetected ? 'text-green-300 font-bold animate-pulse' : 'text-gray-400'}`}>
          Conversion: {stats.conversionDetected ? `✅ ${stats.conversionMethod}` : '⏳ Monitoring'}
        </div>
        {stats.currentIframeUrl && (
          <div className="text-blue-300 text-xs mt-1">
            URL: {stats.currentIframeUrl.substring(0, 30)}...
          </div>
        )}
        <div className="text-purple-300 text-xs">
          Activity: {Math.floor((Date.now() - stats.lastActivityTime) / 1000)}s ago
        </div>
      </div>
    </div>
  );
};

export default EnhancedIframeMonitor;
