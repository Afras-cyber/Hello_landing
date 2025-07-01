
import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface TimmaApiCall {
  url: string;
  method: string;
  timestamp: string;
  response?: any;
  isBookingRelated: boolean;
}

interface TimmaApiStats {
  totalCalls: number;
  bookingCalls: number;
  successfulBookings: number;
  apiCalls: TimmaApiCall[];
}

export const useTimmaApiMonitoring = (sessionId: string, enableDebugMode = false) => {
  const [stats, setStats] = useState<TimmaApiStats>({
    totalCalls: 0,
    bookingCalls: 0,
    successfulBookings: 0,
    apiCalls: []
  });

  const originalFetch = useRef<typeof fetch>();

  const debugLog = (message: string, data?: any) => {
    if (enableDebugMode) {
      console.log(`🌐 TIMMA API: ${message}`, data || '');
    }
  };

  const isTimmaUrl = (url: string): boolean => {
    return url.includes('timma.fi') || 
           url.includes('varaa.timma.fi') || 
           url.includes('timma');
  };

  const isBookingEndpoint = (url: string): boolean => {
    const bookingKeywords = [
      'booking', 'reservation', 'varaa', 'aika', 
      'confirm', 'submit', 'create', 'save'
    ];
    return bookingKeywords.some(keyword => url.toLowerCase().includes(keyword));
  };

  const analyzeResponse = async (response: Response, url: string) => {
    try {
      const clonedResponse = response.clone();
      const contentType = response.headers.get('content-type');
      
      if (contentType?.includes('application/json')) {
        const data = await clonedResponse.json();
        debugLog('API Response analyzed', { url, data });
        
        // Check for booking success indicators
        const isSuccess = !!(
          data.success || 
          data.confirmed || 
          data.id || 
          data.booking_id ||
          data.reservation_id ||
          (data.status && ['confirmed', 'success', 'completed'].includes(data.status.toLowerCase()))
        );

        if (isSuccess && isBookingEndpoint(url)) {
          debugLog('🎉 Booking success detected in API response!', data);
          
          // Track successful booking
          await supabase.rpc('track_iframe_interaction', {
            p_session_id: sessionId,
            p_interaction_type: 'timma_api_booking_success',
            p_element_selector: 'api_endpoint',
            p_element_text: `Booking API success: ${url}`,
            p_interaction_data: {
              api_url: url,
              response_data: data,
              detection_method: 'api_response_analysis',
              confidence: 0.95
            }
          });

          setStats(prev => ({
            ...prev,
            successfulBookings: prev.successfulBookings + 1
          }));

          return { isSuccess: true, data };
        }
      }
    } catch (error) {
      debugLog('Error analyzing response', error);
    }
    
    return { isSuccess: false, data: null };
  };

  useEffect(() => {
    debugLog('🚀 Setting up Timma API monitoring');
    
    // Store original fetch
    originalFetch.current = window.fetch;
    
    // Override fetch to monitor Timma API calls
    window.fetch = async (...args) => {
      const [url, options] = args;
      const urlString = typeof url === 'string' ? url : url.toString();
      
      if (isTimmaUrl(urlString)) {
        const method = options?.method || 'GET';
        const isBookingCall = isBookingEndpoint(urlString);
        
        debugLog(`Timma API call: ${method} ${urlString}`, { isBookingCall });
        
        const apiCall: TimmaApiCall = {
          url: urlString,
          method,
          timestamp: new Date().toISOString(),
          isBookingRelated: isBookingCall
        };

        setStats(prev => ({
          ...prev,
          totalCalls: prev.totalCalls + 1,
          bookingCalls: isBookingCall ? prev.bookingCalls + 1 : prev.bookingCalls,
          apiCalls: [...prev.apiCalls.slice(-9), apiCall] // Keep last 10
        }));

        try {
          const response = await originalFetch.current!(...args);
          
          // Analyze response for booking success
          if (isBookingCall && response.ok) {
            const analysis = await analyzeResponse(response, urlString);
            apiCall.response = analysis.data;
          }
          
          return response;
        } catch (error) {
          debugLog('API call failed', error);
          throw error;
        }
      }
      
      return originalFetch.current!(...args);
    };
    
    // Cleanup
    return () => {
      if (originalFetch.current) {
        window.fetch = originalFetch.current;
      }
      debugLog('🧹 API monitoring cleanup completed');
    };
  }, [sessionId]);

  return {
    stats,
    isMonitoring: true
  };
};
