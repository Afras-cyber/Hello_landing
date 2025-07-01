
/**
 * Utility for generating optimized image URLs
 */

import { ImageFormat } from './formatDetection';
import { isMobileDevice, isLowEndDevice, getConnectionSpeed } from './deviceDetection';
import { getOptimalImageDimensions } from './dimensionsCalculator';

// Normalize image paths from various sources (Supabase, relative paths, etc.)
export const normalizeImagePath = (imagePath: string | null | undefined): string => {
  if (!imagePath) return '/placeholder.svg';
  
  try {
    // If it's already a full URL, return it encoded properly
    if (imagePath.startsWith('http')) {
      const url = new URL(imagePath);
      return url.toString();
    }
    
    // For Supabase storage paths
    if (imagePath.startsWith('/')) {
      const storageUrl = "https://faytlsrwiszkvakznkux.supabase.co/storage/v1/object/public";
      const cleanPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
      const encodedPath = encodeURIComponent(cleanPath).replace(/%2F/g, '/');
      return `${storageUrl}/media/${encodedPath}`;
    }
    
    return imagePath;
  } catch (error) {
    console.error('Error normalizing image path:', error, 'Path:', imagePath);
    return '/placeholder.svg';
  }
};

// Convert Supabase URLs to optimized versions with aggressive compression
export const getOptimizedImageUrl = (
  url: string,
  options: {
    width?: number;
    height?: number;
    format?: ImageFormat;
    quality?: number;
    priority?: boolean;
  } = {}
): string => {
  if (!url || url.startsWith('data:')) return url;

  try {
    const normalizedUrl = normalizeImagePath(url);
    if (normalizedUrl === '/placeholder.svg') return normalizedUrl;

    if (normalizedUrl.includes('supabase.co')) {
      const optimizedUrl = new URL(normalizedUrl);
      const isMobile = isMobileDevice();
      const isLowEnd = isLowEndDevice();
      const connectionSpeed = getConnectionSpeed();

      // More aggressive size reduction for performance
      const { width: targetWidth, height: targetHeight } = getOptimalImageDimensions(
        options.width,
        options.height,
        isMobile,
        isLowEnd
      );

      // Limit maximum sizes more aggressively
      const maxWidth = isMobile ? 800 : 1600; // Reduced from previous limits
      const finalWidth = Math.min(targetWidth || maxWidth, maxWidth);

      if (finalWidth) {
        optimizedUrl.searchParams.set('width', String(finalWidth));
      }
      if (targetHeight) {
        const finalHeight = Math.min(targetHeight, Math.round(finalWidth * 1.5)); // Limit aspect ratio
        optimizedUrl.searchParams.set('height', String(finalHeight));
      }

      const format = options.format || 'webp';
      if (format !== 'original') {
        optimizedUrl.searchParams.set('format', format);
      }

      // More aggressive quality reduction for faster loading
      let quality = options.quality;
      if (!quality) {
        if (options.priority) {
          quality = isMobile ? 65 : 70; // Reduced from 80/85
        } else if (isLowEnd || connectionSpeed === 'slow') {
          quality = 50; // Much more aggressive for slow connections
        } else {
          quality = isMobile ? 60 : 65; // Reduced from 70/75
        }
      }
      optimizedUrl.searchParams.set('quality', String(quality));
      
      // Add aggressive caching
      optimizedUrl.searchParams.set('cache-control', 'public, max-age=31536000, immutable');
      
      return optimizedUrl.toString();
    }

    return normalizedUrl;
  } catch (error) {
    console.error('Error optimizing image URL:', error, 'URL:', url);
    return url;
  }
};

// Generate responsive srcset with fewer sizes for better caching
export const generateSrcSet = (url: string, format: 'avif' | 'webp' | 'jpeg', options: { width?: number, priority?: boolean } = {}): string => {
  if (!url || url.startsWith('data:')) return url;
  
  try {
    const normalizedUrl = normalizeImagePath(url);
    if (normalizedUrl === '/placeholder.svg' || !normalizedUrl.includes('supabase.co')) {
        return normalizedUrl;
    }

    const isMobile = isMobileDevice();
    const baseWidth = options.width || (isMobile ? 400 : 800); // Reduced base sizes
    
    // Fewer sizes for better cache hit rates and performance
    const widths = [
        Math.round(baseWidth * 0.5),
        baseWidth,
        Math.round(baseWidth * 1.25) // Reduced from 1.5x multiplier
    ].filter(w => w > 100 && w < 2000); // Stricter size limits
    
    const uniqueWidths = [...new Set(widths)].sort((a,b) => a - b);

    return uniqueWidths
      .map(width => {
        const optimizedUrl = getOptimizedImageUrl(normalizedUrl, { 
          width,
          format,
          priority: options.priority,
        });
        return `${optimizedUrl} ${width}w`;
      })
      .join(', ');
  } catch (error) {
    console.error('Error generating srcSet:', error, 'URL:', url);
    return url;
  }
};
