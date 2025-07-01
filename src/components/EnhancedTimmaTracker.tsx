
import React, { useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { trackBookingEvent } from '@/utils/gtmTracking';
import UnifiedTimmaTracker from './UnifiedTimmaTracker';
import TimmaVisualDetector from './TimmaVisualDetector';
import { useTimmaApiMonitoring } from '@/hooks/useTimmaApiMonitoring';

interface TimmaTrackerProps {
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

interface ConsoleLogDetection {
  timestamp: string;
  method: string;
  confidence: number;
  clientData?: any;
  rawLog?: any;
}

const EnhancedTimmaTracker: React.FC<TimmaTrackerProps> = ({ enableDebugMode = false }) => {
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [isTrackingActive, setIsTrackingActive] = useState(false);
  const [debugStats, setDebugStats] = useState({
    totalInteractions: 0,
    bookingPageTime: 0,
    confidenceScore: 0,
    currentBookingStep: 'not_started',
    detectedServices: [] as string[],
    visualConversionDetected: false,
    consoleDetections: [] as ConsoleLogDetection[],
    lastConsoleDetection: null as ConsoleLogDetection | null,
    unifiedDetections: 0,
    apiDetections: 0,
    visualDetections: 0
  });
  
  const iframeInteractionCount = useRef(0);
  const bookingStartTime = useRef<number | null>(null);
  const lastActivityTime = useRef(Date.now());
  const bookingSteps = useRef<BookingStepData[]>([]);
  const { toast } = useToast();

  // Use the new API monitoring hook
  const { stats: apiStats } = useTimmaApiMonitoring(sessionId, enableDebugMode);

  const debugLog = (message: string, data?: any) => {
    if (enableDebugMode) {
      console.log(`🎯 ENHANCED TIMMA: ${message}`, data || '');
    }
  };

  // Handle unified detection from the new tracker
  const handleUnifiedDetection = (detection: any) => {
    debugLog('Unified detection received', detection);
    
    setDebugStats(prev => ({
      ...prev,
      unifiedDetections: prev.unifiedDetections + 1,
      confidenceScore: Math.max(prev.confidenceScore, detection.confidence || 0)
    }));
  };

  // Handle visual detection
  const handleVisualDetection = (detection: any) => {
    debugLog('Visual detection received', detection);
    
    setDebugStats(prev => ({
      ...prev,
      visualDetections: prev.visualDetections + 1,
      visualConversionDetected: detection.confidence >= 0.8
    }));
  };

  // Track basic iframe interactions
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
      debugLog('Tracking interaction', interactionData);
      
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
          enhanced_tracking: true,
          api_stats: {
            totalCalls: apiStats.totalCalls,
            bookingCalls: apiStats.bookingCalls,
            successfulBookings: apiStats.successfulBookings,
            apiCallsCount: apiStats.apiCalls.length
          }
        }
      });

      if (error) {
        console.error('❌ Error tracking interaction:', error);
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
        currentBookingStep: interactionData.bookingStep?.step || prev.currentBookingStep,
        detectedServices: interactionData.bookingStep?.service 
          ? [...new Set([...prev.detectedServices, interactionData.bookingStep.service])]
          : prev.detectedServices
      }));

      debugLog('Interaction tracked successfully', {
        interactionId: data,
        totalInteractions: iframeInteractionCount.current,
        timeOnPage,
        bookingStep: interactionData.bookingStep
      });

    } catch (error) {
      console.error('❌ Error in trackInteraction:', error);
    }
  };

  // Initialize tracking
  useEffect(() => {
    if (!bookingStartTime.current) {
      bookingStartTime.current = Date.now();
      setIsTrackingActive(true);
      
      debugLog('🚀 Enhanced Timma Tracker initialized', { 
        sessionId,
        startTime: new Date(bookingStartTime.current).toISOString()
      });

      // Track page load
      trackInteraction({
        type: 'page_load',
        element: 'booking_page',
        text: 'Enhanced Timma tracking started'
      });
    }
  }, []);

  // Update API stats
  useEffect(() => {
    setDebugStats(prev => ({
      ...prev,
      apiDetections: apiStats.successfulBookings
    }));
  }, [apiStats]);

  if (!enableDebugMode) {
    return (
      <>
        <UnifiedTimmaTracker 
          sessionId={sessionId} 
          enableDebugMode={false}
        />
        <TimmaVisualDetector 
          sessionId={sessionId} 
          enableDebugMode={false}
          onDetection={handleVisualDetection}
        />
      </>
    );
  }

  return (
    <div>
      <UnifiedTimmaTracker 
        sessionId={sessionId} 
        enableDebugMode={enableDebugMode}
      />
      <TimmaVisualDetector 
        sessionId={sessionId} 
        enableDebugMode={enableDebugMode}
        onDetection={handleVisualDetection}
      />
      
      {/* Enhanced Debug Panel */}
      <div className="fixed top-40 right-4 bg-green-900/90 text-white p-3 rounded-lg text-xs font-mono z-50 max-w-sm">
        <div className="font-bold text-green-300 mb-2">🎯 ENHANCED TRACKER</div>
        <div className="space-y-1">
          <div>Session: {sessionId.substring(0, 8)}...</div>
          <div>Status: {isTrackingActive ? '✅ Active' : '❌ Inactive'}</div>
          <div>Total Interactions: {debugStats.totalInteractions}</div>
          <div>Booking Time: {Math.floor(debugStats.bookingPageTime / 60)}:{(debugStats.bookingPageTime % 60).toString().padStart(2, '0')}</div>
          <div>Step: {debugStats.currentBookingStep}</div>
          <div>Confidence: {(debugStats.confidenceScore * 100).toFixed(0)}%</div>
          
          <div className="border-t border-green-700 pt-1 mt-2">
            <div className="text-green-300 font-bold">Detection Summary:</div>
            <div>Unified: {debugStats.unifiedDetections}</div>
            <div>API: {debugStats.apiDetections}</div>
            <div>Visual: {debugStats.visualDetections}</div>
            <div>Console: {debugStats.consoleDetections.length}</div>
          </div>
          
          <div className="border-t border-green-700 pt-1 mt-2">
            <div className="text-green-300">API Stats:</div>
            <div>Total Calls: {apiStats.totalCalls}</div>
            <div>Booking Calls: {apiStats.bookingCalls}</div>
            <div>Successful: {apiStats.successfulBookings}</div>
          </div>

          {debugStats.detectedServices.length > 0 && (
            <div className="border-t border-green-700 pt-1 mt-2">
              <div className="text-green-300">Services:</div>
              {debugStats.detectedServices.map((service, index) => (
                <div key={index} className="text-xs">{service}</div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnhancedTimmaTracker;
