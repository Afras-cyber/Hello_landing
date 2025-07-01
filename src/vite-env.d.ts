
/// <reference types="vite/client" />

interface Window {
  dataLayer: any[];
  articleDepthTracked?: boolean;
  gtag?: (...args: any[]) => void;
}

// Network Information API types
interface NetworkInformation extends EventTarget {
  readonly connection?: {
    readonly effectiveType?: '2g' | '3g' | '4g' | 'slow-2g';
    readonly downlink?: number;
    readonly rtt?: number;
    readonly saveData?: boolean;
  };
}

interface Navigator {
  readonly connection?: {
    readonly effectiveType?: '2g' | '3g' | '4g' | 'slow-2g';
    readonly downlink?: number;
    readonly rtt?: number;
    readonly saveData?: boolean;
  };
}
