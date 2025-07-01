
import React, { useEffect, useRef, useCallback } from 'react';
import { trackSessionMilestone, trackScrollDepth, trackError } from '@/utils/gtmTracking';

interface ComprehensiveSiteTrackerProps {
  sessionId: string;
  enableDebugMode?: boolean;
}

const ComprehensiveSiteTracker: React.FC<ComprehensiveSiteTrackerProps> = ({ 
  sessionId, 
  enableDebugMode = false 
}) => {
  const sessionStartTime = useRef<number>(Date.now());
  const scrollDepthTracked = useRef<number[]>([]);
  const interactionCount = useRef<number>(0);
  const lastActivity = useRef<number>(Date.now());
  const milestoneIntervals = useRef<NodeJS.Timeout[]>([]);

  // Enhanced scroll depth tracking
  const handleScroll = useCallback(() => {
    const scrollPercent = Math.round(
      (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
    );

    // Track at 25%, 50%, 75%, 90% intervals
    [25, 50, 75, 90].forEach(threshold => {
      if (scrollPercent >= threshold && !scrollDepthTracked.current.includes(threshold)) {
        scrollDepthTracked.current.push(threshold);
        trackScrollDepth(threshold, sessionId);
      }
    });

    lastActivity.current = Date.now();
  }, [sessionId]);

  // Track user interactions
  const handleInteraction = useCallback(() => {
    interactionCount.current += 1;
    lastActivity.current = Date.now();
  }, []);

  // Session end tracking with error handling
  const trackSessionEnd = useCallback(async () => {
    const sessionDuration = Math.floor((Date.now() - sessionStartTime.current) / 1000);
    
    try {
      // Since the API endpoint doesn't exist, just track locally
      if (enableDebugMode) {
        console.log('Session ended:', {
          sessionId,
          duration: sessionDuration,
          interactions: interactionCount.current,
          scrollDepth: Math.max(...scrollDepthTracked.current, 0)
        });
      }
      
      // Track final session data via GTM
      trackSessionMilestone({
        milestone: 'session_start', // Use existing milestone type
        sessionId,
        duration: sessionDuration,
        interactionCount: interactionCount.current
      });
    } catch (error) {
      console.warn('Session tracking failed:', error);
      trackError({
        errorType: 'session_tracking',
        errorMessage: 'Failed to track session end',
        sessionId,
        context: 'ComprehensiveSiteTracker'
      });
    }
  }, [sessionId, enableDebugMode]);

  useEffect(() => {
    // Set up milestone tracking
    const trackMilestone = (milestone: 'session_30s' | 'session_60s' | 'session_300s', delay: number) => {
      const interval = setTimeout(() => {
        trackSessionMilestone({
          milestone,
          sessionId,
          duration: Math.floor((Date.now() - sessionStartTime.current) / 1000),
          interactionCount: interactionCount.current
        });
      }, delay);
      milestoneIntervals.current.push(interval);
    };

    // Set up milestone tracking
    trackMilestone('session_30s', 30000);
    trackMilestone('session_60s', 60000);
    trackMilestone('session_300s', 300000);

    // Throttled scroll handler
    let scrollTimeout: NodeJS.Timeout;
    const throttledScroll = () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(handleScroll, 250);
    };

    // Event listeners
    window.addEventListener('scroll', throttledScroll, { passive: true });
    window.addEventListener('click', handleInteraction, { passive: true });
    window.addEventListener('keydown', handleInteraction, { passive: true });
    window.addEventListener('beforeunload', trackSessionEnd);
    
    // Page visibility change tracking
    const handleVisibilityChange = () => {
      if (document.hidden) {
        trackSessionEnd();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Track session start
    trackSessionMilestone({
      milestone: 'session_start',
      sessionId,
      duration: 0,
      interactionCount: 0
    });

    // Cleanup function
    return () => {
      window.removeEventListener('scroll', throttledScroll);
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
      window.removeEventListener('beforeunload', trackSessionEnd);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      milestoneIntervals.current.forEach(clearTimeout);
      clearTimeout(scrollTimeout);
    };
  }, [sessionId, handleScroll, handleInteraction, trackSessionEnd]);

  return null;
};

export default React.memo(ComprehensiveSiteTracker);
