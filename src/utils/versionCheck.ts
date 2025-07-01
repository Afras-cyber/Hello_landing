
// Version check utility for detecting app updates
export interface VersionInfo {
  buildTimestamp: number;
  version: string;
  lastCheck: number;
}

// Get current app version info
export const getCurrentVersion = (): VersionInfo => {
  return {
    buildTimestamp: parseInt((window as any).__BUILD_TIMESTAMP__ || '0'),
    version: (window as any).__APP_VERSION__ || '1.0.0',
    lastCheck: Date.now()
  };
};

// Check if service worker has updates
export const checkForUpdates = async (): Promise<boolean> => {
  if (!('serviceWorker' in navigator)) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration();
    
    if (!registration) {
      return false;
    }

    // Check if there's a waiting service worker
    if (registration.waiting) {
      return true;
    }

    // Force update check
    await registration.update();
    
    return new Promise((resolve) => {
      const checkWaiting = () => {
        if (registration.waiting) {
          resolve(true);
        } else {
          resolve(false);
        }
      };

      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed') {
              checkWaiting();
            }
          });
        }
      });

      // Check immediately in case worker is already waiting
      setTimeout(checkWaiting, 1000);
    });
  } catch (error) {
    console.error('Error checking for updates:', error);
    return false;
  }
};

// Apply pending update
export const applyUpdate = async (): Promise<boolean> => {
  if (!('serviceWorker' in navigator)) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration();
    
    if (registration?.waiting) {
      // Tell the waiting service worker to skip waiting
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      
      // Wait for the new service worker to take control
      return new Promise((resolve) => {
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          resolve(true);
        });
        
        // Fallback timeout
        setTimeout(() => resolve(false), 5000);
      });
    }
    
    return false;
  } catch (error) {
    console.error('Error applying update:', error);
    return false;
  }
};

// Check version periodically
export const startVersionMonitoring = (onUpdateAvailable: () => void) => {
  // Check every 5 minutes
  const checkInterval = 5 * 60 * 1000;
  
  const performCheck = async () => {
    const hasUpdate = await checkForUpdates();
    if (hasUpdate) {
      onUpdateAvailable();
    }
  };

  // Initial check after 30 seconds
  setTimeout(performCheck, 30000);
  
  // Periodic checks
  const interval = setInterval(performCheck, checkInterval);
  
  // Check on focus (when user returns to tab)
  const handleFocus = () => {
    performCheck();
  };
  
  window.addEventListener('focus', handleFocus);
  
  // Return cleanup function
  return () => {
    clearInterval(interval);
    window.removeEventListener('focus', handleFocus);
  };
};
