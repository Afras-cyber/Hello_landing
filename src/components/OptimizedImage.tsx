import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useIntersectionObserver } from "@/hooks/use-intersection-observer";
import { getOptimizedImageUrl, generateSrcSet, normalizeImagePath } from '@/hooks/use-optimized-image';

interface OptimizedImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt'> {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  priority?: boolean;
  sizes?: string;
  placeholder?: 'skeleton' | 'blur' | 'none';
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  sizes = "100vw",
  placeholder = 'skeleton',
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const maxRetries = 2;
  
  const entry = useIntersectionObserver(containerRef, {
    rootMargin: priority ? '0px' : '300px',
    threshold: 0.01
  });
  const isVisible = priority || !!entry?.isIntersecting;

  // Memoize normalized src to prevent recalculation
  const normalizedSrc = useMemo(() => normalizeImagePath(src), [src]);

  // Reset error state when src changes
  useEffect(() => {
    setHasError(false);
    setRetryCount(0);
    setIsLoaded(false);
  }, [normalizedSrc]);

  // Memoize responsive image URL generator
  const getResponsiveImageUrl = useCallback((targetWidth: number) => {
    const optimizedWidth = Math.min(targetWidth, width);
    const quality = priority ? 70 : 60;
    
    return getOptimizedImageUrl(normalizedSrc, { 
      width: optimizedWidth, 
      height: Math.round((optimizedWidth / width) * height),
      quality,
      priority 
    });
  }, [normalizedSrc, width, height, priority]);

  // Optimize event handlers with useCallback
  const handleLoad = useCallback(() => {
    setIsLoaded(true);
    setHasError(false);
  }, []);

  const handleError = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    console.warn('OptimizedImage load error for:', src);
    
    if (retryCount < maxRetries) {
      const timeoutId = setTimeout(() => {
        setRetryCount(prev => prev + 1);
      }, 300 * Math.pow(1.5, retryCount)); // Faster exponential backoff
      
      // Cleanup timeout on unmount
      return () => clearTimeout(timeoutId);
    } else {
      setHasError(true);
      setIsLoaded(true);
      e.currentTarget.src = '/placeholder.svg';
    }
  }, [retryCount, maxRetries, src]);

  // Memoize srcSet generation - only recalculate when dependencies change
  const srcSet = useMemo(() => {
    if (!isVisible || hasError) return '';
    
    // Optimized breakpoints for better caching
    const breakpoints = [
      Math.round(width * 0.5),
      width,
      Math.round(width * 1.5)
    ];
    
    return breakpoints
      .map(w => `${getResponsiveImageUrl(w)} ${w}w`)
      .join(', ');
  }, [isVisible, hasError, width, getResponsiveImageUrl]);

  // Memoize fallback src
  const fallbackSrc = useMemo(() => 
    !hasError ? getResponsiveImageUrl(width) : '/placeholder.svg',
    [hasError, getResponsiveImageUrl, width]
  );

  // Memoize computed values
  const showSkeleton = placeholder === 'skeleton' && !isLoaded && !hasError;
  
  // Memoize style object to prevent recreation
  const containerStyle = useMemo(() => ({
    width: '100%',
    height: '100%',
    aspectRatio: `${width} / ${height}`,
  }), [width, height]);

  // Memoize image class to prevent string concatenation on every render
  const imageClassName = useMemo(() => 
    `w-full h-full object-cover transition-opacity duration-200 ${
      isLoaded ? 'opacity-100' : 'opacity-0'
    }`,
    [isLoaded]
  );

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
      style={containerStyle}
    >
      {showSkeleton && (
        <div className="absolute inset-0 bg-gray-800 animate-pulse" />
      )}
      
      {hasError && (
        <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
          <span className="text-gray-400 text-sm text-center p-4">
            Kuvan lataus epäonnistui
          </span>
        </div>
      )}
      
      {isVisible && !hasError && (
        <img
          key={`${normalizedSrc}-${retryCount}`}
          src={fallbackSrc}
          srcSet={srcSet}
          alt={alt}
          width={width}
          height={height}
          onLoad={handleLoad}
          onError={handleError}
          loading={priority ? "eager" : "lazy"}
          decoding={priority ? "sync" : "async"}
          fetchPriority={priority ? "high" : "auto"}
          className={imageClassName}
          sizes={sizes}
          {...props}
        />
      )}
    </div>
  );
};

// More aggressive memoization with custom comparison
export default React.memo(OptimizedImage, (prevProps, nextProps) => {
  // Custom comparison for better memoization
  return (
    prevProps.src === nextProps.src &&
    prevProps.alt === nextProps.alt &&
    prevProps.width === nextProps.width &&
    prevProps.height === nextProps.height &&
    prevProps.className === nextProps.className &&
    prevProps.priority === nextProps.priority &&
    prevProps.sizes === nextProps.sizes &&
    prevProps.placeholder === nextProps.placeholder
  );
});