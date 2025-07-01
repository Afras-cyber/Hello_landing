
import React, { useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface VisualDetection {
  type: 'background_change' | 'content_change' | 'element_detection';
  confidence: number;
  description: string;
  timestamp: string;
}

interface TimmaVisualDetectorProps {
  sessionId: string;
  enableDebugMode?: boolean;
  onDetection?: (detection: VisualDetection) => void;
}

const TimmaVisualDetector: React.FC<TimmaVisualDetectorProps> = ({
  sessionId,
  enableDebugMode = false,
  onDetection
}) => {
  const [detections, setDetections] = useState<VisualDetection[]>([]);
  const intervalRef = useRef<NodeJS.Timeout>();
  const lastBackgroundColor = useRef<string>('');
  const lastContentHash = useRef<string>('');

  const debugLog = (message: string, data?: any) => {
    if (enableDebugMode) {
      console.log(`👁️ VISUAL DETECTOR: ${message}`, data || '');
    }
  };

  const addDetection = (detection: VisualDetection) => {
    setDetections(prev => [...prev.slice(-4), detection]); // Keep last 5
    onDetection?.(detection);
    
    // Track high-confidence detections
    if (detection.confidence >= 0.8) {
      trackVisualDetection(detection);
    }
  };

  const trackVisualDetection = async (detection: VisualDetection) => {
    try {
      await supabase.rpc('track_iframe_interaction', {
        p_session_id: sessionId,
        p_interaction_type: 'timma_visual_detection',
        p_element_selector: 'iframe_visual_analysis',
        p_element_text: detection.description,
        p_interaction_data: {
          detection_type: detection.type,
          confidence: detection.confidence,
          visual_analysis: true,
          timestamp: detection.timestamp
        }
      });
    } catch (error) {
      console.error('Error tracking visual detection:', error);
    }
  };

  const analyzeIframeVisuals = () => {
    const timmaIframes = document.querySelectorAll('iframe[src*="timma"], iframe[src*="varaa.timma.fi"]') as NodeListOf<HTMLIFrameElement>;
    
    timmaIframes.forEach((iframe, index) => {
      try {
        // Try to access iframe document
        const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
        
        if (iframeDoc) {
          // Check background color changes
          const body = iframeDoc.body;
          const computedStyle = window.getComputedStyle(body);
          const currentBg = computedStyle.backgroundColor;
          
          if (currentBg !== lastBackgroundColor.current && lastBackgroundColor.current) {
            debugLog(`Background changed from ${lastBackgroundColor.current} to ${currentBg}`);
            
            // Detect light background (success page indicator)
            const rgbMatch = currentBg.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
            if (rgbMatch) {
              const [, r, g, b] = rgbMatch.map(Number);
              const isLightBackground = r > 200 && g > 200 && b > 200;
              
              if (isLightBackground) {
                addDetection({
                  type: 'background_change',
                  confidence: 0.85,
                  description: `Background changed to light color (${currentBg}) - likely success page`,
                  timestamp: new Date().toISOString()
                });
              }
            }
          }
          lastBackgroundColor.current = currentBg;

          // Analyze page content for booking confirmation
          const bodyText = body.textContent?.toLowerCase() || '';
          const contentHash = btoa(bodyText.substring(0, 100)); // Hash first 100 chars
          
          if (contentHash !== lastContentHash.current && lastContentHash.current) {
            debugLog('Content changed, analyzing for confirmation keywords');
            
            // Finnish booking confirmation keywords
            const confirmationPatterns = [
              'varauksesi on vahvistettu',
              'varaus vahvistettu',
              'kiitos varauksesta',
              'aika varattu onnistuneesti',
              'varaus onnistui',
              'booking confirmed',
              'reservation confirmed',
              'vahvistettu',
              'onnistuneesti'
            ];

            const foundPattern = confirmationPatterns.find(pattern => 
              bodyText.includes(pattern)
            );

            if (foundPattern) {
              addDetection({
                type: 'content_change',
                confidence: 0.95,
                description: `Confirmation text detected: "${foundPattern}"`,
                timestamp: new Date().toISOString()
              });
            }

            // Check for success elements
            const successSelectors = [
              '[class*="success"]',
              '[class*="confirmed"]',
              '[class*="vahvistettu"]',
              '[id*="success"]',
              '[id*="confirmation"]'
            ];

            successSelectors.forEach(selector => {
              const elements = iframeDoc.querySelectorAll(selector);
              if (elements.length > 0) {
                addDetection({
                  type: 'element_detection',
                  confidence: 0.8,
                  description: `Success elements found: ${selector} (${elements.length} elements)`,
                  timestamp: new Date().toISOString()
                });
              }
            });
          }
          lastContentHash.current = contentHash;

          // Check for specific Timma confirmation elements
          const timmaConfirmationSelectors = [
            'div[data-testid*="confirmation"]',
            'div[data-testid*="success"]',
            '.booking-confirmed',
            '.reservation-success',
            '[data-booking-status="confirmed"]'
          ];

          timmaConfirmationSelectors.forEach(selector => {
            const elements = iframeDoc.querySelectorAll(selector);
            if (elements.length > 0) {
              addDetection({
                type: 'element_detection',
                confidence: 0.9,
                description: `Timma confirmation element: ${selector}`,
                timestamp: new Date().toISOString()
              });
            }
          });

        }
      } catch (error) {
        // Cross-origin access blocked - this is expected
        debugLog(`Cross-origin access blocked for iframe ${index} (expected)`);
      }
    });
  };

  useEffect(() => {
    debugLog('🚀 Starting visual detection monitoring');
    
    // Start periodic visual analysis
    intervalRef.current = setInterval(analyzeIframeVisuals, 1500);
    
    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      debugLog('🧹 Visual detection cleanup completed');
    };
  }, [sessionId]);

  // Debug display
  if (!enableDebugMode) return null;

  return (
    <div className="fixed top-20 right-4 bg-purple-900/90 text-white p-3 rounded-lg text-xs font-mono z-50 max-w-sm">
      <div className="font-bold text-purple-300 mb-2">👁️ VISUAL DETECTOR</div>
      <div className="space-y-1">
        <div>Detections: {detections.length}</div>
        {detections.slice(-3).map((detection, index) => (
          <div key={index} className="border-t border-purple-700 pt-1">
            <div className="text-purple-300">{detection.type}</div>
            <div className="text-xs">{(detection.confidence * 100).toFixed(0)}% confidence</div>
            <div className="text-xs text-gray-300 truncate">
              {detection.description.substring(0, 40)}...
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TimmaVisualDetector;
