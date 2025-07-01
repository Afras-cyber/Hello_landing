
import { RefObject, useEffect, useState } from 'react';

interface IntersectionObserverOptions {
  root?: Element | null;
  rootMargin?: string;
  threshold?: number | number[];
  skipInitial?: boolean; 
  once?: boolean; 
}

interface IntersectionObserverEntry {
  isIntersecting: boolean;
  target: Element;
  boundingClientRect?: DOMRectReadOnly;
  intersectionRatio?: number;
}

// Create a shared observer cache to reduce the number of observer instances
const observerCache = new Map();

// Create a singleton manager for observers
const getObserverInstance = (options: IntersectionObserverOptions, callback: IntersectionObserverCallback) => {
  const key = `${options.rootMargin}-${JSON.stringify(options.threshold)}`;
  
  if (!observerCache.has(key)) {
    observerCache.set(
      key,
      new IntersectionObserver(callback, options)
    );
  }
  return observerCache.get(key);
};

/**
 * Simplified intersection observer hook with better fallbacks
 */
export function useIntersectionObserver(
  elementRef: RefObject<Element>,
  options: IntersectionObserverOptions = {}
): IntersectionObserverEntry | null {
  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null);
  const [hasIntersected, setHasIntersected] = useState(false);

  const { 
    root = null, 
    rootMargin = '100px', // More generous default margin
    threshold = 0.01, // Lower default threshold
    skipInitial = false,
    once = false
  } = options;

  useEffect(() => {
    const element = elementRef.current;
    
    // Return early if conditions are met
    if (!element || (once && hasIntersected)) {
      return;
    }

    // Fallback for unsupported browsers or better immediate visibility
    if (!('IntersectionObserver' in window)) {
      setEntry({ isIntersecting: true, target: element });
      if (once) setHasIntersected(true);
      return;
    }

    // Immediate visibility check for elements already in viewport
    const checkInitialVisibility = () => {
      const rect = element.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // If element is in or near viewport, consider it visible immediately
      if (rect.top < windowHeight + 200 && rect.bottom > -200) {
        setEntry({
          isIntersecting: true,
          target: element
        });
        
        if (once) {
          setHasIntersected(true);
        }
        return true;
      }
      return false;
    };
    
    // Check visibility immediately
    if (checkInitialVisibility()) {
      return;
    }

    // Handle intersection
    const handleIntersection = (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      
      if (!entry) return;
      
      setEntry({
        isIntersecting: entry.isIntersecting,
        target: entry.target,
        boundingClientRect: entry.boundingClientRect,
        intersectionRatio: entry.intersectionRatio
      });
      
      // If this element has intersected and we're using the 'once' option
      if (entry.isIntersecting && once) {
        setHasIntersected(true);
      }
    };

    // Create observer with more permissive settings
    const observer = getObserverInstance(
      { root, rootMargin, threshold },
      handleIntersection
    );

    observer.observe(element);

    // Cleanup
    return () => {
      observer.unobserve(element);
    };
  }, [elementRef, root, rootMargin, threshold, skipInitial, once, hasIntersected]);

  return entry;
}
