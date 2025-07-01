
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Calendar, TrendingUp, Target, Activity, Eye, Award, BarChart3 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const TimmaAnalyticsDashboard = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d'>('7d');

  // Fetch enhanced Timma data with trends
  const { data: timmaData, isLoading } = useQuery({
    queryKey: ['timma-dashboard', selectedPeriod],
    queryFn: async () => {
      const daysAgo = {
        '7d': 7,
        '30d': 30,
        '90d': 90
      }[selectedPeriod];

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysAgo);

      // Get interactions
      const { data: interactions, error: interactionsError } = await supabase
        .from('iframe_interactions')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false });

      if (interactionsError) throw interactionsError;

      // Get conversions
      const { data: conversions, error: conversionsError } = await supabase
        .from('booking_conversions')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false });

      if (conversionsError) throw conversionsError;

      // Process data for charts
      const dailyData = [];
      for (let i = daysAgo - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        const dayInteractions = interactions?.filter(i => 
          i.created_at.startsWith(dateStr)
        ).length || 0;
        
        const dayConversions = conversions?.filter(c => 
          c.created_at.startsWith(dateStr) && c.booking_confirmation_detected
        ).length || 0;

        dailyData.push({
          date: dateStr,
          interactions: dayInteractions,
          conversions: dayConversions,
          conversionRate: dayInteractions > 0 ? (dayConversions / dayInteractions * 100) : 0
        });
      }

      // Calculate metrics
      const totalInteractions = interactions?.length || 0;
      const uniqueSessions = new Set(interactions?.map(i => i.session_id)).size;
      const totalConversions = conversions?.filter(c => c.booking_confirmation_detected).length || 0;
      const conversionRate = totalInteractions > 0 ? (totalConversions / totalInteractions * 100) : 0;
      const averageSessionInteractions = uniqueSessions > 0 ? totalInteractions / uniqueSessions : 0;

      // Top performing sessions
      const sessionStats = interactions?.reduce((acc, interaction) => {
        const sessionId = interaction.session_id;
        if (!acc[sessionId]) {
          acc[sessionId] = {
            sessionId,
            interactions: 0,
            hasBooking: false,
            lastActivity: interaction.created_at
          };
        }
        acc[sessionId].interactions++;
        return acc;
      }, {} as Record<string, any>) || {};

      // Add booking info
      conversions?.forEach(conv => {
        if (sessionStats[conv.session_id] && conv.booking_confirmation_detected) {
          sessionStats[conv.session_id].hasBooking = true;
        }
      });

      const topSessions = Object.values(sessionStats)
        .sort((a: any, b: any) => b.interactions - a.interactions)
        .slice(0, 10);

      return {
        metrics: {
          totalInteractions,
          uniqueSessions,
          totalConversions,
          conversionRate,
          averageSessionInteractions
        },
        dailyData,
        topSessions,
        rawInteractions: interactions,
        rawConversions: conversions
      };
    },
    refetchInterval: 30000
  });

  if (isLoading) {
    return <div className="flex justify-center p-8">Ladataan Timma-analytiikkaa...</div>;
  }

  const { metrics, dailyData, topSessions } = timmaData || {};

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="flex gap-2 mb-6">
        {(['7d', '30d', '90d'] as const).map((period) => (
          <Button
            key={period}
            variant={selectedPeriod === period ? 'default' : 'outline'}
            onClick={() => setSelectedPeriod(period)}
            size="sm"
          >
            {period === '7d' ? '7 päivää' : period === '30d' ? '30 päivää' : '90 päivää'}
          </Button>
        ))}
      </div>

      {/* Enhanced Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="border-l-4 border-l-blue-500 bg-blue-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">Timma Interaktiot</CardTitle>
            <Activity className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-800">{metrics?.totalInteractions || 0}</div>
            <p className="text-xs text-blue-600">{metrics?.uniqueSessions || 0} uniikki sessio</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500 bg-green-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700">Booking Vahvistukset</CardTitle>
            <Target className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-800">{metrics?.totalConversions || 0}</div>
            <p className="text-xs text-green-600">{(metrics?.conversionRate || 0).toFixed(1)}% konversio</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500 bg-purple-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700">Konversiotrendi</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-800">
              {dailyData && dailyData.length > 1 
                ? (dailyData[dailyData.length - 1]?.conversionRate - dailyData[0]?.conversionRate || 0).toFixed(1)
                : 0}%
            </div>
            <p className="text-xs text-purple-600">muutos {selectedPeriod} aikana</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500 bg-orange-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-700">Keskimäärin / Sessio</CardTitle>
            <BarChart3 className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-800">
              {(metrics?.averageSessionInteractions || 0).toFixed(1)}
            </div>
            <p className="text-xs text-orange-600">interaktiota per sessio</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-indigo-500 bg-indigo-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-indigo-700">Tehokkuus</CardTitle>
            <Award className="h-4 w-4 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-800">
              {metrics?.conversionRate && metrics.conversionRate > 15 ? 'Erinomainen' : 
               metrics?.conversionRate && metrics.conversionRate > 10 ? 'Hyvä' : 
               metrics?.conversionRate && metrics.conversionRate > 5 ? 'Keskitaso' : 'Kehitettävä'}
            </div>
            <p className="text-xs text-indigo-600">suoritustaso</p>
          </CardContent>
        </Card>
      </div>

      {/* Conversion Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Timma Konversiotrendi ({selectedPeriod})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(date) => new Date(date).toLocaleDateString('fi-FI', { day: 'numeric', month: 'numeric' })}
                />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip 
                  labelFormatter={(date) => new Date(date).toLocaleDateString('fi-FI')}
                />
                <Bar yAxisId="left" dataKey="interactions" fill="#3b82f6" name="Interaktiot" />
                <Bar yAxisId="left" dataKey="conversions" fill="#10b981" name="Konversiot" />
                <Line 
                  yAxisId="right" 
                  type="monotone" 
                  dataKey="conversionRate" 
                  stroke="#8b5cf6" 
                  strokeWidth={2}
                  name="Konversio-%"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Top Performing Sessions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Tehokkaimmat Timma-sessiot
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {topSessions?.map((session: any, index: number) => (
              <div 
                key={session.sessionId}
                className={`flex items-center justify-between p-3 border rounded-lg ${
                  session.hasBooking ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full text-blue-700 font-bold">
                    #{index + 1}
                  </div>
                  <div>
                    <p className="font-medium">{session.sessionId.substring(0, 8)}...</p>
                    <p className="text-sm text-gray-500">
                      {new Date(session.lastActivity).toLocaleString('fi-FI')}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    {session.hasBooking && (
                      <Badge variant="default" className="bg-green-600">Booking tehty</Badge>
                    )}
                    <Badge variant="outline">Timma</Badge>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg">{session.interactions}</p>
                  <p className="text-sm text-gray-500">interaktiota</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TimmaAnalyticsDashboard;
