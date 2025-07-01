
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Calendar, Users, TrendingUp, Eye, Clock, ShoppingBag, Euro, MapPin, Phone } from 'lucide-react';

const EnhancedBookingAnalytics = () => {
  const [selectedSession, setSelectedSession] = useState<string | null>(null);

  const { data: bookingConversions, isLoading } = useQuery({
    queryKey: ['enhanced-booking-conversions'],
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

  const { data: enhancedBookingDetails } = useQuery({
    queryKey: ['enhanced-booking-details'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('enhanced_booking_details')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data;
    }
  });

  const { data: detailedInteractions } = useQuery({
    queryKey: ['detailed-interactions', selectedSession],
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

  const { data: sessionEvents } = useQuery({
    queryKey: ['session-events', selectedSession],
    queryFn: async () => {
      if (!selectedSession) return [];
      
      const { data, error } = await supabase
        .from('session_events')
        .select('*')
        .eq('session_id', selectedSession)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data;
    },
    enabled: !!selectedSession
  });

  const { data: screenshotRecordings } = useQuery({
    queryKey: ['screenshot-recordings', selectedSession],
    queryFn: async () => {
      if (!selectedSession) return [];
      
      const { data, error } = await supabase
        .from('session_recordings')
        .select('*')
        .eq('session_id', selectedSession)
        .eq('recording_type', 'conversion_screenshot')
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data;
    },
    enabled: !!selectedSession
  });

  // Calculate enhanced statistics
  const confirmedBookings = bookingConversions?.filter(c => c.booking_confirmation_detected) || [];
  const estimatedBookings = bookingConversions?.filter(c => c.estimated_conversion && !c.booking_confirmation_detected) || [];
  const averagePageTime = bookingConversions?.reduce((acc, c) => acc + (c.booking_page_time || 0), 0) / (bookingConversions?.length || 1);
  const averageInteractions = bookingConversions?.reduce((acc, c) => acc + (c.iframe_interactions || 0), 0) / (bookingConversions?.length || 1);

  // Calculate total revenue from enhanced booking details
  const totalRevenue = enhancedBookingDetails?.reduce((sum, booking) => sum + (booking.total_amount || 0), 0) || 0;
  const averageOrderValue = enhancedBookingDetails?.length > 0 ? totalRevenue / enhancedBookingDetails.length : 0;

  // Extract service information from success indicators
  const getBookingServices = (conversion: any) => {
    if (conversion.success_indicators && typeof conversion.success_indicators === 'object') {
      const indicators = conversion.success_indicators as any;
      if (indicators.detected_services && Array.isArray(indicators.detected_services)) {
        return indicators.detected_services;
      }
      if (indicators.services_extracted && Array.isArray(indicators.services_extracted)) {
        return indicators.services_extracted;
      }
      if (indicators.final_booking && typeof indicators.final_booking === 'object' && indicators.final_booking.service) {
        return [indicators.final_booking.service];
      }
    }
    return [];
  };

  const getBookingSteps = (conversion: any) => {
    if (conversion.success_indicators && typeof conversion.success_indicators === 'object') {
      const indicators = conversion.success_indicators as any;
      return indicators.booking_steps || [];
    }
    return [];
  };

  const getEnhancedDetails = (sessionId: string) => {
    return enhancedBookingDetails?.find(detail => detail.session_id === sessionId);
  };

  const getBookingStepFromInteraction = (interaction: any) => {
    if (interaction.interaction_data && typeof interaction.interaction_data === 'object') {
      const data = interaction.interaction_data as any;
      if (data.booking_step && typeof data.booking_step === 'object') {
        return data.booking_step;
      }
    }
    return null;
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Ladataan parannettua analytiikkaa...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vahvistetut Varaukset</CardTitle>
            <Calendar className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{confirmedBookings.length}</div>
            <p className="text-xs text-muted-foreground">100% varmuus</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Arvioidut Varaukset</CardTitle>
            <TrendingUp className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{estimatedBookings.length}</div>
            <p className="text-xs text-muted-foreground">Korkea todennäköisyys</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kokonaistuotto</CardTitle>
            <Euro className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{totalRevenue.toFixed(0)}€</div>
            <p className="text-xs text-muted-foreground">Poimittuja varauksia</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Keskihinta</CardTitle>
            <Euro className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageOrderValue.toFixed(0)}€</div>
            <p className="text-xs text-muted-foreground">Per varaus</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Keskimääräiset Interaktiot</CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(averageInteractions)}</div>
            <p className="text-xs text-muted-foreground">Per sessio</p>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Booking Sessions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Parannetut Varaussessiot</span>
            <div className="flex gap-2">
              <Badge variant="default">{confirmedBookings.length} vahvistettu</Badge>
              <Badge variant="secondary">{estimatedBookings.length} arvioitu</Badge>
              <Badge variant="outline">{enhancedBookingDetails?.length || 0} yksityiskohtaista</Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {bookingConversions?.map((conversion) => {
              const services = getBookingServices(conversion);
              const steps = getBookingSteps(conversion);
              const enhancedDetail = getEnhancedDetails(conversion.session_id);
              
              return (
                <div 
                  key={conversion.id} 
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                  onClick={() => setSelectedSession(conversion.session_id)}
                >
                  <div className="flex items-center space-x-4">
                    <div>
                      <p className="font-medium">{conversion.session_id.substring(0, 8)}...</p>
                      <p className="text-sm text-gray-500">
                        {new Date(conversion.created_at).toLocaleString('fi-FI')}
                      </p>
                    </div>
                    
                    <div className="flex space-x-2">
                      {conversion.booking_confirmation_detected && (
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          ✓ Vahvistettu
                        </Badge>
                      )}
                      {conversion.estimated_conversion && !conversion.booking_confirmation_detected && (
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                          ~ Arvioitu
                        </Badge>
                      )}
                      {conversion.manually_verified && (
                        <Badge variant="outline" className="bg-blue-100 text-blue-800">
                          Admin vahvistettu
                        </Badge>
                      )}
                      {enhancedDetail && (
                        <Badge variant="outline" className="bg-purple-100 text-purple-800">
                          Yksityiskohdat
                        </Badge>
                      )}
                    </div>
                    
                    {services.length > 0 && (
                      <div className="flex items-center gap-1">
                        <ShoppingBag className="h-3 w-3 text-gray-500" />
                        <span className="text-xs text-gray-600">
                          {services.slice(0, 2).join(', ')}
                          {services.length > 2 && '...'}
                        </span>
                      </div>
                    )}

                    {enhancedDetail && (
                      <div className="flex items-center gap-2">
                        {enhancedDetail.total_amount && (
                          <div className="flex items-center gap-1">
                            <Euro className="h-3 w-3 text-green-500" />
                            <span className="text-sm font-medium text-green-600">
                              {enhancedDetail.total_amount}€
                            </span>
                          </div>
                        )}
                        {enhancedDetail.appointment_time && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3 text-blue-500" />
                            <span className="text-xs text-blue-600">
                              {enhancedDetail.appointment_time}
                            </span>
                          </div>
                        )}
                        {enhancedDetail.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-gray-500" />
                            <span className="text-xs text-gray-600">
                              {enhancedDetail.location}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="text-right">
                    <p className="font-medium">{((conversion.confidence_score || 0) * 100).toFixed(1)}%</p>
                    <p className="text-xs text-gray-500">
                      {conversion.iframe_interactions || 0} interaktiota
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Session View */}
      {selectedSession && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Parannettu Session: {selectedSession.substring(0, 8)}...
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Enhanced Booking Details */}
              {getEnhancedDetails(selectedSession) && (
                <div>
                  <h3 className="font-medium mb-3 flex items-center gap-2">
                    <ShoppingBag className="h-4 w-4" />
                    Yksityiskohtaiset Varaustiedot
                  </h3>
                  <div className="space-y-3 p-3 bg-green-50 rounded">
                    {(() => {
                      const detail = getEnhancedDetails(selectedSession);
                      return (
                        <>
                          {detail?.service_names && detail.service_names.length > 0 && (
                            <div>
                              <span className="font-medium text-sm">Palvelut:</span>
                              <ul className="text-sm text-gray-700 ml-2">
                                {detail.service_names.map((service, idx) => (
                                  <li key={idx} className="flex justify-between">
                                    <span>• {service}</span>
                                    {detail.service_prices && detail.service_prices[idx] && (
                                      <span className="font-medium">{detail.service_prices[idx]}€</span>
                                    )}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          
                          {detail?.total_amount && (
                            <div className="border-t pt-2">
                              <span className="font-bold text-green-600">
                                Yhteensä: {detail.total_amount}€
                              </span>
                            </div>
                          )}
                          
                          {detail?.appointment_date && (
                            <div>
                              <span className="font-medium text-sm">Varauspäivä:</span>
                              <span className="text-sm text-gray-700 ml-2">
                                {new Date(detail.appointment_date).toLocaleDateString('fi-FI')}
                              </span>
                            </div>
                          )}
                          
                          {detail?.appointment_time && (
                            <div>
                              <span className="font-medium text-sm">Aika:</span>
                              <span className="text-sm text-gray-700 ml-2">
                                {detail.appointment_time}
                              </span>
                            </div>
                          )}
                          
                          {detail?.location && (
                            <div>
                              <span className="font-medium text-sm">Sijainti:</span>
                              <span className="text-sm text-gray-700 ml-2">
                                {detail.location}
                              </span>
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </div>
                </div>
              )}

              {/* Screenshot Analysis */}
              {screenshotRecordings && screenshotRecordings.length > 0 && (
                <div>
                  <h3 className="font-medium mb-3">Screenshot Analyysi</h3>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {screenshotRecordings.map((recording, index) => (
                      <div key={recording.id} className="flex items-center space-x-3 p-2 bg-purple-50 rounded text-sm">
                        <Badge variant="outline" className="text-xs">
                          Screenshot {index + 1}
                        </Badge>
                        <span className="flex-1">
                          Confidence: {((recording.ocr_confidence || 0) * 100).toFixed(1)}%
                        </span>
                        {recording.metadata && typeof recording.metadata === 'object' && (
                          <span className="text-xs text-gray-500">
                            {(recording.metadata as any).conversion_detected ? '✅ Detected' : '⏳ Analyzing'}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Timma Interactions */}
              <div>
                <h3 className="font-medium mb-3">Timma Varausinteraktiot</h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {detailedInteractions?.map((interaction, index) => {
                    const bookingStep = getBookingStepFromInteraction(interaction);
                    return (
                      <div key={interaction.id} className="flex items-center space-x-3 p-2 bg-blue-50 rounded text-sm">
                        <span className="text-xs text-gray-500 w-12">
                          +{Math.floor(interaction.timestamp_offset / 1000)}s
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {interaction.interaction_type}
                        </Badge>
                        <span className="flex-1">
                          {interaction.element_text || interaction.element_selector}
                        </span>
                        {bookingStep && (
                          <Badge variant="secondary" className="text-xs">
                            {bookingStep.step}
                          </Badge>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* All Site Events */}
              <div>
                <h3 className="font-medium mb-3">Kaikki Sivun Tapahtumat</h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {sessionEvents?.map((event, index) => (
                    <div key={event.id} className="flex items-center space-x-3 p-2 bg-gray-50 rounded text-sm">
                      <span className="text-xs text-gray-500 w-12">
                        +{Math.floor(event.timestamp_offset / 1000)}s
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {event.event_type}
                      </Badge>
                      <span className="flex-1">
                        {event.element_text?.substring(0, 50) || event.page_url?.split('/').pop()}
                      </span>
                      {event.x_coordinate && event.y_coordinate && (
                        <span className="text-xs text-gray-500">
                          ({event.x_coordinate}, {event.y_coordinate})
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EnhancedBookingAnalytics;
