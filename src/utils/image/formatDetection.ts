
/**
 * Utility for detecting and determining optimal image formats
 */

// Define supported image formats
export type ImageFormat = 'webp' | 'avif' | 'jpeg' | 'png' | 'original';

// Helper function with memoization to determine best format based on browser support
export const getBestImageFormat = (() => {
  let cachedFormat: ImageFormat | null = null;
  
  return (): ImageFormat => {
    // Return cached result if available
    if (cachedFormat) return cachedFormat;
    
    if (typeof window === 'undefined') return 'webp'; // Default for SSR
    
    // Check for AVIF support first (better compression than WebP)
    try {
      const canUseAvif = document.createElement('canvas')
        .toDataURL('image/avif').indexOf('data:image/avif') === 0;
      
      if (canUseAvif) {
        cachedFormat = 'avif';
        return 'avif';
      }
    } catch (e) {
      // Ignore AVIF detection errors - fallback to WebP check
    }
    
    // Check for WebP support using canvas
    try {
      const canvas = document.createElement('canvas');
      if (canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0) {
        cachedFormat = 'webp';
        return 'webp';
      }
    } catch (e) {
      // Ignore WebP detection errors - fallback to JPEG
    }
    
    cachedFormat = 'jpeg';
    return 'jpeg';
  };
})();
