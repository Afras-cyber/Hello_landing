
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, TrendingUp, Users, Route } from 'lucide-react';

interface CustomerJourney {
  session_id: string;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  created_at: string;
  confidence_score: number;
  booking_confirmation_detected: boolean;
  iframe_interactions: number;
  booking_page_time: number;
}

interface SessionStats {
  total_sessions: number;
  today_sessions: number;
  week_sessions: number;
  month_sessions: number;
  conversion_rate: number;
}

const CustomerJourneyAnalytics = () => {
  const { data: journeys, isLoading: journeysLoading } = useQuery({
    queryKey: ['customer-journeys-real'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('booking_conversions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data as CustomerJourney[];
    }
  });

  const { data: sessionStats } = useQuery({
    queryKey: ['session-stats'],
    queryFn: async () => {
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();

      // Get total sessions (using booking_conversions)
      const { data: totalSessions, error: totalError } = await supabase
        .from('booking_conversions')
        .select('id', { count: 'exact' });

      // Get today's sessions
      const { data: todaySessions, error: todayError } = await supabase
        .from('booking_conversions')
        .select('id', { count: 'exact' })
        .gte('created_at', todayStr);

      // Get week sessions
      const { data: weekSessions, error: weekError } = await supabase
        .from('booking_conversions')
        .select('id', { count: 'exact' })
        .gte('created_at', weekAgo);

      // Get month sessions
      const { data: monthSessions, error: monthError } = await supabase
        .from('booking_conversions')
        .select('id', { count: 'exact' })
        .gte('created_at', monthAgo);

      // Get conversions for rate calculation
      const { data: conversions, error: convError } = await supabase
        .from('booking_conversions')
        .select('id', { count: 'exact' })
        .eq('booking_confirmation_detected', true);

      if (totalError || todayError || weekError || monthError || convError) {
        throw new Error('Failed to fetch session stats');
      }

      const total = totalSessions?.length || 0;
      const conversionsCount = conversions?.length || 0;

      return {
        total_sessions: total,
        today_sessions: todaySessions?.length || 0,
        week_sessions: weekSessions?.length || 0,
        month_sessions: monthSessions?.length || 0,
        conversion_rate: total > 0 ? (conversionsCount / total) * 100 : 0
      } as SessionStats;
    }
  });

  const { data: sourceStats } = useQuery({
    queryKey: ['traffic-sources-real'],
    queryFn: async () => {
      // Show all traffic sources
      const { data, error } = await supabase
        .from('booking_conversions')
        .select('utm_source, booking_confirmation_detected')
        .not('utm_source', 'is', null);
      
      if (error) throw error;
      
      const stats = data.reduce((acc: any, row) => {
        const source = row.utm_source || 'Direct';
        if (!acc[source]) {
          acc[source] = { total: 0, conversions: 0 };
        }
        acc[source].total++;
        if (row.booking_confirmation_detected) {
          acc[source].conversions++;
        }
        return acc;
      }, {});
      
      return Object.entries(stats)
        .map(([source, data]: [string, any]) => ({
          source,
          total: data.total,
          conversions: data.conversions,
          rate: data.total > 0 ? ((data.conversions / data.total) * 100).toFixed(1) : '0.0'
        }))
        .sort((a, b) => b.total - a.total);
    }
  });

  const { data: topRoutes } = useQuery({
    queryKey: ['top-routes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customer_journey')
        .select('page_url')
        .not('page_url', 'is', null)
        .limit(100);
      
      if (error) throw error;
      
      const routeCounts = data.reduce((acc: any, journey) => {
        const url = journey.page_url;
        if (url) {
          const path = new URL(url).pathname;
          acc[path] = (acc[path] || 0) + 1;
        }
        return acc;
      }, {});
      
      return Object.entries(routeCounts)
        .map(([path, count]) => ({ path, count: count as number }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 8);
    }
  });

  if (journeysLoading) {
    return <div className="p-6">Ladataan asiakasreitin analytiikkaa...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Asiakasreitin Analytiikka</h2>
        <a 
          href="https://analytics.google.com/analytics/web/#/p485301747/reports/intelligenthome"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
          Google Analytics
        </a>
      </div>

      {/* Session Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-white flex items-center gap-2">
              <Users className="w-4 h-4" />
              Kaikki Sessiot
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{sessionStats?.total_sessions || 0}</div>
            <p className="text-xs text-gray-400">Yhteensä</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-white">Tänään</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{sessionStats?.today_sessions || 0}</div>
            <p className="text-xs text-gray-400">Kaikki sessiot</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-white">Viimeinen viikko</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{sessionStats?.week_sessions || 0}</div>
            <p className="text-xs text-gray-400">7 päivän aikana</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-white">Viimeinen kuukausi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{sessionStats?.month_sessions || 0}</div>
            <p className="text-xs text-gray-400">30 päivän aikana</p>
          </CardContent>
        </Card>
      </div>

      {/* Traffic Sources */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Liikenne lähteet
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {sourceStats?.map((stat) => (
              <div key={stat.source} className="bg-gray-700 p-4 rounded-lg">
                <h3 className="text-white font-semibold">{stat.source}</h3>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-gray-300">{stat.total} kävijää</span>
                  <Badge variant={stat.conversions > 0 ? "default" : "secondary"}>
                    {stat.conversions} varausta ({stat.rate}%)
                  </Badge>
                </div>
              </div>
            )) || (
              <div className="col-span-3 text-center text-gray-400 py-8">
                Ei UTM-lähteitä saatavilla
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Top Routes */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Route className="w-5 h-5" />
            Suosituimmat sivupolut
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {topRoutes?.map((route, index) => (
              <div key={route.path} className="flex justify-between items-center p-3 bg-gray-700 rounded">
                <span className="text-gray-300">
                  #{index + 1} {route.path}
                </span>
                <span className="text-blondify-blue font-semibold">
                  {route.count} vierailua
                </span>
              </div>
            )) || (
              <div className="text-center text-gray-400 py-8">
                Ei reittidataa saatavilla
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Customer Journeys */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Viimeisimmät asiakasreitit</CardTitle>
        </CardHeader>
        <CardContent>
          {journeys && journeys.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-2 text-gray-300">Sessio</th>
                    <th className="text-left py-2 text-gray-300">Lähde</th>
                    <th className="text-left py-2 text-gray-300">Interaktiot</th>
                    <th className="text-left py-2 text-gray-300">Aika (s)</th>
                    <th className="text-left py-2 text-gray-300">Luottamus</th>
                    <th className="text-left py-2 text-gray-300">Varaus</th>
                  </tr>
                </thead>
                <tbody>
                  {journeys.map((journey) => (
                    <tr key={journey.session_id} className="border-b border-gray-700">
                      <td className="py-2 text-gray-300 font-mono text-xs">
                        {journey.session_id.substring(0, 12)}...
                      </td>
                      <td className="py-2 text-gray-300">
                        {journey.utm_source || 'Direct'}
                        {journey.utm_campaign && (
                          <div className="text-xs text-gray-500">
                            {journey.utm_campaign}
                          </div>
                        )}
                      </td>
                      <td className="py-2 text-center">
                        <Badge variant={journey.iframe_interactions > 5 ? "default" : "secondary"}>
                          {journey.iframe_interactions}
                        </Badge>
                      </td>
                      <td className="py-2 text-center text-gray-300">
                        {journey.booking_page_time}
                      </td>
                      <td className="py-2 text-center">
                        <Badge variant={journey.confidence_score > 0.7 ? "default" : "secondary"}>
                          {(journey.confidence_score * 100).toFixed(0)}%
                        </Badge>
                      </td>
                      <td className="py-2 text-center">
                        {journey.booking_confirmation_detected ? (
                          <Badge className="bg-green-600 text-white">✅ Varattu</Badge>
                        ) : (
                          <Badge variant="outline" className="text-gray-400">-</Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center text-gray-400 py-8">
              Ei asiakasreitin dataa saatavilla
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerJourneyAnalytics;
