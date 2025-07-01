
import { useState, useEffect } from 'react';
import { 
  getOptimizedImageUrl, 
  generateSrcSet, 
  normalizeImagePath 
} from '@/utils/image/urlGenerator';
import { 
  isMobileDevice, 
  isLowEndDevice, 
  getConnectionSpeed 
} from '@/utils/image/deviceDetection';

// Export all utility functions for direct use
export { 
  getOptimizedImageUrl, 
  generateSrcSet, 
  normalizeImagePath,
  isMobileDevice, 
  isLowEndDevice, 
  getConnectionSpeed 
};

// Hook for image optimization settings
export const useImageOptimization = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isLowEnd, setIsLowEnd] = useState(false);
  const [connection, setConnection] = useState<'slow' | 'medium' | 'fast'>('medium');
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    // This code only runs on client-side
    setIsClient(true);
    setIsMobile(isMobileDevice());
    setIsLowEnd(isLowEndDevice());
    setConnection(getConnectionSpeed());
    
    // Add event listener for resize to update mobile status
    const handleResize = () => {
      setIsMobile(isMobileDevice());
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  return {
    isMobile,
    isLowEnd,
    connectionSpeed: connection,
    isClient,
    // Utility function for getting optimized image settings
    getOptimalQuality: () => {
      if (isLowEnd || connection === 'slow') return 70;
      if (isMobile) return 80;
      return 90;
    }
  };
};

// Default export for backward compatibility
export default useImageOptimization;
