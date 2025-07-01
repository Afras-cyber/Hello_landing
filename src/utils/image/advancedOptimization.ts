
/**
 * Advanced image optimization for PageSpeed performance
 */

import { isMobileDevice, isLowEndDevice, getConnectionSpeed } from './deviceDetection';

// Critical path image optimization - much more aggressive for mobile
export const getCriticalImageUrl = (url: string, options: {
  width?: number;
  height?: number;
  isCritical?: boolean;
  quality?: number;
} = {}): string => {
  if (!url || url.startsWith('data:')) return url;
  
  try {
    const isMobile = isMobileDevice();
    const isLowEnd = isLowEndDevice();
    const connectionSpeed = getConnectionSpeed();
    
    // Much more aggressive mobile optimization
    const targetWidth = isMobile ? 
      Math.min(options.width || 480, 480) : // Mobile max 480px
      Math.min(options.width || 1280, 1920); // Desktop max 1920px
    
    // Ultra-aggressive quality for mobile performance
    let quality = options.quality;
    if (!quality) {
      if (isMobile || connectionSpeed === 'slow') {
        quality = options.isCritical ? 65 : 60; // Much lower for mobile
      } else if (isLowEnd) {
        quality = 70;
      } else {
        quality = 80;
      }
    }
    
    if (url.includes('supabase.co')) {
      const optimizedUrl = new URL(url);
      optimizedUrl.searchParams.set('width', targetWidth.toString());
      if (options.height) {
        optimizedUrl.searchParams.set('height', options.height.toString());
      }
      optimizedUrl.searchParams.set('quality', quality.toString());
      
      // Use AVIF for modern browsers, WebP fallback
      const format = supportsAVIF() ? 'avif' : 'webp';
      optimizedUrl.searchParams.set('format', format);
      
      return optimizedUrl.toString();
    }
    
    return url;
  } catch (error) {
    console.error('Error optimizing critical image:', error);
    return url;
  }
};

// AVIF support detection with caching
let avifSupport: boolean | null = null;
export const supportsAVIF = (): boolean => {
  if (avifSupport !== null) return avifSupport;
  
  if (typeof window === 'undefined') return false;
  
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    avifSupport = canvas.toDataURL('image/avif').startsWith('data:image/avif');
    return avifSupport;
  } catch {
    avifSupport = false;
    return false;
  }
};

// Generate critical srcset with AVIF/WebP
export const generateCriticalSrcSet = (url: string): string => {
  if (!url || !url.includes('supabase.co')) return url;
  
  const isMobile = isMobileDevice();
  const connectionSpeed = getConnectionSpeed();
  
  // Use fewer sizes for performance
  const widths = isMobile ? [320, 480] : [480, 768, 1024];
  
  const format = supportsAVIF() ? 'avif' : 'webp';
  const quality = connectionSpeed === 'slow' ? 60 : 65;
  
  return widths.map(width => {
    const optimizedUrl = getCriticalImageUrl(url, { 
      width, 
      quality,
      isCritical: true 
    });
    return `${optimizedUrl} ${width}w`;
  }).join(', ');
};

// Create ultra-low quality placeholder
export const createBlurPlaceholder = (url: string): string => {
  if (!url || !url.includes('supabase.co')) return '';
  
  try {
    const blurUrl = new URL(url);
    blurUrl.searchParams.set('width', '20');
    blurUrl.searchParams.set('height', '15');
    blurUrl.searchParams.set('quality', '20');
    blurUrl.searchParams.set('format', 'webp');
    return blurUrl.toString();
  } catch {
    return '';
  }
};
