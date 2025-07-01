
import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { trackBookingEvent } from '@/utils/gtmTracking';

interface DebugPanelProps {
  sessionId: string;
  stats: {
    totalInteractions: number;
    bookingPageTime: number;
    confidenceScore: number;
    currentBookingStep: string;
    detectedServices: string[];
    visualConversionDetected: boolean;
    consoleDetections: any[];
    lastConsoleDetection: any;
  };
  onSimulateConversion: () => void;
  onClearSession: () => void;
  onExportData: () => void;
}

const EnhancedDebugPanel: React.FC<DebugPanelProps> = ({ 
  sessionId, 
  stats, 
  onSimulateConversion, 
  onClearSession, 
  onExportData 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [lastConversionTime, setLastConversionTime] = useState<number | null>(null);
  const { toast } = useToast();

  // Play audio notification when conversion is detected
  const playConversionSound = () => {
    if (audioEnabled) {
      try {
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBShwvuTUsGAcBzuUz/DKfzYEI4Iq');
        audio.volume = 0.3;
        audio.play().catch(e => console.log('Audio play failed:', e));
      } catch (error) {
        console.log('Audio notification failed:', error);
      }
    }
  };

  // Watch for conversions and show notifications
  useEffect(() => {
    if (stats.lastConsoleDetection?.confidence === 1.0 && 
        (!lastConversionTime || Date.now() - lastConversionTime > 5000)) {
      setLastConversionTime(Date.now());
      
      toast({
        title: "🎉 CONVERSION DETECTED!",
        description: `Console detection with 100% confidence`,
        duration: 8000,
      });
      
      playConversionSound();
    }
  }, [stats.lastConsoleDetection, audioEnabled, toast, lastConversionTime]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 1.0) return 'text-purple-400 font-bold animate-pulse';
    if (confidence >= 0.8) return 'text-green-400';
    if (confidence >= 0.6) return 'text-yellow-400';
    if (confidence >= 0.4) return 'text-orange-400';
    return 'text-red-400';
  };

  const getStatusText = () => {
    if (stats.lastConsoleDetection?.confidence === 1.0) return '✅ CONSOLE CONFIRMED';
    if (stats.visualConversionDetected) return '✅ Visual Detected';
    if (stats.consoleDetections.length > 0) return '🔍 Console Activity';
    return '⏳ Monitoring';
  };

  return (
    <div className={`fixed ${isExpanded ? 'bottom-4 right-4 w-96' : 'bottom-4 right-4 w-80'} bg-black/95 text-white rounded-lg text-xs font-mono z-50 shadow-2xl border border-gray-700 transition-all duration-300`}>
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-700">
        <div className="font-bold text-green-400 flex items-center">
          🎯 BOOKING DEBUG
          <span className="ml-2 text-blue-400">v3.0</span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setAudioEnabled(!audioEnabled)}
            className={`px-2 py-1 rounded text-xs ${audioEnabled ? 'bg-green-600' : 'bg-gray-600'}`}
          >
            🔊 {audioEnabled ? 'ON' : 'OFF'}
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-400 hover:text-white"
          >
            {isExpanded ? '−' : '+'}
          </button>
        </div>
      </div>

      {/* Main Stats */}
      <div className="p-3 space-y-2">
        <div className="flex justify-between">
          <span>Session:</span>
          <span className="text-blue-300">{sessionId.substring(0, 12)}...</span>
        </div>
        
        <div className="flex justify-between">
          <span>Time:</span>
          <span className="text-green-300">{formatTime(stats.bookingPageTime)}</span>
        </div>
        
        <div className="flex justify-between">
          <span>Interactions:</span>
          <span className="text-yellow-300">{stats.totalInteractions}</span>
        </div>
        
        <div className="flex justify-between">
          <span>Confidence:</span>
          <span className={getConfidenceColor(stats.confidenceScore)}>
            {(stats.confidenceScore * 100).toFixed(1)}%
          </span>
        </div>
        
        <div className="flex justify-between">
          <span>Status:</span>
          <span className={stats.lastConsoleDetection?.confidence === 1.0 ? 'text-purple-300 font-bold' : 'text-blue-300'}>
            {getStatusText()}
          </span>
        </div>

        {/* Console Detection Stats */}
        <div className="border-t border-gray-600 pt-2">
          <div className="text-cyan-300 font-semibold mb-1">Console Detection:</div>
          <div className="flex justify-between">
            <span>Detections:</span>
            <span className={stats.consoleDetections.length > 0 ? 'text-green-300' : 'text-gray-400'}>
              {stats.consoleDetections.length}
            </span>
          </div>
          
          {stats.lastConsoleDetection && (
            <div className="text-xs mt-1 p-2 bg-gray-800 rounded">
              <div className="text-green-200">
                Latest: {stats.lastConsoleDetection.method}
              </div>
              <div className="text-green-200">
                Confidence: {(stats.lastConsoleDetection.confidence * 100).toFixed(0)}%
              </div>
              {stats.lastConsoleDetection.clientData && (
                <div className="text-purple-200 mt-1">
                  Client: {stats.lastConsoleDetection.clientData.name}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Expanded Details */}
        {isExpanded && (
          <>
            <div className="border-t border-gray-600 pt-2">
              <div className="text-yellow-300 font-semibold mb-1">Current Step:</div>
              <div className="text-sm text-gray-300">{stats.currentBookingStep}</div>
            </div>

            {stats.detectedServices.length > 0 && (
              <div className="border-t border-gray-600 pt-2">
                <div className="text-green-300 font-semibold mb-1">Services:</div>
                <div className="text-sm text-gray-300">
                  {stats.detectedServices.join(', ')}
                </div>
              </div>
            )}

            {/* Recent Console Activity */}
            {stats.consoleDetections.length > 0 && (
              <div className="border-t border-gray-600 pt-2">
                <div className="text-purple-300 font-semibold mb-1">Recent Activity:</div>
                {stats.consoleDetections.slice(-3).map((detection, i) => (
                  <div key={i} className="text-xs text-cyan-200 mb-1">
                    {detection.method}: {(detection.confidence * 100).toFixed(0)}%
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Control Buttons */}
      <div className="border-t border-gray-700 p-3 space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onSimulateConversion}
            className="bg-green-600 hover:bg-green-700 px-3 py-2 rounded text-xs font-bold transition-colors"
          >
            🎯 Simulate
          </button>
          <button
            onClick={onClearSession}
            className="bg-red-600 hover:bg-red-700 px-3 py-2 rounded text-xs font-bold transition-colors"
          >
            🗑️ Clear
          </button>
        </div>
        <button
          onClick={onExportData}
          className="w-full bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded text-xs font-bold transition-colors"
        >
          📊 Export Data
        </button>
      </div>
    </div>
  );
};

export default EnhancedDebugPanel;
