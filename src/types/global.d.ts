
interface Window {
  dataLayer?: any[];
  articleDepthTracked?: boolean;
}

// Add specific HTML attribute types for images with performance attributes
interface ImgHTMLAttributes {
  fetchPriority?: 'high' | 'low' | 'auto';
  decoding?: 'sync' | 'async' | 'auto';
}
