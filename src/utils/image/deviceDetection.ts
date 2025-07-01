
/**
 * Utility for detecting device capabilities and connection speed
 */

// Helper function to detect connection speed with memoization
export const getConnectionSpeed = (() => {
  let cachedSpeed: 'slow' | 'medium' | 'fast' | null = null;
  
  return (): 'slow' | 'medium' | 'fast' => {
    if (cachedSpeed) return cachedSpeed;
    
    if (typeof navigator === 'undefined') return 'medium';
    
    if ('connection' in navigator) {
      const conn = (navigator as any).connection;
      
      if (conn) {
        if (conn.saveData) {
          cachedSpeed = 'slow';
          return 'slow';
        }
        
        if (conn.effectiveType === 'slow-2g' || conn.effectiveType === '2g') {
          cachedSpeed = 'slow';
          return 'slow';
        }
        
        if (conn.effectiveType === '3g') {
          cachedSpeed = 'medium';
          return 'medium';
        }
        
        if (conn.downlink < 1) {
          cachedSpeed = 'slow';
          return 'slow';
        }
        
        if (conn.downlink < 5) {
          cachedSpeed = 'medium';
          return 'medium';
        }
      }
    }
    
    cachedSpeed = 'fast';
    return 'fast';
  };
})();

// Helper function to check if device is low-end with memoization
export const isLowEndDevice = (() => {
  let cachedResult: boolean | null = null;
  
  return (): boolean => {
    if (cachedResult !== null) return cachedResult;
    
    if (typeof window === 'undefined') return false;
    
    // Check connection quality
    const isSlowConnection = (
      ('connection' in navigator && 
       ((navigator as any).connection?.saveData || 
        (navigator as any).connection?.effectiveType === 'slow-2g' ||
        (navigator as any).connection?.effectiveType === '2g'))
    );
    
    // Check device memory
    const isLowMemory = ('deviceMemory' in navigator && (navigator as any).deviceMemory < 4);
    
    // Check CPU cores if available
    const isLowCPU = ('hardwareConcurrency' in navigator && (navigator as any).hardwareConcurrency <= 4);
    
    // Use performance.now to check if device is slow to execute JavaScript
    const start = performance.now();
    let counter = 0;
    for (let i = 0; i < 1000000; i++) {
      counter++;
    }
    const end = performance.now();
    const isSlowExecution = (end - start) > 50; // More than 50ms to execute this loop
    
    // Determine if this is a low-end device
    cachedResult = isSlowConnection || isLowMemory || (isLowCPU && isSlowExecution);
    return cachedResult;
  };
})();

// Helper function to check if device is mobile with memoization
export const isMobileDevice = (() => {
  let cachedResult: boolean | null = null;
  
  return (): boolean => {
    if (cachedResult !== null) return cachedResult;
    
    if (typeof window === 'undefined') return false;
    
    // Primary check: screen width
    const isMobileWidth = window.innerWidth < 768;
    
    // Secondary check: user agent (less reliable)
    const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    // Additional check for touch capability
    const hasTouch = ('ontouchstart' in window) || 
                    (navigator.maxTouchPoints > 0) || 
                    ((navigator as any).msMaxTouchPoints > 0);
    
    // Determine if this is a mobile device (prioritize screen width)
    cachedResult = isMobileWidth || (isMobileUA && hasTouch);
    return cachedResult;
  };
})();
