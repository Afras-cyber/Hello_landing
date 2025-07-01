
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Calendar, Clock, MousePointer, TrendingUp, Eye, ExternalLink, Activity, Target } from 'lucide-react';

const TimmaAnalytics = () => {
  const [selectedSession, setSelectedSession] = useState<string | null>(null);

  // Fetch Timma-specific iframe interactions
  const { data: timmaInteractions, isLoading: timmaLoading } = useQuery({
    queryKey: ['timma-interactions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('iframe_interactions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (error) throw error;
      return data;
    }
  });

  // Fetch Timma booking conversions
  const { data: timmaConversions, isLoading: conversionsLoading } = useQuery({
    queryKey: ['timma-conversions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('booking_conversions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data;
    }
  });

  // Fetch session details for selected session
  const { data: sessionDetails } = useQuery({
    queryKey: ['timma-session-details', selectedSession],
    queryFn: async () => {
      if (!selectedSession) return null;
      
      const { data, error } = await supabase
        .from('iframe_interactions')
        .select('*')
        .eq('session_id', selectedSession)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data;
    },
    enabled: !!selectedSession
  });

  // Calculate Timma-specific metrics
  const totalTimmaInteractions = timmaInteractions?.length || 0;
  const uniqueTimmaSessions = new Set(timmaInteractions?.map(i => i.session_id)).size;
  const timmaBookingConfirmations = timmaInteractions?.filter(i => i.interaction_type === 'booking_confirmation').length || 0;
  const averageTimmaSessionInteractions = uniqueTimmaSessions > 0 ? totalTimmaInteractions / uniqueTimmaSessions : 0;
  
  // High confidence conversions (>80%)
  const highConfidenceConversions = timmaConversions?.filter(c => (c.confidence_score || 0) > 0.8).length || 0;
  
  // Calculate conversion rate
  const timmaConversionRate = uniqueTimmaSessions > 0 ? (timmaBookingConfirmations / uniqueTimmaSessions) * 100 : 0;

  if (timmaLoading || conversionsLoading) {
    return <div className="flex justify-center p-8">Ladataan Timma-analytiikkaa...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Timma Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-500 bg-blue-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">Timma Interaktiot</CardTitle>
            <MousePointer className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-800">{totalTimmaInteractions}</div>
            <p className="text-xs text-blue-600">
              {uniqueTimmaSessions} uniikki sessio
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500 bg-green-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700">Booking Vahvistukset</CardTitle>
            <Target className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-800">{timmaBookingConfirmations}</div>
            <p className="text-xs text-green-600">
              {timmaConversionRate.toFixed(1)}% konversio
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500 bg-purple-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700">Korkea Luottamus</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-800">{highConfidenceConversions}</div>
            <p className="text-xs text-purple-600">
              {'>'} 80% varmuus
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500 bg-orange-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-700">Keskimäärin / Sessio</CardTitle>
            <Activity className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-800">{averageTimmaSessionInteractions.toFixed(1)}</div>
            <p className="text-xs text-orange-600">
              interaktiota per sessio
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Timma Sessions */}
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-700">
            <Eye className="h-5 w-5" />
            Viimeisimmät Timma Sessiot
            <Badge variant="outline" className="bg-blue-100 text-blue-700">
              {uniqueTimmaSessions} aktiivista sessiota
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from(new Set(timmaInteractions?.map(i => i.session_id)))
              .slice(0, 10)
              .map((sessionId) => {
                const sessionInteractions = timmaInteractions?.filter(i => i.session_id === sessionId) || [];
                const hasBookingConfirmation = sessionInteractions.some(i => i.interaction_type === 'booking_confirmation');
                const interactionCount = sessionInteractions.length;
                const latestInteraction = sessionInteractions[0];
                
                return (
                  <div 
                    key={sessionId}
                    className={`flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer ${
                      hasBookingConfirmation ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200'
                    }`}
                    onClick={() => setSelectedSession(sessionId)}
                  >
                    <div className="flex items-center space-x-4">
                      <div>
                        <p className="font-medium text-blue-700">{sessionId.substring(0, 8)}...</p>
                        <p className="text-sm text-gray-500">
                          {new Date(latestInteraction?.created_at || '').toLocaleString('fi-FI')}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        {hasBookingConfirmation && (
                          <Badge variant="default" className="bg-green-500">Booking vahvistettu</Badge>
                        )}
                        <Badge variant="outline" className="bg-blue-100 text-blue-700">
                          Timma sessio
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-blue-700">{interactionCount} interaktiota</p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-1 border-blue-300 text-blue-600 hover:bg-blue-100"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Näytä
                      </Button>
                    </div>
                  </div>
                );
              })}
          </div>
        </CardContent>
      </Card>

      {/* Timma Conversion Analysis */}
      <Card className="border-l-4 border-l-green-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-700">
            <TrendingUp className="h-5 w-5" />
            Timma Konversio-analyysi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {timmaConversions?.slice(0, 8).map((conversion) => (
              <div 
                key={conversion.id}
                className="flex items-center justify-between p-4 border rounded-lg bg-green-50 border-green-200"
              >
                <div className="flex items-center space-x-4">
                  <div>
                    <p className="font-medium text-green-700">{conversion.session_id.substring(0, 8)}...</p>
                    <p className="text-sm text-gray-500">
                      {new Date(conversion.created_at).toLocaleString('fi-FI')}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    {conversion.booking_confirmation_detected && (
                      <Badge variant="default" className="bg-green-600">Vahvistettu</Badge>
                    )}
                    {conversion.estimated_conversion && (
                      <Badge variant="secondary">Arvioitu</Badge>
                    )}
                    {conversion.confidence_score && conversion.confidence_score > 0.8 && (
                      <Badge variant="outline" className="bg-green-100 text-green-700">
                        Korkea luottamus
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-green-700">
                    {((conversion.confidence_score || 0) * 100).toFixed(0)}% varmuus
                  </p>
                  <p className="text-sm text-gray-500">
                    {conversion.iframe_interactions || 0} Timma-interaktiota
                  </p>
                  <p className="text-sm text-gray-500">
                    {Math.floor((conversion.booking_page_time || 0) / 60)}min sivulla
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Session Detail Modal */}
      {selectedSession && sessionDetails && (
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-700">
              <Eye className="h-5 w-5" />
              Timma Session Yksityiskohdat: {selectedSession.substring(0, 8)}...
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedSession(null)}
                className="ml-auto"
              >
                Sulje
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {sessionDetails.map((interaction, index) => (
                <div key={interaction.id} className="flex items-center space-x-4 p-3 bg-blue-50 rounded border-l-2 border-blue-300">
                  <span className="text-xs text-blue-600 w-16 font-mono">
                    +{Math.floor(interaction.timestamp_offset / 1000)}s
                  </span>
                  <Badge 
                    variant="outline" 
                    className={`${
                      interaction.interaction_type === 'booking_confirmation' 
                        ? 'bg-green-100 text-green-700 border-green-300' 
                        : 'bg-blue-100 text-blue-700 border-blue-300'
                    }`}
                  >
                    {interaction.interaction_type}
                  </Badge>
                  <span className="text-sm flex-1 text-blue-800">
                    {interaction.element_text || interaction.element_selector || 'Timma interaktio'}
                  </span>
                  {interaction.x_coordinate && interaction.y_coordinate && (
                    <span className="text-xs text-blue-500 font-mono">
                      ({interaction.x_coordinate}, {interaction.y_coordinate})
                    </span>
                  )}
                  {interaction.iframe_url && (
                    <ExternalLink className="h-3 w-3 text-blue-400" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TimmaAnalytics;
