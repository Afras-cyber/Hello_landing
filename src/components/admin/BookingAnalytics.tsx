
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Calendar, Mouse, Users, TrendingUp, Eye, ExternalLink, ShoppingBag, Sparkles } from 'lucide-react';

const BookingAnalytics = () => {
  const [selectedSession, setSelectedSession] = useState<string | null>(null);

  const { data: conversions, isLoading: conversionsLoading } = useQuery({
    queryKey: ['booking-conversions'],
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

  const { data: interactions, isLoading: interactionsLoading } = useQuery({
    queryKey: ['iframe-interactions', selectedSession],
    queryFn: async () => {
      if (!selectedSession) return [];
      
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

  const { data: heatMapData } = useQuery({
    queryKey: ['heat-map-data'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('heat_map_data')
        .select('*')
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());
      
      if (error) throw error;
      return data;
    }
  });

  // Extract services from success indicators (privacy-safe)
  const getBookedServices = (conversion: any): string[] => {
    if (conversion.success_indicators && typeof conversion.success_indicators === 'object') {
      const indicators = conversion.success_indicators as any;
      if (indicators.detected_services && Array.isArray(indicators.detected_services)) {
        return indicators.detected_services;
      }
      if (indicators.final_booking && indicators.final_booking.service) {
        return [indicators.final_booking.service];
      }
    }
    return ['Tuntematon palvelu'];
  };

  const getDetectionMethod = (conversion: any): string => {
    if (conversion.success_indicators && typeof conversion.success_indicators === 'object') {
      const indicators = conversion.success_indicators as any;
      if (indicators.visual_conversion_detected) {
        return 'Visual Detection';
      }
      if (indicators.detection_method) {
        return indicators.detection_method;
      }
    }
    return 'Standard';
  };

  const hasVisualDetection = (conversion: any): boolean => {
    if (conversion.success_indicators && typeof conversion.success_indicators === 'object') {
      const indicators = conversion.success_indicators as any;
      return indicators.visual_conversion_detected === true;
    }
    return false;
  };

  const getServiceIcon = (service: string) => {
    if (service.toLowerCase().includes('vaalennus') || service.toLowerCase().includes('all-inclusive')) {
      return <Sparkles className="h-4 w-4 text-yellow-500" />;
    }
    return <ShoppingBag className="h-4 w-4 text-blue-500" />;
  };

  // Calculate statistics using booking_conversions table like other pages
  const totalSessions = conversions?.length || 0;
  const totalConversions = conversions?.filter(c => c.booking_confirmation_detected).length || 0;
  const visualConversions = conversions?.filter(c => hasVisualDetection(c)).length || 0;
  const averageConfidence = conversions?.reduce((acc, c) => acc + (c.confidence_score || 0), 0) / (conversions?.length || 1);
  const conversionRate = totalSessions > 0 ? (totalConversions / totalSessions) * 100 : 0;

  if (conversionsLoading) {
    return <div className="flex justify-center p-8">Ladataan analytiikkaa...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Varausten Konversiot</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalConversions}</div>
            <p className="text-xs text-muted-foreground">
              {conversionRate.toFixed(1)}% konversio
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Visual Detections</CardTitle>
            <Eye className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{visualConversions}</div>
            <p className="text-xs text-muted-foreground">
              Visuaalinen tunnistus
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Yhteensä Sessiot</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSessions}</div>
            <p className="text-xs text-muted-foreground">
              Kaikki sessiot
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Heat Map Klikkaukset</CardTitle>
            <Mouse className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{heatMapData?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              Viimeinen 7 päivää
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Timma Booking Sessions - Privacy Safe */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Timma Varaussessiot (Palvelut)</span>
            <div className="flex gap-2">
              <Badge variant="outline">
                {totalConversions} konversiota
              </Badge>
              <Badge variant="secondary" className="bg-green-100 text-green-700">
                {visualConversions} visual
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {conversions?.map((conversion) => {
              const services = getBookedServices(conversion);
              const detectionMethod = getDetectionMethod(conversion);
              const isVisualDetection = hasVisualDetection(conversion);
              
              return (
                <div 
                  key={conversion.id} 
                  className={`flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer ${
                    isVisualDetection ? 'border-green-300 bg-green-50' : ''
                  }`}
                  onClick={() => setSelectedSession(conversion.session_id)}
                >
                  <div className="flex items-center space-x-4">
                    <div>
                      <p className="font-medium">{conversion.session_id.substring(0, 8)}...</p>
                      <p className="text-sm text-gray-500">
                        {new Date(conversion.created_at).toLocaleString('fi-FI')}
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      {services.map((service, index) => (
                        <div key={index} className="flex items-center gap-1">
                          {getServiceIcon(service)}
                          <span className="text-sm font-medium text-blue-700">
                            {service}
                          </span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex space-x-2">
                      {conversion.booking_confirmation_detected && (
                        <Badge variant="default" className={isVisualDetection ? 'bg-green-600' : ''}>
                          {isVisualDetection ? '👁️ Visual' : 'Auto-tunnistettu'}
                        </Badge>
                      )}
                      {conversion.estimated_conversion && !conversion.booking_confirmation_detected && (
                        <Badge variant="secondary">Arvioitu</Badge>
                      )}
                      {conversion.manually_verified && (
                        <Badge variant="outline" className="bg-blue-100 text-blue-800">
                          Admin vahvistettu
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-xs">
                        {detectionMethod}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="font-medium">{((conversion.confidence_score || 0) * 100).toFixed(0)}%</p>
                    <p className="text-sm text-gray-500">{conversion.iframe_interactions || 0} interaktiota</p>
                    <p className="text-sm text-gray-500">{Math.floor((conversion.booking_page_time || 0) / 60)}min sivulla</p>
                    {isVisualDetection && (
                      <p className="text-xs text-green-600 font-medium">Visual Detection ✓</p>
                    )}
                  </div>
                </div>
              );
            })}
            
            {conversions && conversions.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <p>Ei Timma booking -sessioita löytynyt.</p>
                <p className="text-sm">Sessioita tallentuu kun käyttäjät vierailevat booking-sivulla ja interaktoivat Timma-iframe:n kanssa.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Real Conversions - Show Services Only */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Viimeisimmät Varaukset (Palveludata)</span>
            <Badge variant="default">
              {totalConversions} vahvistettua varausta
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {conversions?.filter(s => s.booking_confirmation_detected).slice(0, 10).map((session) => (
              <div key={session.id} className="flex items-center justify-between p-3 border rounded-lg bg-green-50">
                <div className="flex items-center space-x-3">
                  <div>
                    <p className="font-medium">{session.session_id.substring(0, 8)}...</p>
                    <p className="text-sm text-gray-500">
                      {new Date(session.created_at).toLocaleString('fi-FI')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-700">
                      Booking Completed
                    </span>
                  </div>
                  
                  <Badge variant="default">Varaus tehty</Badge>
                  {session.utm_source && (
                    <Badge variant="outline">{session.utm_source}</Badge>
                  )}
                </div>
                <div className="text-right">
                  <p className="font-medium">{session.estimated_value || 0}€</p>
                  <p className="text-sm text-gray-500">
                    {Math.floor((session.booking_page_time || 0) / 60)}min sessio
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Session Details - Privacy Safe */}
      {selectedSession && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Session Details (Privacy Safe): {selectedSession.substring(0, 8)}...
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedSession(null)}
              >
                Sulje
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {interactionsLoading ? (
              <p>Ladataan interaktioita...</p>
            ) : (
              <div className="space-y-2">
                {interactions?.map((interaction, index) => (
                  <div key={interaction.id} className="flex items-center space-x-4 p-2 bg-gray-50 rounded">
                    <span className="text-xs text-gray-500 w-16">
                      +{Math.floor(interaction.timestamp_offset / 1000)}s
                    </span>
                    <Badge variant="outline" className={
                      interaction.interaction_type === 'visual_conversion_detected' 
                        ? 'bg-green-100 text-green-700'
                        : ''
                    }>
                      {interaction.interaction_type}
                    </Badge>
                    <span className="text-sm flex-1">
                      {interaction.element_text || interaction.element_selector || 'Timma interaction'}
                    </span>
                    {interaction.interaction_type === 'visual_conversion_detected' && (
                      <Badge variant="default" className="bg-green-600">
                        👁️ Visual Detection
                      </Badge>
                    )}
                    {interaction.x_coordinate && interaction.y_coordinate && (
                      <span className="text-xs text-gray-500">
                        ({interaction.x_coordinate}, {interaction.y_coordinate})
                      </span>
                    )}
                    {interaction.iframe_url && (
                      <ExternalLink className="h-3 w-3 text-gray-400" />
                    )}
                  </div>
                ))}
                
                {(!interactions || interactions.length === 0) && (
                  <p className="text-gray-500 text-center py-4">
                    Ei löytynyt Timma-interaktioita tälle sessiolle
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BookingAnalytics;
