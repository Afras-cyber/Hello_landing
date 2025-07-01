
import { useEffect, useState } from 'react';

interface FontOptimizationOptions {
  preloadCritical?: boolean;
  deferNonCritical?: boolean;
  fallbackFonts?: string[];
}

export const useOptimizedFonts = (options: FontOptimizationOptions = {}) => {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const {
    preloadCritical = true,
    deferNonCritical = true,
    fallbackFonts = ['system-ui', '-apple-system', 'sans-serif']
  } = options;

  useEffect(() => {
    if (!preloadCritical) return;

    // Check if fonts are already loaded
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        setFontsLoaded(true);
      });
    }

    // Apply font-display: swap via CSS if Google Fonts aren't loaded yet
    const style = document.createElement('style');
    style.textContent = `
      @font-face {
        font-family: 'Red Hat Display';
        font-display: swap;
        font-weight: 400 700;
        src: local('Red Hat Display');
      }
      
      /* Ensure font-display: swap is applied to all fonts */
      * {
        font-display: swap !important;
      }
    `;
    
    if (!document.head.querySelector('style[data-font-optimization]')) {
      style.setAttribute('data-font-optimization', 'true');
      document.head.appendChild(style);
    }

  }, [preloadCritical]);

  return { fontsLoaded, fallbackFonts };
};
