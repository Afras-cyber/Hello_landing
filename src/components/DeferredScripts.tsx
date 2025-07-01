
import React, { useEffect, useState } from 'react';

interface DeferredScriptsProps {
  children: React.ReactNode;
  delay?: number;
  userInteraction?: boolean;
}

const DeferredScripts: React.FC<DeferredScriptsProps> = ({
  children,
  delay = 8000, // Increased default delay for mobile performance
  userInteraction = true // Default to requiring user interaction
}) => {
  const [shouldLoad, setShouldLoad] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  useEffect(() => {
    // Enhanced mobile and low-end device detection
    const connection = (navigator as any).connection;
    const isMobile = window.innerWidth < 768;
    const isSlowDevice = navigator.hardwareConcurrency <= 2 || 
                        (connection && (connection.saveData || connection.effectiveType === 'slow-2g'));
    
    // Much longer delays for mobile and slow devices
    const mobileMultiplier = isMobile ? 2 : 1;
    const slowDeviceMultiplier = isSlowDevice ? 2 : 1;
    const adjustedDelay = delay * mobileMultiplier * slowDeviceMultiplier;

    if (userInteraction) {
      // Load only after meaningful user interaction
      const handleInteraction = () => {
        if (!hasInteracted) {
          setHasInteracted(true);
          // Additional delay even after interaction on mobile
          setTimeout(() => {
            setShouldLoad(true);
          }, isMobile ? 2000 : 500);
        }
      };

      // More selective interaction events for mobile performance
      const events = isMobile 
        ? ['touchstart', 'scroll'] // Fewer events on mobile
        : ['mousedown', 'touchstart', 'keydown', 'scroll'];
        
      events.forEach(event => {
        document.addEventListener(event, handleInteraction, { 
          once: true, 
          passive: true,
          capture: false 
        });
      });

      // Very long fallback delay, especially on mobile
      const fallbackTimer = setTimeout(() => {
        if (!hasInteracted) {
          setShouldLoad(true);
        }
      }, adjustedDelay + (isMobile ? 15000 : 5000)); // Extra 15s on mobile

      return () => {
        events.forEach(event => {
          document.removeEventListener(event, handleInteraction);
        });
        clearTimeout(fallbackTimer);
      };
    } else {
      // Simple delay-based loading with mobile consideration
      const timer = setTimeout(() => {
        setShouldLoad(true);
      }, adjustedDelay);

      return () => clearTimeout(timer);
    }
  }, [delay, userInteraction, hasInteracted]);

  return shouldLoad ? <>{children}</> : null;
};

export default DeferredScripts;
