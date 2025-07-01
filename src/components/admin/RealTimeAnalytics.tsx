
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, Activity, Users, MousePointer, Clock } from 'lucide-react';

interface SessionEvent {
  id: string;
  session_id: string;
  event_type: string;
  page_url: string;
  event_data: any;
  created_at: string;
  element_selector?: string;
  element_text?: string;
}

interface SessionSummary {
  session_id: string;
  total_events: number;
  unique_pages: number;
  last_activity: string;
  duration_minutes: number;
  is_active: boolean;
}

const RealTimeAnalytics: React.FC = () => {
  const [events, setEvents] = useState<SessionEvent[]>([]);
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchRealtimeData = async () => {
    try {
      // Fetch recent events (last 30 minutes)
      const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();
      
      const { data: eventData, error: eventError } = await supabase
        .from('session_events')
        .select('*')
        .gte('created_at', thirtyMinutesAgo)
        .order('created_at', { ascending: false })
        .limit(50);

      if (eventError) {
        console.error('Error fetching events:', eventError);
      } else {
        setEvents(eventData || []);
      }

      // Aggregate session data
      if (eventData) {
        const sessionMap = new Map<string, SessionSummary>();
        
        eventData.forEach(event => {
          const sessionId = event.session_id;
          const existing = sessionMap.get(sessionId) || {
            session_id: sessionId,
            total_events: 0,
            unique_pages: 0,
            last_activity: event.created_at,
            duration_minutes: 0,
            is_active: false
          };

          existing.total_events += 1;
          
          // Update last activity if this event is more recent
          if (new Date(event.created_at) > new Date(existing.last_activity)) {
            existing.last_activity = event.created_at;
          }

          // Check if session is active (activity in last 5 minutes)
          const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
          existing.is_active = new Date(existing.last_activity) > fiveMinutesAgo;

          sessionMap.set(sessionId, existing);
        });

        // Calculate unique pages and duration for each session
        for (const [sessionId, summary] of sessionMap.entries()) {
          const sessionEvents = eventData.filter(e => e.session_id === sessionId);
          const uniquePages = new Set(sessionEvents.map(e => e.page_url)).size;
          
          // Calculate session duration
          const firstEvent = sessionEvents[sessionEvents.length - 1];
          const lastEvent = sessionEvents[0];
          const duration = (new Date(lastEvent.created_at).getTime() - new Date(firstEvent.created_at).getTime()) / (1000 * 60);
          
          summary.unique_pages = uniquePages;
          summary.duration_minutes = Math.max(duration, 0);
        }

        setSessions(Array.from(sessionMap.values()).sort((a, b) => 
          new Date(b.last_activity).getTime() - new Date(a.last_activity).getTime()
        ));
      }

      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error in fetchRealtimeData:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRealtimeData();
    
    // Set up real-time subscription
    const subscription = supabase
      .channel('realtime-analytics')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'session_events' 
        }, 
        () => {
          fetchRealtimeData();
        }
      )
      .subscribe();

    // Refresh every 30 seconds
    const interval = setInterval(fetchRealtimeData, 30000);

    return () => {
      subscription.unsubscribe();
      clearInterval(interval);
    };
  }, []);

  const getEventTypeColor = (eventType: string) => {
    switch (eventType) {
      case 'page_view': return 'bg-blue-600';
      case 'click': return 'bg-green-600';
      case 'scroll': return 'bg-yellow-600';
      case 'form_submit': return 'bg-purple-600';
      case 'booking_attempt': return 'bg-red-600';
      default: return 'bg-gray-600';
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const eventTime = new Date(timestamp);
    const diffMs = now.getTime() - eventTime.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    return eventTime.toLocaleDateString();
  };

  const activeSessions = sessions.filter(s => s.is_active);
  const totalEvents = events.length;

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Reaaliaikainen analytiikka</h1>
            <p className="text-gray-400">
              Seuraa sivuston käyttäjäaktiviteettia reaaliajassa
            </p>
          </div>
          <div className="flex items-center gap-4">
            {lastUpdate && (
              <p className="text-sm text-gray-400">
                Päivitetty: {lastUpdate.toLocaleTimeString()}
              </p>
            )}
            <Button 
              onClick={fetchRealtimeData}
              disabled={isLoading}
              variant="outline"
              className="border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Päivitä
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gray-900 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center">
                <Activity className="h-8 w-8 text-green-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-400">Aktiiviset sessiot</p>
                  <p className="text-2xl font-bold text-white">{activeSessions.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-400">Kaikki sessiot</p>
                  <p className="text-2xl font-bold text-white">{sessions.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center">
                <MousePointer className="h-8 w-8 text-purple-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-400">Tapahtumat (30min)</p>
                  <p className="text-2xl font-bold text-white">{totalEvents}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-yellow-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-400">Keskimääräinen sessio</p>
                  <p className="text-2xl font-bold text-white">
                    {sessions.length > 0 
                      ? `${Math.round(sessions.reduce((sum, s) => sum + s.duration_minutes, 0) / sessions.length)}min`
                      : '0min'
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Active Sessions */}
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Aktiiviset sessiot</CardTitle>
            </CardHeader>
            <CardContent>
              {activeSessions.length === 0 ? (
                <p className="text-gray-400 text-center py-8">Ei aktiivisia sessioita</p>
              ) : (
                <div className="space-y-3">
                  {activeSessions.slice(0, 10).map((session) => (
                    <div key={session.session_id} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                      <div>
                        <p className="font-medium text-white">
                          {session.session_id.substring(0, 8)}...
                        </p>
                        <p className="text-sm text-gray-400">
                          {session.total_events} tapahtumaa • {session.unique_pages} sivua
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge className="bg-green-600 text-white">Aktiivinen</Badge>
                        <p className="text-xs text-gray-400 mt-1">
                          {formatTimeAgo(session.last_activity)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Events */}
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Viimeisimmät tapahtumat</CardTitle>
            </CardHeader>
            <CardContent>
              {events.length === 0 ? (
                <p className="text-gray-400 text-center py-8">Ei viimeaikaisia tapahtumia</p>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {events.slice(0, 20).map((event) => (
                    <div key={event.id} className="flex items-start space-x-3 p-3 bg-gray-800 rounded-lg">
                      <Badge className={`${getEventTypeColor(event.event_type)} text-white text-xs`}>
                        {event.event_type}
                      </Badge>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">
                          {event.page_url}
                        </p>
                        {event.element_text && (
                          <p className="text-xs text-gray-400 truncate">
                            "{event.element_text}"
                          </p>
                        )}
                        <p className="text-xs text-gray-500">
                          {formatTimeAgo(event.created_at)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default RealTimeAnalytics;
