
import React, { useState, useRef, useEffect } from 'react';
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
  const maxRetries = 2; // Reduced from 3 to 2 for faster error handling
  
  const entry = useIntersectionObserver(containerRef, {
    rootMargin: priority ? '0px' : '300px', // Reduced from 200px to 300px for better performance
    threshold: 0.01
  });
  const isVisible = priority || !!entry?.isIntersecting;

  const normalizedSrc = normalizeImagePath(src);

  // Reset error state when src changes
  useEffect(() => {
    setHasError(false);
    setRetryCount(0);
    setIsLoaded(false);
  }, [src]);

  // More aggressive image optimization
  const getResponsiveImageUrl = (targetWidth: number) => {
    // Use smaller sizes for better performance
    const optimizedWidth = Math.min(targetWidth, width);
    const quality = priority ? 70 : 60; // Lower quality for faster loading
    
    return getOptimizedImageUrl(normalizedSrc, { 
      width: optimizedWidth, 
      height: Math.round((optimizedWidth / width) * height),
      quality,
      priority 
    });
  };

  const handleLoad = () => {
    setIsLoaded(true);
    setHasError(false);
  };

  const handleError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    console.warn('OptimizedImage load error for:', src);
    
    if (retryCount < maxRetries) {
      setTimeout(() => {
        setRetryCount(prev => prev + 1);
      }, 500 * Math.pow(2, retryCount)); // Faster retry timing
    } else {
      setHasError(true);
      setIsLoaded(true);
      e.currentTarget.src = '/placeholder.svg';
    }
  };

  // Generate optimized srcset with fewer sizes for better caching
  const srcSet = isVisible && !hasError ? [
    `${getResponsiveImageUrl(width * 0.5)} ${Math.round(width * 0.5)}w`,
    `${getResponsiveImageUrl(width)} ${width}w`,
    `${getResponsiveImageUrl(width * 1.5)} ${Math.round(width * 1.5)}w`
  ].join(', ') : '';

  const fallbackSrc = !hasError ? getResponsiveImageUrl(width) : '/placeholder.svg';
  const showSkeleton = placeholder === 'skeleton' && !isLoaded && !hasError;

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
      style={{
        width: '100%',
        height: '100%',
        aspectRatio: `${width} / ${height}`,
      }}
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
          key={`${src}-${retryCount}`}
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
          className={`w-full h-full object-cover transition-opacity duration-200 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          sizes={sizes}
          {...props}
        />
      )}
    </div>
  );
};

export default React.memo(OptimizedImage);
