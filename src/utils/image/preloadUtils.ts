
/**
 * Utilities for preloading and placeholder generation
 */

import { isLowEndDevice, getConnectionSpeed, isMobileDevice } from './deviceDetection';
import { getOptimizedImageUrl } from './urlGenerator';
import { ImageFormat, getBestImageFormat } from './formatDetection';

// Create low-quality placeholder URLs for blur-up loading
export const createPlaceholderUrl = (url: string): string => {
  if (!url || !url.includes('supabase.co')) return '';
  
  try {
    const placeholderUrl = new URL(url);
    placeholderUrl.searchParams.set('width', '20');
    placeholderUrl.searchParams.set('quality', '30');
    
    return placeholderUrl.toString();
  } catch (error) {
    return '';
  }
};

// Track preloaded images to avoid duplicates
const preloadedImages = new Set<string>();

// Preload critical images - use sparingly and only for above-the-fold content
export const preloadCriticalImage = (url: string, options?: {
  width?: number;
  format?: ImageFormat;
}): void => {
  if (typeof document === 'undefined' || !url) return;
  
  // Skip preloading for hero images as they're already handled in HTML
  if (url.includes('hero-blondify') || url.includes('herom-blondify')) {
    return;
  }
  
  // Skip preloading for service images that are causing CORS issues
  if (url.includes('services_images/')) {
    return;
  }
  
  try {
    const format = options?.format || getBestImageFormat();
    const width = options?.width || (isMobileDevice() ? 640 : 1280);
    
    // Create optimized URL for preloading
    const optimizedUrl = getOptimizedImageUrl(url, { width, format, quality: 80 });
    
    // Skip if already preloaded
    if (preloadedImages.has(optimizedUrl)) return;
    preloadedImages.add(optimizedUrl);
    
    // Skip preloading for low-end devices or slow connections
    if (isLowEndDevice() || getConnectionSpeed() === 'slow') return;
    
    // Create link element for preloading
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = optimizedUrl;
    link.crossOrigin = 'anonymous';
    
    // Add error handling
    link.onerror = () => {
      console.warn('Failed to preload image:', optimizedUrl);
    };
    
    // Add to document head
    document.head.appendChild(link);
    
    // Remove preload link after use to clean up
    setTimeout(() => {
      if (document.head.contains(link)) {
        document.head.removeChild(link);
      }
    }, 3000);
  } catch (error) {
    console.error('Error preloading image:', error);
  }
};

// Batch preload multiple images with intelligent priority - skip problematic images
export const batchPreloadImages = (imageUrls: string[], options?: {
  width?: number;
  format?: ImageFormat;
  delay?: number;
}): void => {
  const { delay = 100 } = options || {};
  
  imageUrls
    .filter(url => 
      !url.includes('hero-blondify') && 
      !url.includes('herom-blondify') &&
      !url.includes('services_images/')
    )
    .forEach((url, index) => {
      setTimeout(() => {
        preloadCriticalImage(url, options);
      }, index * delay);
    });
};
