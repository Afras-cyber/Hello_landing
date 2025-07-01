
/**
 * Utility functions for smooth scrolling and performance optimizations
 */

/**
 * Scrolls to a specific element with smooth animation
 */
export const scrollToElement = (elementId: string): void => {
  const element = document.getElementById(elementId);
  if (element) {
    element.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    });
  }
};

/**
 * Enhances image loading with lazy loading
 */
export const enhanceImageLoading = (): void => {
  // Find all images without loading attribute
  const images = document.querySelectorAll('img:not([loading])');
  
  // Add lazy loading to all images that don't have it
  images.forEach(img => {
    if (!img.hasAttribute('loading')) {
      img.setAttribute('loading', 'lazy');
    }
  });
};

/**
 * Smooth scroll to top with customizable duration
 */
export const scrollToTop = (duration = 500): void => {
  const scrollStep = -window.scrollY / (duration / 15);
  
  const scrollInterval = setInterval(() => {
    if (window.scrollY !== 0) {
      window.scrollBy(0, scrollStep);
    } else {
      clearInterval(scrollInterval);
    }
  }, 15);
};

/**
 * Force immediate scroll to top
 */
export const forceScrollToTop = (): void => {
  // Use multiple methods to ensure scroll works
  window.scrollTo(0, 0);
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
};
