
import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { isLowEndDevice, isMobileDevice, getConnectionSpeed } from '@/utils/image/deviceDetection';
import { trackPageView, trackSessionMilestone, trackScrollDepth } from '@/utils/gtmTracking';
import DeferredScripts from './DeferredScripts';

const TagManager: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    // Initialize dataLayer immediately for core tracking
    window.dataLayer = window.dataLayer || [];
    
    // Track page views with enhanced data
    const trackEnhancedPageView = () => {
      const pageData = {
        page_path: location.pathname,
        page_title: document.title,
        page_search: location.search,
        page_hash: location.hash,
        referrer: document.referrer,
        user_agent: navigator.userAgent,
        viewport_size: `${window.innerWidth}x${window.innerHeight}`,
        device_type: isMobileDevice() ? 'mobile' : 'desktop',
        connection_speed: getConnectionSpeed(),
        is_low_end_device: isLowEndDevice()
      };

      trackPageView(location.pathname, document.title, pageData);
    };

    trackEnhancedPageView();
  }, [location.pathname]);

  // Set up enhanced tracking
  useEffect(() => {
    const sessionId = sessionStorage.getItem('session_id') || 
      Date.now().toString() + Math.random().toString(36).substr(2, 9);
    
    if (!sessionStorage.getItem('session_id')) {
      sessionStorage.setItem('session_id', sessionId);
    }

    let sessionStartTime = Date.now();
    let scrollDepthTracked: number[] = [];
    let milestoneIntervals: NodeJS.Timeout[] = [];

    // Track session milestones
    const trackMilestone = (milestone: 'session_30s' | 'session_60s' | 'session_300s', delay: number) => {
      const interval = setTimeout(() => {
        trackSessionMilestone({
          milestone,
          sessionId,
          duration: Math.floor((Date.now() - sessionStartTime) / 1000),
          interactionCount: 0 // This would need to be tracked separately
        });
      }, delay);
      milestoneIntervals.push(interval);
    };

    // Set up milestone tracking
    trackMilestone('session_30s', 30000);
    trackMilestone('session_60s', 60000);
    trackMilestone('session_300s', 300000);

    // Enhanced scroll depth tracking
    const handleScroll = () => {
      const scrollPercent = Math.round(
        (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
      );

      // Track at 25%, 50%, 75%, 90% intervals
      [25, 50, 75, 90].forEach(threshold => {
        if (scrollPercent >= threshold && !scrollDepthTracked.includes(threshold)) {
          scrollDepthTracked.push(threshold);
          trackScrollDepth(threshold, sessionId);
        }
      });
    };

    // Throttled scroll handler
    let scrollTimeout: NodeJS.Timeout;
    const throttledScroll = () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(handleScroll, 250);
    };

    window.addEventListener('scroll', throttledScroll, { passive: true });

    // Track session start
    trackSessionMilestone({
      milestone: 'session_start',
      sessionId,
      duration: 0,
      interactionCount: 0
    });

    // Cleanup
    return () => {
      window.removeEventListener('scroll', throttledScroll);
      milestoneIntervals.forEach(clearTimeout);
      clearTimeout(scrollTimeout);
    };
  }, []);

  const deviceCapabilities = {
    isLowEnd: isLowEndDevice(),
    isMobile: isMobileDevice(),
    connectionSpeed: getConnectionSpeed(),
    saveData: typeof navigator !== 'undefined' && 'connection' in navigator && 
      (navigator as any).connection?.saveData === true
  };

  const shouldReduceTracking = deviceCapabilities.isLowEnd || 
    deviceCapabilities.isMobile || 
    deviceCapabilities.connectionSpeed === 'slow' || 
    deviceCapabilities.saveData;

  // Adjust GTM loading delay based on device capabilities
  const gtmDelay = shouldReduceTracking ? 8000 : 5000;

  const LoadGTM = () => {
    useEffect(() => {
      // Check if GTM is already loaded
      if (document.getElementById('gtm-script')) return;
      
      // Define gtag function before script loads
      window.gtag = window.gtag || function(){
        (window.dataLayer = window.dataLayer || []).push(arguments)
      };
      
      // Enhanced GTM configuration
      const gtmId = 'GTM-M7LGK444';
      const configParams = new URLSearchParams({
        id: gtmId,
        ...(shouldReduceTracking && { 'gtm_auth': 'reduce_monitoring' }),
        l: 'dataLayer'
      });

      // Create and inject GTM script with enhanced error handling
      const script = document.createElement('script');
      script.id = 'gtm-script';
      script.async = true;
      script.onerror = () => {
        console.error('Failed to load Google Tag Manager');
        // Fallback tracking
        window.dataLayer.push({
          event: 'gtm_load_failed',
          error_message: 'GTM script failed to load'
        });
      };
      
      script.innerHTML = `
        (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
        new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
        j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
        'https://www.googletagmanager.com/gtm.js?${configParams.toString()}';
        j.onerror=function(){console.error('GTM script load failed');};
        f.parentNode.insertBefore(j,f);
        })(window,document,'script','dataLayer','${gtmId}');
      `;
      
      document.body.appendChild(script);
      
      // Add noscript iframe with enhanced attributes
      if (!document.getElementById('gtm-ns')) {
        const noscript = document.createElement('noscript');
        noscript.id = 'gtm-ns';
        const iframe = document.createElement('iframe');
        iframe.src = `https://www.googletagmanager.com/ns.html?id=${gtmId}`;
        iframe.height = "0";
        iframe.width = "0";
        iframe.style.display = "none";
        iframe.style.visibility = "hidden";
        iframe.loading = "lazy";
        noscript.appendChild(iframe);
        document.body.insertBefore(noscript, document.body.firstChild);
      }

      // Push initial configuration to dataLayer
      window.dataLayer.push({
        'gtm.start': new Date().getTime(),
        event: 'gtm.js',
        'gtm.uniqueEventId': Date.now(),
        device_capabilities: deviceCapabilities,
        performance_mode: shouldReduceTracking ? 'reduced' : 'full'
      });

      // Enhanced Ecommerce configuration
      window.dataLayer.push({
        event: 'gtm_config',
        ecommerce: {
          currency: 'EUR',
          business_type: 'hair_salon'
        },
        custom_dimensions: {
          site_version: '2.0',
          tracking_version: 'enhanced',
          user_type: 'visitor'
        }
      });

    }, []);

    return null;
  };

  return (
    <DeferredScripts delay={gtmDelay} userInteraction={true}>
      <LoadGTM />
    </DeferredScripts>
  );
};

export default React.memo(TagManager);
