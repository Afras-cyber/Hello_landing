
import React, { useState } from 'react';
import { useDetailedBookingAnalytics, useCustomerJourney } from '@/hooks/useDetailedBookingAnalytics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, User, MapPin, Phone, Mail, TrendingUp, Eye, Clock, MousePointer } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const DetailedBookingAnalytics: React.FC = () => {
  const [selectedDays, setSelectedDays] = useState(30);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const { data: bookings = [], isLoading } = useDetailedBookingAnalytics(selectedDays);
  const { data: journeySteps = [] } = useCustomerJourney(selectedSession || '');

  const confirmedBookings = bookings.filter(b => b.booking_confirmation_detected || b.confidence_score > 0.8);
  const totalRevenue = confirmedBookings.reduce((sum, b) => sum + (b.total_amount || 0), 0);
  const avgSessionDuration = bookings.reduce((sum, b) => sum + (b.total_session_duration || 0), 0) / bookings.length;

  if (isLoading) {
    return <div className="flex justify-center p-8">Ladataan analytiikkaa...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Vahvistetut Varaukset</CardTitle>
            <Calendar className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{confirmedBookings.length}</div>
            <p className="text-xs text-gray-400">
              Yhteensä {bookings.length} sessiota
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Kokonaistuotto</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{totalRevenue.toFixed(0)}€</div>
            <p className="text-xs text-gray-400">
              Keskimäärin {(totalRevenue / Math.max(confirmedBookings.length, 1)).toFixed(0)}€/varaus
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Keskimääräinen Istunto</CardTitle>
            <Clock className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {Math.floor(avgSessionDuration / 60)}min
            </div>
            <p className="text-xs text-gray-400">
              Sivulla vietetty aika
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Konversio</CardTitle>
            <MousePointer className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {((confirmedBookings.length / Math.max(bookings.length, 1)) * 100).toFixed(1)}%
            </div>
            <p className="text-xs text-gray-400">
              Varausprosentti
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Time Period Selector */}
      <div className="flex gap-2">
        {[7, 14, 30, 60].map(days => (
          <Button
            key={days}
            variant={selectedDays === days ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedDays(days)}
            className={selectedDays === days ? "bg-blondify-blue" : "border-gray-600 text-white"}
          >
            {days} päivää
          </Button>
        ))}
      </div>

      {/* Detailed Bookings Table */}
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <User className="h-5 w-5" />
            Yksityiskohtaiset Varaukset ({bookings.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div 
                key={booking.session_id} 
                className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                  booking.booking_confirmation_detected 
                    ? 'border-green-600 bg-green-900/20' 
                    : 'border-gray-600 hover:border-gray-500'
                }`}
                onClick={() => setSelectedSession(booking.session_id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="font-medium text-white">
                          {booking.customer_name || `Sessio ${booking.session_id.substring(0, 8)}...`}
                        </p>
                        <p className="text-sm text-gray-400">
                          {new Date(booking.booking_date || Date.now()).toLocaleString('fi-FI')}
                        </p>
                      </div>
                      
                      {booking.booking_confirmation_detected && (
                        <Badge className="bg-green-600">Vahvistettu</Badge>
                      )}
                      
                      <Badge variant="outline" className="border-blue-500 text-blue-400">
                        {(booking.confidence_score * 100).toFixed(0)}% varmuus
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="space-y-1">
                        {booking.customer_email && (
                          <div className="flex items-center gap-2 text-gray-300">
                            <Mail className="h-4 w-4" />
                            {booking.customer_email}
                          </div>
                        )}
                        {booking.customer_phone && (
                          <div className="flex items-center gap-2 text-gray-300">
                            <Phone className="h-4 w-4" />
                            {booking.customer_phone}
                          </div>
                        )}
                      </div>

                      <div className="space-y-1">
                        {booking.service_names && booking.service_names.length > 0 && (
                          <div className="text-gray-300">
                            <strong>Palvelut:</strong> {booking.service_names.join(', ')}
                          </div>
                        )}
                        {booking.total_amount && (
                          <div className="text-green-400 font-medium">
                            {booking.total_amount}€
                          </div>
                        )}
                      </div>

                      <div className="space-y-1">
                        <div className="text-gray-400">
                          <strong>Lähde:</strong> {booking.utm_source || 'Suora'}
                        </div>
                        {booking.utm_campaign && (
                          <div className="text-gray-400">
                            <strong>Kampanja:</strong> {booking.utm_campaign}
                          </div>
                        )}
                        <div className="text-gray-400">
                          <strong>Istunto:</strong> {Math.floor((booking.total_session_duration || 0) / 60)}min, 
                          {booking.page_views || 0} sivua
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300">
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Customer Journey Dialog */}
      <Dialog open={!!selectedSession} onOpenChange={() => setSelectedSession(null)}>
        <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">
              Asiakaspolku: {selectedSession?.substring(0, 8)}...
            </DialogTitle>
          </DialogHeader>
          
          {selectedSession && (
            <div className="space-y-6">
              {/* Session Overview */}
              {(() => {
                const booking = bookings.find(b => b.session_id === selectedSession);
                return booking ? (
                  <Card className="bg-gray-800 border-gray-600">
                    <CardHeader>
                      <CardTitle className="text-lg text-white">Istunnon Yhteenveto</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p><strong>Asiakas:</strong> {booking.customer_name || 'Tuntematon'}</p>
                        <p><strong>Sähköposti:</strong> {booking.customer_email || 'Ei saatavilla'}</p>
                        <p><strong>Puhelin:</strong> {booking.customer_phone || 'Ei saatavilla'}</p>
                        <p><strong>Summa:</strong> {booking.total_amount ? `${booking.total_amount}€` : 'Ei saatavilla'}</p>
                      </div>
                      <div>
                        <p><strong>UTM Lähde:</strong> {booking.utm_source || 'Suora'}</p>
                        <p><strong>UTM Kampanja:</strong> {booking.utm_campaign || 'Ei kampanjaa'}</p>
                        <p><strong>Istunnon kesto:</strong> {Math.floor((booking.total_session_duration || 0) / 60)} min</p>
                        <p><strong>Sivunäyttöjä:</strong> {booking.page_views || 0}</p>
                      </div>
                    </CardContent>
                  </Card>
                ) : null;
              })()}

              {/* Journey Steps */}
              <Card className="bg-gray-800 border-gray-600">
                <CardHeader>
                  <CardTitle className="text-lg text-white">Asiakaspolun Vaiheet</CardTitle>
                </CardHeader>
                <CardContent>
                  {journeySteps.length > 0 ? (
                    <div className="space-y-3">
                      {journeySteps.map((step, index) => (
                        <div key={step.id} className="flex items-start gap-4 p-3 bg-gray-700 rounded-lg">
                          <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="outline" className="text-xs">
                                {step.journey_step}
                              </Badge>
                              <span className="text-xs text-gray-400">
                                {new Date(step.created_at).toLocaleTimeString('fi-FI')}
                              </span>
                            </div>
                            {step.page_url && (
                              <p className="text-sm text-gray-300">
                                <strong>Sivu:</strong> {step.page_url}
                              </p>
                            )}
                            {step.utm_source && (
                              <p className="text-sm text-gray-300">
                                <strong>Lähde:</strong> {step.utm_source}
                              </p>
                            )}
                            {step.step_data && Object.keys(step.step_data).length > 0 && (
                              <details className="mt-2">
                                <summary className="text-xs text-blue-400 cursor-pointer">
                                  Lisätiedot
                                </summary>
                                <pre className="text-xs text-gray-400 mt-1 overflow-x-auto">
                                  {JSON.stringify(step.step_data, null, 2)}
                                </pre>
                              </details>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400 text-center py-4">
                      Ei asiakaspolun tietoja saatavilla tälle istunnolle.
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DetailedBookingAnalytics;
