
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Search, Eye, Filter, Calendar } from 'lucide-react';
import SessionReplayPlayer from './SessionReplayPlayer';

const SessionAnalytics = () => {
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('7'); // days

  const { data: sessions, isLoading } = useQuery({
    queryKey: ['user-sessions', dateFilter],
    queryFn: async () => {
      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - parseInt(dateFilter));
      
      const { data, error } = await supabase
        .from('booking_conversions')
        .select('*')
        .gte('created_at', daysAgo.toISOString())
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (error) throw error;
      return data;
    }
  });

  const { data: sessionEvents } = useQuery({
    queryKey: ['session-events-count'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('session_events')
        .select('session_id, event_type')
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());
      
      if (error) throw error;
      
      // Group by session_id and count events
      const sessionEventCounts = data.reduce((acc, event) => {
        acc[event.session_id] = (acc[event.session_id] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      return sessionEventCounts;
    }
  });

  // Filter sessions based on search term
  const filteredSessions = sessions?.filter(session => 
    !searchTerm || 
    session.session_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    session.utm_source?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  // Calculate unique sessions and consistent stats
  const uniqueSessions = [...new Set(filteredSessions.map(s => s.session_id))].length;
  const confirmedConversions = [...new Set(filteredSessions
    .filter(s => s.booking_confirmation_detected === true)
    .map(s => s.session_id))].length;

  const formatDuration = (duration: number) => {
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (selectedSession) {
    return (
      <div className="space-y-4">
        <Button
          onClick={() => setSelectedSession(null)}
          variant="outline"
          className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
        >
          ← Takaisin sessioihin
        </Button>
        <SessionReplayPlayer sessionId={selectedSession} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Filter className="h-5 w-5" />
            Suodattimet
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-center">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-gray-300" />
              <Input
                placeholder="Etsi session ID tai lähde..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64 bg-gray-700 border-gray-600 text-white"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-300" />
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="border rounded px-3 py-2 bg-gray-700 border-gray-600 text-white"
              >
                <option value="1">Viimeinen päivä</option>
                <option value="7">Viimeinen viikko</option>
                <option value="30">Viimeinen kuukausi</option>
                <option value="90">Viimeiset 3 kuukautta</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Session Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-white">Yhteensä Sessioita</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{uniqueSessions}</div>
            <p className="text-xs text-gray-400">Uniikkeja sessioita</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-white">Konversiot</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{confirmedConversions}</div>
            <p className="text-xs text-gray-400">
              {uniqueSessions > 0 ? ((confirmedConversions / uniqueSessions) * 100).toFixed(1) : 0}% konversio
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-white">Keskimääräinen Kesto</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {formatDuration(
                Math.round(
                  filteredSessions.reduce((acc, s) => acc + (s.booking_page_time || 0), 0) / 
                  (uniqueSessions || 1)
                )
              )}
            </div>
            <p className="text-xs text-gray-400">Keskimäärin per sessio</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-white">Keskimääräinen Interaktiot</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {(filteredSessions.reduce((acc, s) => acc + (s.iframe_interactions || 0), 0) / (uniqueSessions || 1)).toFixed(1)}
            </div>
            <p className="text-xs text-gray-400">Interaktiota per sessio</p>
          </CardContent>
        </Card>
      </div>

      {/* Sessions List */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Käyttäjä Sessiot</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-gray-300">Ladataan sessioita...</div>
          ) : (
            <div className="space-y-3">
              {[...new Set(filteredSessions.map(s => s.session_id))].map((sessionId) => {
                const sessionData = filteredSessions.find(s => s.session_id === sessionId);
                if (!sessionData) return null;
                
                return (
                  <div
                    key={sessionId}
                    className="flex items-center justify-between p-4 border border-gray-700 rounded-lg hover:bg-gray-700"
                  >
                    <div className="flex items-center space-x-4">
                      <div>
                        <p className="font-medium text-white">{sessionId.substring(0, 8)}...</p>
                        <p className="text-sm text-gray-400">
                          {new Date(sessionData.created_at).toLocaleString('fi-FI')}
                        </p>
                      </div>
                      
                      <div className="flex space-x-2">
                        {sessionData.booking_confirmation_detected && (
                          <Badge variant="default">Konversio</Badge>
                        )}
                        {sessionData.utm_source && (
                          <Badge variant="outline">{sessionData.utm_source}</Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-right text-sm">
                        <p className="text-white">{formatDuration(sessionData.booking_page_time || 0)}</p>
                        <p className="text-gray-400">{sessionData.iframe_interactions || 0} interaktiota</p>
                        <p className="text-gray-400">
                          {sessionEvents?.[sessionId] || 0} tapahtumaa
                        </p>
                      </div>
                      
                      <Button
                        onClick={() => setSelectedSession(sessionId)}
                        variant="outline"
                        size="sm"
                        disabled={!sessionEvents?.[sessionId]}
                        className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Toista
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SessionAnalytics;
