
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { forceScrollToTop } from '@/utils/scrollUtils';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Force scroll to top immediately when route changes
    forceScrollToTop();
    
    // Also use requestAnimationFrame to ensure it happens after DOM updates
    requestAnimationFrame(() => {
      forceScrollToTop();
    });
    
    // Add a small delay as backup
    setTimeout(() => {
      forceScrollToTop();
    }, 10);
  }, [pathname]);

  return null;
};

export default ScrollToTop;
