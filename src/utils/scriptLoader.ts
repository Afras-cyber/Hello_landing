
/**
 * Optimized script loader for better performance control
 * Loads scripts in a non-blocking manner with configurable priorities
 */

type ScriptPriority = 'critical' | 'high' | 'medium' | 'low' | 'idle';

interface ScriptLoadOptions {
  id: string;
  src?: string;
  innerHTML?: string;
  async?: boolean;
  defer?: boolean;
  priority: ScriptPriority;
  onLoad?: () => void;
  dataset?: Record<string, string>;
  attributes?: Record<string, string>;
  parentElement?: 'head' | 'body';
}

interface DeviceCapabilities {
  isLowEndDevice: boolean;
  isMobileDevice: boolean;
  connectionSpeed: 'slow' | 'medium' | 'fast';
  saveDataMode: boolean;
}

/**
 * Check device capabilities once and cache result
 */
let cachedDeviceCapabilities: DeviceCapabilities | null = null;
export const getDeviceCapabilities = (): DeviceCapabilities => {
  if (cachedDeviceCapabilities) return cachedDeviceCapabilities;
  
  // Check connection type
  const connection = (navigator as any).connection;
  const effectiveType = connection?.effectiveType || 'unknown';
  
  const capabilities: DeviceCapabilities = {
    isLowEndDevice: 
      ('deviceMemory' in navigator && (navigator as any).deviceMemory < 4) ||
      effectiveType === 'slow-2g' || 
      effectiveType === '2g',
    
    isMobileDevice: window.innerWidth < 768 || 
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
    
    connectionSpeed: 
      (effectiveType === '4g' ? 'fast' : 
       effectiveType === '3g' ? 'medium' : 'slow'),
    
    saveDataMode: Boolean(connection?.saveData)
  };
  
  cachedDeviceCapabilities = capabilities;
  return capabilities;
};

/**
 * Check if a script with the given ID is already loaded
 */
export const isScriptLoaded = (id: string): boolean => {
  return !!document.getElementById(id);
};

/**
 * Load a script with the specified options and priority
 */
export const loadScript = (options: ScriptLoadOptions): Promise<void> => {
  const { 
    id, src, innerHTML, async = true, defer = false, 
    priority, onLoad, dataset, attributes,
    parentElement = 'head'
  } = options;
  
  // Don't load if already exists
  if (isScriptLoaded(id)) {
    return Promise.resolve();
  }
  
  return new Promise((resolve) => {
    // Create script element
    const script = document.createElement('script');
    script.id = id;
    
    if (src) script.src = src;
    if (innerHTML) script.innerHTML = innerHTML;
    
    script.async = async;
    script.defer = defer;
    
    // Add any dataset attributes
    if (dataset) {
      Object.entries(dataset).forEach(([key, value]) => {
        script.dataset[key] = value;
      });
    }
    
    // Add any custom attributes
    if (attributes) {
      Object.entries(attributes).forEach(([key, value]) => {
        script.setAttribute(key, value);
      });
    }
    
    // Handle load event
    script.onload = () => {
      if (onLoad) onLoad();
      resolve();
    };
    
    script.onerror = () => {
      console.warn(`Failed to load script: ${id}`);
      resolve();
    };
    
    // Schedule script loading based on priority
    const loadWithPriority = () => {
      const parent = parentElement === 'head' ? 
        document.head : document.body;
        
      parent.appendChild(script);
    };
    
    const deviceCapabilities = getDeviceCapabilities();
    
    // Load scripts based on priority and device capabilities
    switch (priority) {
      case 'critical':
        // Load immediately
        loadWithPriority();
        break;
        
      case 'high':
        // Slight delay for high priority, longer on low-end devices
        setTimeout(
          loadWithPriority, 
          deviceCapabilities.isLowEndDevice ? 1000 : 500
        );
        break;
        
      case 'medium':
        // Use requestIdleCallback when available
        if ('requestIdleCallback' in window) {
          (window as any).requestIdleCallback(loadWithPriority, { timeout: 3000 });
        } else {
          setTimeout(
            loadWithPriority, 
            deviceCapabilities.isLowEndDevice ? 3000 : 1000
          );
        }
        break;
        
      case 'low':
        // Longer delay for low priority scripts
        setTimeout(
          loadWithPriority, 
          deviceCapabilities.isLowEndDevice ? 5000 : 2000
        );
        break;
        
      case 'idle':
        // Load only when completely idle
        if ('requestIdleCallback' in window) {
          (window as any).requestIdleCallback(loadWithPriority, { timeout: 10000 });
        } else {
          // For browsers without requestIdleCallback, use a very long delay
          setTimeout(loadWithPriority, 5000);
        }
        break;
    }
  });
};

/**
 * Load multiple scripts in order with their respective priorities
 */
export const loadScriptsSequentially = async (options: ScriptLoadOptions[]): Promise<void> => {
  for (const option of options) {
    await loadScript(option);
  }
};

/**
 * Load Google Analytics with appropriate priority and settings
 */
export const loadGoogleAnalytics = (gaId: string, priority: ScriptPriority = 'medium'): Promise<void> => {
  const deviceCapabilities = getDeviceCapabilities();
  
  // Skip analytics on low-end devices or in save-data mode
  if (deviceCapabilities.saveDataMode || 
      (deviceCapabilities.isLowEndDevice && deviceCapabilities.connectionSpeed === 'slow')) {
    console.log('Google Analytics loading skipped for low-end device or data saver mode');
    return Promise.resolve();
  }
  
  return loadScript({
    id: 'google-analytics',
    innerHTML: `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${gaId}', {
        'send_page_view': false,
        'anonymize_ip': true,
        'transport_type': 'beacon'
      });
    `,
    async: true,
    priority,
    onLoad: () => {
      // After loading the core, load the actual GA script
      const gaScript = document.createElement('script');
      gaScript.async = true;
      gaScript.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
      document.head.appendChild(gaScript);
    }
  });
};

/**
 * Helper functions for common third-party scripts
 */
export const loadFacebookPixel = (pixelId: string, priority: ScriptPriority = 'low'): Promise<void> => {
  const deviceCapabilities = getDeviceCapabilities();
  
  // Skip on low-end devices or in save-data mode
  if (deviceCapabilities.saveDataMode || deviceCapabilities.isLowEndDevice) {
    console.log('Facebook Pixel loading skipped for low-end device or data saver mode');
    return Promise.resolve();
  }
  
  return loadScript({
    id: 'fb-pixel',
    innerHTML: `
      !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
      n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
      document,'script','https://connect.facebook.net/en_US/fbevents.js');
      fbq('init', '${pixelId}');
      fbq('track', 'PageView');
    `,
    priority
  });
};

export const loadHotjar = (hjId: string, priority: ScriptPriority = 'idle'): Promise<void> => {
  const deviceCapabilities = getDeviceCapabilities();
  
  // Skip on low-end devices or in save-data mode
  if (deviceCapabilities.saveDataMode || deviceCapabilities.isLowEndDevice) {
    console.log('Hotjar loading skipped for low-end device or data saver mode');
    return Promise.resolve();
  }
  
  return loadScript({
    id: 'hotjar-script',
    innerHTML: `
      (function(h,o,t,j,a,r){
        h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
        h._hjSettings={hjid:${hjId},hjsv:6};
        a=o.getElementsByTagName('head')[0];
        r=o.createElement('script');r.async=1;
        r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
        a.appendChild(r);
      })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
    `,
    priority
  });
};
