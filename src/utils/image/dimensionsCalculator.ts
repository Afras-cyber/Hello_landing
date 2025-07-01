
/**
 * Utility for calculating optimal image dimensions based on device
 */

import { isMobileDevice, isLowEndDevice, getConnectionSpeed } from './deviceDetection';

// Get image dimensions optimized for the device
export const getOptimalImageDimensions = (
  originalWidth?: number, 
  originalHeight?: number, 
  isMobile = isMobileDevice(),
  isLowEnd = isLowEndDevice()
): { width: number, height?: number } => {
  if (!originalWidth) {
    // Default if no width provided
    return { width: isMobile ? 640 : 1280 };
  }
  
  let targetWidth = originalWidth;
  let targetHeight = originalHeight;
  
  // Calculate aspect ratio if both dimensions are available
  const aspectRatio = (originalHeight && originalWidth) 
    ? originalHeight / originalWidth 
    : 0.5625; // Default 16:9
  
  // For mobile devices, limit max width
  if (isMobile) {
    // For mobile devices, limit max width
    const mobileMaxWidth = isLowEnd ? 480 : 768;
    
    if (targetWidth > mobileMaxWidth) {
      targetWidth = mobileMaxWidth;
      targetHeight = Math.round(targetWidth * aspectRatio);
    }
  } else {
    // For desktop devices
    const desktopMaxWidth = isLowEnd ? 960 : 1920;
    
    if (targetWidth > desktopMaxWidth) {
      targetWidth = desktopMaxWidth;
      targetHeight = Math.round(targetWidth * aspectRatio);
    }
  }
  
  // Further reduce for low-end devices or slow connections
  if (isLowEnd || getConnectionSpeed() === 'slow') {
    // Reduce dimensions further for very low-end devices
    targetWidth = Math.min(targetWidth, isMobile ? 480 : 960);
    targetHeight = targetHeight ? Math.round(targetWidth * aspectRatio) : undefined;
  }
  
  return { 
    width: targetWidth, 
    height: targetHeight
  };
};
