
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Activity, Eye, Target, Clock } from 'lucide-react';

interface LiveSession {
  session_id: string;
  last_activity: string;
  total_interactions: number;
  time_on_page: number;
  confidence_score: number;
  page_url: string;
}

const RealTimeTimmaMonitor = () => {
  const [liveSessions, setLiveSessions] = useState<LiveSession[]>([]);
  const [totalStats, setTotalStats] = useState({
    activeSessions: 0,
    totalInteractions: 0,
    averageConfidence: 0
  });

  // Query for recent activity
  const { data: recentActivity, refetch } = useQuery({
    queryKey: ['real-time-timma-activity'],
    queryFn: async () => {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      
      // Get recent iframe interactions
      const { data: interactions, error: interactionsError } = await supabase
        .from('iframe_interactions')
        .select('*')
        .gte('created_at', fiveMinutesAgo)
        .order('created_at', { ascending: false });

      if (interactionsError) throw interactionsError;

      // Get recent booking conversions
      const { data: conversions, error: conversionsError } = await supabase
        .from('booking_conversions')
        .select('*')
        .gte('created_at', fiveMinutesAgo)
        .order('created_at', { ascending: false });

      if (conversionsError) throw conversionsError;

      return { interactions: interactions || [], conversions: conversions || [] };
    },
    refetchInterval: 2000 // Refresh every 2 seconds
  });

  // Set up real-time subscriptions
  useEffect(() => {
    console.log('🔴 Setting up real-time Timma monitoring...');
    
    // Subscribe to iframe interactions
    const interactionsChannel = supabase
      .channel('timma-interactions')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'iframe_interactions'
        },
        (payload) => {
          console.log('🎯 New Timma interaction:', payload);
          refetch(); // Refresh data when new interaction comes in
        }
      )
      .subscribe();

    // Subscribe to booking conversions
    const conversionsChannel = supabase
      .channel('timma-conversions')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'booking_conversions'
        },
        (payload) => {
          console.log('🎉 Booking conversion update:', payload);
          refetch(); // Refresh data when conversion is updated
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(interactionsChannel);
      supabase.removeChannel(conversionsChannel);
    };
  }, [refetch]);

  // Process recent activity into live sessions
  useEffect(() => {
    if (!recentActivity) return;

    const sessionMap = new Map<string, LiveSession>();
    
    // Process interactions
    recentActivity.interactions.forEach(interaction => {
      const sessionId = interaction.session_id;
      const existing = sessionMap.get(sessionId);
      
      if (existing) {
        existing.total_interactions++;
        existing.last_activity = interaction.created_at;
      } else {
        sessionMap.set(sessionId, {
          session_id: sessionId,
          last_activity: interaction.created_at,
          total_interactions: 1,
          time_on_page: Math.floor(interaction.timestamp_offset / 1000) || 0,
          confidence_score: interaction.confidence_level || 0,
          page_url: 'Booking page'
        });
      }
    });

    // Add conversion data
    recentActivity.conversions.forEach(conversion => {
      const existing = sessionMap.get(conversion.session_id);
      if (existing) {
        existing.confidence_score = conversion.confidence_score || 0;
        existing.time_on_page = conversion.booking_page_time || 0;
      }
    });

    const sessions = Array.from(sessionMap.values())
      .sort((a, b) => new Date(b.last_activity).getTime() - new Date(a.last_activity).getTime());

    setLiveSessions(sessions);

    // Calculate total stats
    setTotalStats({
      activeSessions: sessions.length,
      totalInteractions: sessions.reduce((sum, s) => sum + s.total_interactions, 0),
      averageConfidence: sessions.length > 0 
        ? sessions.reduce((sum, s) => sum + s.confidence_score, 0) / sessions.length
        : 0
    });
  }, [recentActivity]);

  return (
    <div className="space-y-4">
      {/* Live Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Activity className="h-4 w-4 text-green-500" />
              Aktiiviset Sessiot
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {totalStats.activeSessions}
            </div>
            <p className="text-xs text-muted-foreground">Viimeinen 5 minuuttia</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Eye className="h-4 w-4 text-blue-500" />
              Yhteensä Interaktiot
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {totalStats.totalInteractions}
            </div>
            <p className="text-xs text-muted-foreground">Kaikki sessiot</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Target className="h-4 w-4 text-purple-500" />
              Keskimääräinen Luottamus
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {(totalStats.averageConfidence * 100).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">Algoritmin varmuus</p>
          </CardContent>
        </Card>
      </div>

      {/* Live Sessions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-green-500" />
            Reaaliaikaiset Timma-sessiot
            <Badge variant="outline" className={totalStats.activeSessions > 0 ? 'animate-pulse' : ''}>
              {totalStats.activeSessions} aktiivista
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {liveSessions.length > 0 ? (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {liveSessions.map((session) => (
                <div
                  key={session.session_id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <div>
                      <p className="font-medium text-sm">
                        {session.session_id.substring(0, 12)}...
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Viimeksi aktiivinen: {new Date(session.last_activity).toLocaleTimeString('fi-FI')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm">
                    <div className="text-center">
                      <div className="font-medium">{session.total_interactions}</div>
                      <div className="text-xs text-muted-foreground">interaktiota</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="font-medium flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {Math.floor(session.time_on_page / 60)}:{(session.time_on_page % 60).toString().padStart(2, '0')}
                      </div>
                      <div className="text-xs text-muted-foreground">sivulla</div>
                    </div>
                    
                    <div className="text-center">
                      <div className={`font-medium ${
                        session.confidence_score > 0.7 ? 'text-green-600' : 
                        session.confidence_score > 0.4 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {(session.confidence_score * 100).toFixed(0)}%
                      </div>
                      <div className="text-xs text-muted-foreground">luottamus</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Ei aktiivisia Timma-sessioita</p>
              <p className="text-sm">Sessiot näkyvät kun käyttäjät vierailevat booking-sivulla</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RealTimeTimmaMonitor;
