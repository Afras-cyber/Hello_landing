
import React, { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { trackBookingEvent, trackTimmaInteraction } from '@/utils/gtmTracking';

interface TimmaTrackerProps {
  sessionId: string;
}

const TimmaTracker: React.FC<TimmaTrackerProps> = ({ sessionId }) => {
  useEffect(() => {
    // Skip tracking if user is in admin panel
    if (window.location.pathname.startsWith('/admin')) {
      console.log('TimmaTracker: Skipping tracking for admin panel');
      return;
    }

    let startTime = Date.now();
    let interactionCount = 0;
    let formFillCount = 0;
    let bookingPageTime = 0;
    let currentPageUrl = window.location.href;
    let sessionStarted = false;
    let batchQueue: any[] = [];
    let batchTimer: NodeJS.Timeout;
    let isBookingConfirmed = false;

    console.log('TimmaTracker initialized for session:', sessionId);

    const setupConsoleListener = () => {
      const originalLog = console.log;
      let lastFormDataHash = '';

      const processObject = (obj: any) => {
        if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
          if (obj.clientName && obj.clientPhone && obj.clientEmail) {
            const formDataString = JSON.stringify(obj);
            // Simple hash to prevent duplicate processing
            const currentHash = btoa(formDataString); 

            if (currentHash !== lastFormDataHash) {
              lastFormDataHash = currentHash;
              console.log('TimmaTracker: Console log conversion detected!', obj);
              
              if (isBookingConfirmed) return true;
              isBookingConfirmed = true;

              trackInteraction('booking_confirmation', {
                url: window.location.href,
                extra: { 
                  confirmationData: 'Console log detected',
                  bookingDetails: obj,
                  detectionMethod: 'console_log'
                }
              });

              trackSessionEvent('booking_completed', {
                url: window.location.href,
                extra: { 
                  confirmationData: 'Console log detected',
                  bookingDetails: obj,
                  total_interactions: interactionCount,
                  session_duration: Math.floor((Date.now() - startTime) / 1000)
                }
              });
              
              updateBookingConversion(true);

              trackBookingEvent({
                sessionId: sessionId,
                bookingTime: bookingPageTime,
                interactionCount: interactionCount,
                source: 'timma_console'
              });
              
              return true;
            }
          }
        }
        return false;
      };

      const checkForFormData = (args: any[]) => {
        for (const arg of args) {
          if (Array.isArray(arg)) {
            for (const item of arg) {
              if (processObject(item)) return;
            }
          } else {
            if (processObject(arg)) return;
          }
        }
      };

      console.log = function(...args) {
        originalLog.apply(console, args);
        try {
          checkForFormData(args);
        } catch (e) {
          console.log = originalLog; // Restore on error
          console.error('Error in TimmaTracker console.log interceptor', e);
        }
      };

      return () => {
        console.log = originalLog; // Cleanup
      };
    };

    // Batch processing for better performance
    const processBatch = async () => {
      if (batchQueue.length === 0) return;
      
      const events = [...batchQueue];
      batchQueue = [];
      
      try {
        const { error } = await supabase
          .from('session_events')
          .insert(events);
          
        if (error) {
          console.error('Error processing batch events:', error);
          // Re-queue failed events
          batchQueue.unshift(...events);
        }
      } catch (error) {
        console.error('Error in batch processing:', error);
      }
    };

    const addToBatch = (eventData: any) => {
      batchQueue.push({
        session_id: sessionId,
        timestamp_offset: Date.now() - startTime,
        created_at: new Date().toISOString(),
        ...eventData
      });
      
      // Process batch every 5 seconds or when it reaches 10 events
      if (batchQueue.length >= 10) {
        clearTimeout(batchTimer);
        processBatch();
      } else {
        clearTimeout(batchTimer);
        batchTimer = setTimeout(processBatch, 5000);
      }
    };

    // Initialize session tracking
    const initializeSession = async () => {
      if (sessionStarted) return;
      sessionStarted = true;

      try {
        const urlParams = new URLSearchParams(window.location.search);
        const { error } = await supabase
          .from('user_sessions')
          .upsert({
            session_id: sessionId,
            started_at: new Date(startTime).toISOString(),
            page_views: 1,
            total_duration: 0,
            referrer_url: document.referrer || null,
            user_agent: navigator.userAgent,
            device_type: /Mobile|Android|iPhone|iPad/.test(navigator.userAgent) ? 'mobile' : 'desktop',
            utm_source: urlParams.get('utm_source'),
            utm_medium: urlParams.get('utm_medium'),
            utm_campaign: urlParams.get('utm_campaign'),
            utm_content: urlParams.get('utm_content'),
            utm_term: urlParams.get('utm_term')
          }, {
            onConflict: 'session_id'
          });

        if (error) {
          console.error('Error initializing session:', error);
        } else {
          console.log('Session initialized successfully:', sessionId);
          // Send initial GTM event
          if (typeof window !== 'undefined' && (window as any).dataLayer) {
            (window as any).dataLayer.push({
              event: 'session_start',
              session_id: sessionId,
              device_type: /Mobile|Android|iPhone|iPad/.test(navigator.userAgent) ? 'mobile' : 'desktop',
              utm_source: urlParams.get('utm_source'),
              utm_medium: urlParams.get('utm_medium'),
              utm_campaign: urlParams.get('utm_campaign')
            });
          }
        }
      } catch (error) {
        console.error('Error in initializeSession:', error);
      }
    };

    // Enhanced booking detection with Finnish keywords
    const detectBookingCompletion = (data: any) => {
      if (isBookingConfirmed) return false;
      const confirmationKeywords = [
        // Finnish
        'varaus vahvistettu', 'kiitos varauksesta', 'varaus onnistui', 'aika varattu', 
        'varauksesi on vahvistettu', 'varauksen vahvistus', 'aika varattu onnistuneesti',
        'varaus valmis', 'ajanvaraus onnistui', 'kiitos tilauksesta', 'varaus tehty',
        'vahvistettu', 'varattu', 'onnistui', 'valmis',
        // English
        'booking confirmed', 'thank you for booking', 'appointment confirmed', 
        'booking successful', 'appointment booked', 'time reserved',
        'reservation confirmed', 'confirmed', 'booked', 'successful',
        // Timma specific
        'timma', 'booking complete', 'appointment complete'
      ];
      
      const successUrls = [
        'success', 'confirmation', 'vahvistus', 'kiitos', 'confirmed',
        'complete', 'booking-complete', 'varaus-valmis', 'thank-you',
        'done', 'finish', 'valmis', 'ready'
      ];
      
      const pageText = document.body.textContent?.toLowerCase() || '';
      const currentUrl = window.location.href.toLowerCase();
      const dataText = (data.message || data.text || '').toLowerCase();
      
      const hasConfirmationText = confirmationKeywords.some(keyword => 
        pageText.includes(keyword) || dataText.includes(keyword)
      );
      const hasSuccessUrl = successUrls.some(url => currentUrl.includes(url));
      
      // Check for Timma-specific success indicators
      const timmaSuccessIndicators = [
        'varaa.timma.fi/success',
        'timma.fi/booking/confirmed',
        'reservation-id',
        'booking-reference',
        'booking-id',
        'varaus-id'
      ];
      
      const hasTimmaSuccess = timmaSuccessIndicators.some(indicator => 
        currentUrl.includes(indicator) || pageText.includes(indicator) || dataText.includes(indicator)
      );
      
      console.log('Booking detection check:', {
        hasConfirmationText,
        hasSuccessUrl,
        hasTimmaSuccess,
        pageText: pageText.substring(0, 200),
        currentUrl,
        dataText
      });
      
      return hasConfirmationText || hasSuccessUrl || hasTimmaSuccess;
    };

    // Track general session events with enhanced data
    const trackSessionEvent = async (type: string, data: any = {}) => {
      const eventData = {
        event_type: type,
        element_selector: data.selector || null,
        element_text: data.text || null,
        x_coordinate: data.x || null,
        y_coordinate: data.y || null,
        page_url: data.url || currentPageUrl,
        event_data: {
          ...data.extra,
          viewport_width: window.innerWidth,
          viewport_height: window.innerHeight,
          scroll_position: window.scrollY,
          timestamp: new Date().toISOString()
        }
      };
      
      addToBatch(eventData);
      
      // Send to GTM
      trackTimmaInteraction({
        interactionType: type,
        sessionId: sessionId,
        elementText: data.text
      });
    };

    const trackInteraction = async (type: string, data: any = {}) => {
      try {
        console.log('Tracking Timma interaction:', type, data);
        
        const { error } = await supabase.rpc('track_iframe_interaction', {
          p_session_id: sessionId,
          p_interaction_type: type,
          p_element_selector: data.selector || null,
          p_element_text: data.text || null,
          p_x_coordinate: data.x || null,
          p_y_coordinate: data.y || null,
          p_timestamp_offset: Date.now() - startTime,
          p_iframe_url: data.url || null,
          p_interaction_data: {
            ...data.extra,
            interaction_count: interactionCount,
            form_fills: formFillCount
          }
        });

        if (error) {
          console.error('Error tracking interaction:', error);
        } else {
          console.log('Successfully tracked interaction:', type, data);
        }
      } catch (error) {
        console.error('Error in trackInteraction:', error);
      }
    };

    const updateBookingConversion = async (isConfirmed = false) => {
      try {
        bookingPageTime = Math.floor((Date.now() - startTime) / 1000);
        
        console.log('Updating booking conversion:', {
          sessionId,
          bookingPageTime,
          interactionCount,
          formFillCount,
          isConfirmed
        });
        
        const { error } = await supabase.rpc('estimate_booking_conversion', {
          p_session_id: sessionId,
          p_booking_page_time: bookingPageTime,
          p_iframe_interactions: interactionCount,
          p_form_fills: formFillCount
        });

        if (error) {
          console.error('Error updating booking conversion:', error);
        } else {
          console.log('Booking conversion updated successfully');
        }

        // If booking is confirmed, also update the user session
        if (isConfirmed) {
          const { error: sessionError } = await supabase
            .from('user_sessions')
            .update({ 
              is_conversion: true,
              conversion_value: 200
            })
            .eq('session_id', sessionId);

          if (sessionError) {
            console.error('Error updating session conversion:', sessionError);
          } else {
            console.log('Session marked as conversion');
          }
        }
      } catch (error) {
        console.error('Error in updateBookingConversion:', error);
      }
    };

    const updateSession = async () => {
      try {
        const currentDuration = Math.floor((Date.now() - startTime) / 1000);
        
        const { error } = await supabase
          .from('user_sessions')
          .update({
            total_duration: currentDuration,
            ended_at: new Date().toISOString()
          })
          .eq('session_id', sessionId);

        if (error) {
          console.error('Error updating session:', error);
        }
      } catch (error) {
        console.error('Error in updateSession:', error);
      }
    };

    // Enhanced message handler with better booking detection
    const handleMessage = (event: MessageEvent) => {
      // Enhanced security check
      const allowedOrigins = [
        'timma.fi', 'varaa.timma.fi', 'booking.timma.fi',
        'localhost', '127.0.0.1'
      ];
      
      const isAllowedOrigin = allowedOrigins.some(origin => 
        event.origin.includes(origin)
      );
      
      if (!isAllowedOrigin && event.origin !== window.location.origin) {
        console.log('Message from non-allowed origin:', event.origin);
        return;
      }

      console.log('Received message from iframe:', event.data, 'Origin:', event.origin);

      const data = event.data;
      interactionCount++;

      // Track different types of interactions
      if (data.type === 'click') {
        trackInteraction('click', {
          selector: data.selector,
          text: data.text,
          x: data.x,
          y: data.y,
          url: data.url
        });
        
        trackSessionEvent('iframe_click', {
          selector: data.selector,
          text: data.text,
          x: data.x,
          y: data.y,
          url: data.url
        });
      } else if (data.type === 'form_fill') {
        formFillCount++;
        trackInteraction('form_fill', {
          selector: data.selector,
          text: data.fieldName,
          extra: { value: data.value }
        });
        
        trackSessionEvent('form_fill', {
          selector: data.selector,
          text: data.fieldName,
          extra: { fieldValue: data.value }
        });
      } else if (data.type === 'page_view') {
        trackInteraction('page_view', {
          url: data.url,
          extra: { title: data.title }
        });
        
        trackSessionEvent('iframe_page_view', {
          url: data.url,
          extra: { title: data.title }
        });
      }
      
      // Enhanced booking confirmation detection
      if (data.type === 'booking_confirmation' || detectBookingCompletion(data)) {
        if (isBookingConfirmed) return;
        isBookingConfirmed = true;
        console.log('BOOKING CONFIRMATION DETECTED!', data);
        
        trackInteraction('booking_confirmation', {
          url: data.url,
          extra: { 
            confirmationData: data.message,
            bookingDetails: data.details,
            detectionMethod: data.type === 'booking_confirmation' ? 'explicit' : 'heuristic'
          }
        });

        trackSessionEvent('booking_completed', {
          url: data.url,
          extra: { 
            confirmationData: data.message,
            bookingDetails: data.details,
            total_interactions: interactionCount,
            session_duration: Math.floor((Date.now() - startTime) / 1000)
          }
        });

        // Update booking conversion with confirmation
        updateBookingConversion(true);

        // Enhanced GTM tracking for booking completion
        trackBookingEvent({
          sessionId: sessionId,
          bookingTime: bookingPageTime,
          interactionCount: interactionCount,
          source: 'timma'
        });

        // Additional GTM events for Enhanced Ecommerce
        if (typeof window !== 'undefined' && (window as any).dataLayer) {
          (window as any).dataLayer.push({
            event: 'purchase',
            ecommerce: {
              transaction_id: sessionId,
              value: 200,
              currency: 'EUR',
              items: [{
                item_id: 'booking',
                item_name: 'Hair Service Booking',
                category: 'Services',
                quantity: 1,
                price: 200
              }]
            },
            custom_dimensions: {
              session_duration: Math.floor((Date.now() - startTime) / 1000),
              interaction_count: interactionCount,
              form_fills: formFillCount
            }
          });
        }
      } else {
        // Regular interaction, update conversion estimate
        if (!isBookingConfirmed) {
          updateBookingConversion();
        }
      }
    };

    // Enhanced iframe detection and monitoring
    const monitorIframes = () => {
      const iframes = document.querySelectorAll('iframe');
      
      console.log(`Found ${iframes.length} iframes to monitor`);
      
      iframes.forEach((iframe, index) => {
        console.log(`Monitoring iframe ${index}:`, iframe.src);

        iframe.addEventListener('load', () => {
          console.log(`Iframe ${index} loaded, attempting to inject tracker`);
          
          try {
            const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
            if (iframeDoc) {
              console.log('Iframe accessible, injecting tracking script');
              
              const script = iframeDoc.createElement('script');
              script.textContent = `
                (function() {
                  console.log('Timma tracking script loaded in iframe:', window.location.href);
                  let clickCount = 0;
                  
                  document.addEventListener('click', function(e) {
                    clickCount++;
                    console.log('Iframe click detected:', e.target);
                    parent.postMessage({
                      type: 'click',
                      selector: e.target.tagName + (e.target.className ? '.' + e.target.className.split(' ').join('.') : ''),
                      text: e.target.textContent?.substring(0, 100),
                      x: e.clientX,
                      y: e.clientY,
                      url: window.location.href,
                      timestamp: new Date().toISOString()
                    }, '*');
                  });

                  document.addEventListener('input', function(e) {
                    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                      console.log('Iframe form input detected:', e.target);
                      parent.postMessage({
                        type: 'form_fill',
                        selector: e.target.name || e.target.id || e.target.tagName,
                        fieldName: e.target.name || e.target.placeholder || 'unknown',
                        value: e.target.type === 'password' ? '[password]' : e.target.value?.substring(0, 50),
                        timestamp: new Date().toISOString()
                      }, '*');
                    }
                  });

                  // Enhanced booking confirmation detection
                  const checkForConfirmation = () => {
                    const confirmationTexts = [
                      'varaus vahvistettu', 'booking confirmed', 'kiitos varauksesta', 
                      'varaus onnistui', 'aika varattu', 'varauksesi on vahvistettu',
                      'thank you for booking', 'appointment confirmed', 'booking successful',
                      'varauksen vahvistus', 'appointment booked', 'time reserved',
                      'aika varattu onnistuneesti', 'reservation confirmed', 'vahvistettu',
                      'varattu', 'onnistui', 'valmis', 'confirmed', 'booked', 'successful'
                    ];
                    const pageText = document.body.textContent.toLowerCase();
                    
                    const successUrls = ['success', 'confirmation', 'vahvistus', 'kiitos', 'confirmed', 'complete', 'valmis'];
                    const currentUrl = window.location.href.toLowerCase();
                    
                    const hasConfirmationText = confirmationTexts.some(text => pageText.includes(text));
                    const hasSuccessUrl = successUrls.some(url => currentUrl.includes(url));
                    
                    // Check for specific Timma success patterns
                    const hasBookingId = /booking[_-]?id|varaus[_-]?id|reservation[_-]?id/i.test(pageText);
                    const hasThankYou = /kiitos|thank you|tack/i.test(pageText);
                    
                    if (hasConfirmationText || hasSuccessUrl || (hasBookingId && hasThankYou)) {
                      console.log('BOOKING CONFIRMATION DETECTED IN IFRAME!', {
                        hasConfirmationText,
                        hasSuccessUrl,
                        hasBookingId,
                        hasThankYou,
                        url: window.location.href
                      });
                      
                      parent.postMessage({
                        type: 'booking_confirmation',
                        message: hasConfirmationText ? 'Text confirmation detected' : 'Success URL detected',
                        url: window.location.href,
                        details: pageText.substring(0, 500),
                        detectionMethod: hasConfirmationText ? 'text' : hasSuccessUrl ? 'url' : 'pattern',
                        timestamp: new Date().toISOString()
                      }, '*');
                    }
                  };

                  // Check immediately and on page changes
                  checkForConfirmation();
                  
                  const observer = new MutationObserver(() => {
                    setTimeout(checkForConfirmation, 100);
                  });
                  observer.observe(document.body, { childList: true, subtree: true });

                  // Also check on URL changes
                  let lastUrl = window.location.href;
                  setInterval(() => {
                    if (window.location.href !== lastUrl) {
                      lastUrl = window.location.href;
                      setTimeout(checkForConfirmation, 500);
                    }
                  }, 1000);

                  parent.postMessage({
                    type: 'page_view',
                    url: window.location.href,
                    title: document.title,
                    timestamp: new Date().toISOString()
                  }, '*');
                })();
              `;
              iframeDoc.head.appendChild(script);
              console.log('Tracking script injected successfully');
            }
          } catch (e) {
            console.log('Cannot inject into iframe (cross-origin):', e);
            // Fallback for cross-origin iframes
            iframe.addEventListener('click', () => {
              interactionCount++;
              console.log('Cross-origin iframe click detected');
              trackInteraction('iframe_click', {
                url: iframe.src,
                extra: { iframeIndex: index }
              });
              
              trackSessionEvent('iframe_external_click', {
                url: iframe.src,
                extra: { iframeIndex: index }
              });
            });
          }
        });
      });
    };

    // Enhanced page click tracking with heat map data
    const handlePageClick = (e: MouseEvent) => {
      const target = e.target as Element;
      const selector = target.tagName + (target.className ? '.' + target.className.split(' ').join('.') : '');
      
      trackSessionEvent('page_click', {
        selector: selector,
        text: target.textContent?.substring(0, 100),
        x: e.clientX,
        y: e.clientY,
        url: window.location.href
      });

      // Update heat map data with better error handling
      const updateHeatMap = async () => {
        try {
          const { error } = await supabase.rpc('update_heat_map_data', {
            p_page_url: window.location.pathname,
            p_element_selector: selector,
            p_x_coordinate: e.clientX,
            p_y_coordinate: e.clientY,
            p_device_type: /Mobile|Android|iPhone|iPad/.test(navigator.userAgent) ? 'mobile' : 'desktop'
          });

          if (error) {
            console.error('Error updating heat map:', error);
          }
        } catch (error) {
          console.error('Error in updateHeatMap:', error);
        }
      };

      updateHeatMap();
    };

    // Track page navigation with enhanced data
    const handlePageChange = async () => {
      const newUrl = window.location.href;
      if (newUrl !== currentPageUrl) {
        trackSessionEvent('page_navigation', {
          url: newUrl,
          extra: { 
            previousUrl: currentPageUrl,
            navigation_type: 'spa'
          }
        });
        
        try {
          const { data: sessionData, error: fetchError } = await supabase
            .from('user_sessions')
            .select('page_views')
            .eq('session_id', sessionId)
            .single();

          if (!fetchError && sessionData) {
            const { error: updateError } = await supabase
              .from('user_sessions')
              .update({ page_views: (sessionData.page_views || 0) + 1 })
              .eq('session_id', sessionId);

            if (updateError) {
              console.error('Error updating page views:', updateError);
            }
          }
        } catch (error) {
          console.error('Error in page views update:', error);
        }
        
        currentPageUrl = newUrl;
      }
    };

    // Initialize session and set up tracking
    initializeSession();
    const consoleCleanup = setupConsoleListener();
    
    window.addEventListener('message', handleMessage);
    
    // Initial iframe monitoring
    monitorIframes();
    
    // Monitor for new iframes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element;
            if (element.tagName === 'IFRAME') {
              console.log('New iframe detected:', element.getAttribute('src'));
              setTimeout(() => monitorIframes(), 100);
            }
            const iframes = element.querySelectorAll?.('iframe');
            if (iframes && iframes.length > 0) {
              console.log('New iframes in subtree:', iframes.length);
              setTimeout(() => monitorIframes(), 100);
            }
          }
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    document.addEventListener('click', handlePageClick);
    window.addEventListener('popstate', handlePageChange);
    
    const handleBeforeUnload = () => {
      // Process any remaining batch items
      if (batchQueue.length > 0) {
        processBatch();
      }
      updateSession();
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Enhanced periodic updates
    const sessionUpdateInterval = setInterval(() => {
      updateSession();
      // Process any pending batch items
      if (batchQueue.length > 0) {
        processBatch();
      }
    }, 30000);

    // Cleanup
    return () => {
      consoleCleanup();
      window.removeEventListener('message', handleMessage);
      document.removeEventListener('click', handlePageClick);
      window.removeEventListener('popstate', handlePageChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      observer.disconnect();
      clearInterval(sessionUpdateInterval);
      clearTimeout(batchTimer);
      
      // Final batch processing and session update
      if (batchQueue.length > 0) {
        processBatch();
      }
      updateSession();
    };
  }, [sessionId]);

  return null;
};

export default TimmaTracker;
