
import React, { useRef, useState, useEffect } from 'react';
import { useIntersectionObserver } from "@/hooks/use-intersection-observer";
import DeferredScripts from './DeferredScripts';

interface TrustpilotWidgetProps {
  className?: string;
}

const TrustpilotWidget: React.FC<TrustpilotWidgetProps> = ({
  className = ""
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Extreme lazy loading - very high threshold and delay
  const entry = useIntersectionObserver(containerRef, {
    threshold: 0.5,
    rootMargin: '1000px' // Much larger margin
  });
  const isVisible = entry?.isIntersecting;

  useEffect(() => {
    if (isVisible && !isLoaded) {
      // Additional delay even after intersection
      setTimeout(() => {
        setIsLoaded(true);
      }, 5000);
    }
  }, [isVisible, isLoaded]);

  return (
    <div ref={containerRef} className={`trustpilot-widget ${className}`}>
      {/* Ultra-deferred Trustpilot loading */}
      <DeferredScripts delay={20000} userInteraction={true}>
        {isLoaded && (
          <div className="py-8 text-center">
            <div className="inline-block bg-gray-900 px-6 py-4 rounded-lg">
              <p className="text-white">Trustpilot arvostelut ladataan...</p>
            </div>
          </div>
        )}
      </DeferredScripts>
    </div>
  );
};

export default TrustpilotWidget;
