
interface Window {
  dataLayer: any[];
  gtag: (...args: any[]) => void;
}

// Performance monitoring types
interface PerformanceEventTiming extends PerformanceEntry {
  processingStart: number;
}

interface LayoutShift extends PerformanceEntry {
  value: number;
  hadRecentInput: boolean;
}
