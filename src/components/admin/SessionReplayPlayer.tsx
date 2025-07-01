
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Play, Pause, RotateCcw, FastForward } from 'lucide-react';

interface SessionReplayPlayerProps {
  sessionId: string;
}

interface SessionEvent {
  id: string;
  event_type: string;
  timestamp_offset: number;
  element_selector?: string;
  element_text?: string;
  x_coordinate?: number;
  y_coordinate?: number;
  page_url?: string;
  event_data: any;
  created_at: string;
}

const SessionReplayPlayer: React.FC<SessionReplayPlayerProps> = ({ sessionId }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [currentEventIndex, setCurrentEventIndex] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout>();

  const { data: sessionEvents, isLoading } = useQuery({
    queryKey: ['session-events', sessionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('session_events')
        .select('*')
        .eq('session_id', sessionId)
        .order('timestamp_offset', { ascending: true });
      
      if (error) throw error;
      return data as SessionEvent[];
    },
    enabled: !!sessionId
  });

  const { data: replayData } = useQuery({
    queryKey: ['session-replays', sessionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('session_replays')
        .select('*')
        .eq('session_id', sessionId)
        .order('chunk_index', { ascending: true });
      
      if (error) throw error;
      return data;
    },
    enabled: !!sessionId
  });

  useEffect(() => {
    if (isPlaying && sessionEvents) {
      intervalRef.current = setInterval(() => {
        setCurrentTime(prev => {
          const newTime = prev + (100 * playbackSpeed);
          
          // Find current event
          const eventIndex = sessionEvents.findIndex(event => 
            event.timestamp_offset > newTime
          ) - 1;
          
          if (eventIndex >= 0 && eventIndex < sessionEvents.length) {
            setCurrentEventIndex(eventIndex);
          }
          
          // Stop if reached end
          if (sessionEvents.length > 0 && newTime > sessionEvents[sessionEvents.length - 1].timestamp_offset) {
            setIsPlaying(false);
            return sessionEvents[sessionEvents.length - 1].timestamp_offset;
          }
          
          return newTime;
        });
      }, 100);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, playbackSpeed, sessionEvents]);

  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
  };

  const resetPlayback = () => {
    setIsPlaying(false);
    setCurrentTime(0);
    setCurrentEventIndex(0);
  };

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    return `${minutes}:${(seconds % 60).toString().padStart(2, '0')}`;
  };

  const getCurrentEvent = () => {
    return sessionEvents?.[currentEventIndex];
  };

  if (isLoading) {
    return <div className="text-gray-300">Ladataan session replay...</div>;
  }

  if (!sessionEvents || sessionEvents.length === 0) {
    return <div className="text-gray-300">Ei löytynyt session dataa tälle sessiolle.</div>;
  }

  const totalDuration = sessionEvents[sessionEvents.length - 1]?.timestamp_offset || 0;
  const currentEvent = getCurrentEvent();

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-white">
          <span>Session Replay: {sessionId.substring(0, 8)}...</span>
          <div className="flex gap-2">
            <Badge variant="outline">{sessionEvents.length} events</Badge>
            <Badge variant="outline">{formatTime(totalDuration)} total</Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Playback Controls */}
          <div className="flex items-center gap-4">
            <Button
              onClick={togglePlayback}
              variant="outline"
              size="sm"
              className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            
            <Button
              onClick={resetPlayback}
              variant="outline"
              size="sm"
              className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>

            <div className="flex items-center gap-2">
              <FastForward className="h-4 w-4 text-gray-300" />
              <select
                value={playbackSpeed}
                onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
                className="border rounded px-2 py-1 text-sm bg-gray-700 border-gray-600 text-white"
              >
                <option value={0.5}>0.5x</option>
                <option value={1}>1x</option>
                <option value={2}>2x</option>
                <option value={5}>5x</option>
              </select>
            </div>

            <span className="text-sm text-gray-400">
              {formatTime(currentTime)} / {formatTime(totalDuration)}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className="bg-blondify-blue h-2 rounded-full"
              style={{
                width: `${totalDuration > 0 ? (currentTime / totalDuration) * 100 : 0}%`
              }}
            />
          </div>

          {/* Current Event Display */}
          {currentEvent && (
            <div className="bg-gray-700 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <Badge variant="default">{currentEvent.event_type}</Badge>
                <span className="text-sm text-gray-400">
                  +{formatTime(currentEvent.timestamp_offset)}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                {currentEvent.element_selector && (
                  <div className="text-gray-300">
                    <strong>Element:</strong> {currentEvent.element_selector}
                  </div>
                )}
                {currentEvent.element_text && (
                  <div className="text-gray-300">
                    <strong>Text:</strong> {currentEvent.element_text.substring(0, 50)}...
                  </div>
                )}
                {currentEvent.x_coordinate && currentEvent.y_coordinate && (
                  <div className="text-gray-300">
                    <strong>Position:</strong> ({currentEvent.x_coordinate}, {currentEvent.y_coordinate})
                  </div>
                )}
                {currentEvent.page_url && (
                  <div className="text-gray-300">
                    <strong>Page:</strong> {currentEvent.page_url}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Event Timeline */}
          <div className="max-h-64 overflow-y-auto border border-gray-700 rounded-lg p-2">
            <div className="space-y-1">
              {sessionEvents.map((event, index) => (
                <div
                  key={event.id}
                  className={`p-2 rounded text-sm flex items-center justify-between ${
                    index === currentEventIndex 
                      ? 'bg-blondify-blue/20 border-blondify-blue border' 
                      : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {event.event_type}
                    </Badge>
                    <span className="text-gray-300">
                      {event.element_text?.substring(0, 30) || event.element_selector}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400">
                    +{formatTime(event.timestamp_offset)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SessionReplayPlayer;
