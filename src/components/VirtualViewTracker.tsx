
import React, { useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface VirtualViewTrackerProps {
  sessionId: string;
  enableDebugMode?: boolean;
}

interface ViewportStats {
  iframeVisible: boolean;
  iframeIntersectionRatio: number;
  scrollPosition: number;
  viewportChanges: number;
  focusEvents: number;
  resizeEvents: number;
  userEngagementScore: number;
  timeInView: number;
  lastInteractionTime: number;
}

const VirtualViewTracker: React.FC<VirtualViewTrackerProps> = ({ 
  sessionId, 
  enableDebugMode = false 
}) => {
  const [stats, setStats] = useState<ViewportStats>({
    iframeVisible: false,
    iframeIntersectionRatio: 0,
    scrollPosition: 0,
    viewportChanges: 0,
    focusEvents: 0,
    resizeEvents: 0,
    userEngagementScore: 0,
    timeInView: 0,
    lastInteractionTime: Date.now()
  });

  const intersectionObserver = useRef<IntersectionObserver | null>(null);
  const engagementInterval = useRef<NodeJS.Timeout | null>(null);
  const startTime = useRef(Date.now());
  const lastScrollTime = useRef(Date.now());

  const debugLog = (message: string, data?: any) => {
    if (enableDebugMode) {
      console.log(`👁️ VIRTUAL VIEW TRACKER: ${message}`, data || '');
    }
  };

  // Setup intersection observer for iframe visibility
  const setupIntersectionObserver = () => {
    debugLog('Setting up intersection observer for iframe visibility');
    
    intersectionObserver.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const isVisible = entry.isIntersecting;
          const ratio = entry.intersectionRatio;
          
          debugLog('Iframe visibility changed', { 
            isVisible, 
            ratio: ratio.toFixed(2),
            target: entry.target.tagName 
          });
          
          setStats(prev => ({
            ...prev,
            iframeVisible: isVisible,
            iframeIntersectionRatio: ratio,
            viewportChanges: prev.viewportChanges + 1,
            lastInteractionTime: Date.now()
          }));
          
          // Track significant visibility changes
          if (isVisible && ratio > 0.5) {
            trackViewEvent('iframe_visible', { intersectionRatio: ratio });
          } else if (!isVisible) {
            trackViewEvent('iframe_hidden', { intersectionRatio: ratio });
          }
        });
      },
      {
        threshold: [0, 0.25, 0.5, 0.75, 1.0],
        rootMargin: '10px'
      }
    );

    // Observe all iframes
    const iframes = document.querySelectorAll('iframe');
    iframes.forEach(iframe => {
      if (intersectionObserver.current) {
        intersectionObserver.current.observe(iframe);
      }
    });
  };

  // Setup scroll tracking
  const setupScrollTracking = () => {
    debugLog('Setting up scroll tracking');
    
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const now = Date.now();
      const timeSinceLastScroll = now - lastScrollTime.current;
      
      // Only update if significant scroll or time passed
      if (Math.abs(scrollY - stats.scrollPosition) > 50 || timeSinceLastScroll > 1000) {
        setStats(prev => ({
          ...prev,
          scrollPosition: scrollY,
          lastInteractionTime: now
        }));
        
        lastScrollTime.current = now;
        
        trackViewEvent('scroll_event', { 
          scrollY, 
          direction: scrollY > stats.scrollPosition ? 'down' : 'up' 
        });
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  };

  // Setup focus and resize tracking
  const setupEngagementTracking = () => {
    debugLog('Setting up engagement tracking');
    
    const handleFocus = () => {
      debugLog('Window focus event');
      setStats(prev => ({
        ...prev,
        focusEvents: prev.focusEvents + 1,
        lastInteractionTime: Date.now()
      }));
      trackViewEvent('window_focus');
    };

    const handleBlur = () => {
      debugLog('Window blur event');
      trackViewEvent('window_blur');
    };

    const handleResize = () => {
      debugLog('Window resize event');
      setStats(prev => ({
        ...prev,
        resizeEvents: prev.resizeEvents + 1,
        lastInteractionTime: Date.now()
      }));
      trackViewEvent('window_resize', {
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('resize', handleResize);
    };
  };

  // Calculate user engagement score
  const calculateEngagementScore = () => {
    const timeOnPage = (Date.now() - startTime.current) / 1000;
    const timeSinceLastInteraction = (Date.now() - stats.lastInteractionTime) / 1000;
    
    let score = 0;
    
    // Time on page score (max 30 points)
    if (timeOnPage > 300) score += 30; // 5+ minutes
    else if (timeOnPage > 120) score += 20; // 2+ minutes
    else if (timeOnPage > 60) score += 10; // 1+ minute
    
    // Interaction frequency (max 25 points)
    const totalInteractions = stats.viewportChanges + stats.focusEvents + stats.resizeEvents;
    if (totalInteractions > 20) score += 25;
    else if (totalInteractions > 10) score += 15;
    else if (totalInteractions > 5) score += 10;
    
    // Recent activity (max 20 points)
    if (timeSinceLastInteraction < 30) score += 20; // Active in last 30s
    else if (timeSinceLastInteraction < 60) score += 15; // Active in last minute
    else if (timeSinceLastInteraction < 120) score += 10; // Active in last 2 minutes
    
    // Iframe visibility (max 25 points)
    if (stats.iframeVisible && stats.iframeIntersectionRatio > 0.75) score += 25;
    else if (stats.iframeVisible && stats.iframeIntersectionRatio > 0.5) score += 20;
    else if (stats.iframeVisible) score += 10;
    
    return Math.min(score, 100);
  };

  // Track view events
  const trackViewEvent = async (eventType: string, data?: any) => {
    try {
      await supabase.rpc('track_iframe_interaction', {
        p_session_id: sessionId,
        p_interaction_type: eventType,
        p_element_selector: 'virtual_view_tracker',
        p_element_text: `Virtual view tracking: ${eventType}`,
        p_timestamp_offset: Math.floor((Date.now() - startTime.current) / 1000),
        p_interaction_data: {
          ...data,
          viewport_stats: stats,
          engagement_score: calculateEngagementScore(),
          virtual_tracking: true
        }
      });
    } catch (error) {
      console.error('Error tracking view event:', error);
    }
  };

  // Update engagement score periodically
  useEffect(() => {
    engagementInterval.current = setInterval(() => {
      const newScore = calculateEngagementScore();
      const timeInView = Math.floor((Date.now() - startTime.current) / 1000);
      
      setStats(prev => ({
        ...prev,
        userEngagementScore: newScore,
        timeInView
      }));
      
      // Log high engagement
      if (newScore > 80) {
        debugLog('High user engagement detected', { score: newScore });
        trackViewEvent('high_engagement', { score: newScore });
      }
    }, 10000); // Update every 10 seconds
    
    return () => {
      if (engagementInterval.current) {
        clearInterval(engagementInterval.current);
      }
    };
  }, [stats]);

  // Initialize all tracking
  useEffect(() => {
    debugLog('🚀 Virtual View Tracker initializing', { sessionId });
    
    setupIntersectionObserver();
    const cleanupScroll = setupScrollTracking();
    const cleanupEngagement = setupEngagementTracking();
    
    // Initial tracking
    trackViewEvent('virtual_tracker_initialized');
    
    return () => {
      if (intersectionObserver.current) {
        intersectionObserver.current.disconnect();
      }
      cleanupScroll();
      cleanupEngagement();
      
      debugLog('Virtual View Tracker cleanup completed');
    };
  }, [sessionId]);

  if (!enableDebugMode) return null;

  return (
    <div className="fixed bottom-4 left-4 bg-indigo-900/90 text-white p-3 rounded-lg text-xs font-mono z-50 max-w-xs">
      <div className="font-bold text-indigo-300 mb-2">👁️ VIRTUAL VIEW</div>
      <div className="space-y-1">
        <div className={`${stats.iframeVisible ? 'text-green-400' : 'text-red-400'}`}>
          Visible: {stats.iframeVisible ? '✅' : '❌'} ({(stats.iframeIntersectionRatio * 100).toFixed(0)}%)
        </div>
        <div>Scroll: {Math.round(stats.scrollPosition)}px</div>
        <div>Viewport: {stats.viewportChanges} changes</div>
        <div>Focus: {stats.focusEvents} events</div>
        <div>Resize: {stats.resizeEvents} events</div>
        <div className={`${stats.userEngagementScore > 70 ? 'text-green-400' : stats.userEngagementScore > 40 ? 'text-yellow-400' : 'text-red-400'}`}>
          Engagement: {stats.userEngagementScore}%
        </div>
        <div>Time: {Math.floor(stats.timeInView / 60)}m {stats.timeInView % 60}s</div>
        <div className="text-indigo-300 text-xs">
          Last: {Math.floor((Date.now() - stats.lastInteractionTime) / 1000)}s ago
        </div>
      </div>
    </div>
  );
};

export default VirtualViewTracker;
