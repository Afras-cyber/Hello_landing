
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Calendar, 
  TrendingUp, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Target,
  Users,
  MousePointer,
  Clock,
  Eye,
  ShoppingBag,
  Sparkles
} from 'lucide-react';

interface ValidatedConversion {
  id: string;
  session_id: string;
  created_at: string;
  confidence_score: number;
  booking_confirmation_detected: boolean;
  estimated_conversion: boolean;
  manually_verified: boolean;
  iframe_interactions: number;
  booking_page_time: number;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  success_indicators?: any;
}

const ImprovedTimmaAnalytics = () => {
  const [selectedConversion, setSelectedConversion] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: validatedConversions, isLoading } = useQuery({
    queryKey: ['validated-timma-conversions'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_validated_timma_conversions');
      if (error) throw error;
      return data as ValidatedConversion[];
    }
  });

  const { data: recentInteractions } = useQuery({
    queryKey: ['recent-timma-interactions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('iframe_interactions')
        .select('*')
        .eq('is_booking_related', true)
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data;
    }
  });

  const verifyConversionMutation = useMutation({
    mutationFn: async ({ id, verified, notes }: { id: string; verified: boolean; notes?: string }) => {
      const { data: user } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('booking_conversions')
        .update({
          manually_verified: verified,
          verification_notes: notes,
          admin_verified_by: user.user?.id,
          admin_verified_at: new Date().toISOString()
        })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['validated-timma-conversions'] });
      toast({
        title: "Konversio päivitetty",
        description: "Konversion tila on päivitetty onnistuneesti.",
      });
    }
  });

  // Extract services safely without personal data
  const getBookedServices = (conversion: ValidatedConversion): string[] => {
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

  const hasVisualDetection = (conversion: ValidatedConversion): boolean => {
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

  const totalValidated = validatedConversions?.length || 0;
  const autoDetected = validatedConversions?.filter(c => c.booking_confirmation_detected && !c.manually_verified).length || 0;
  const visualDetections = validatedConversions?.filter(c => hasVisualDetection(c)).length || 0;
  const manuallyVerified = validatedConversions?.filter(c => c.manually_verified).length || 0;
  const averageConfidence = validatedConversions?.reduce((acc, c) => acc + (c.confidence_score || 0), 0) / (validatedConversions?.length || 1);
  const totalInteractions = validatedConversions?.reduce((acc, c) => acc + (c.iframe_interactions || 0), 0) || 0;

  const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const recentConversions = validatedConversions?.filter(c => 
    new Date(c.created_at) > last24Hours
  ).length || 0;

  if (isLoading) {
    return <div className="flex justify-center p-8">Ladataan Timma-analytiikkaa...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-green-500 bg-green-50 dark:bg-green-950">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">
              Visual Detections
            </CardTitle>
            <Eye className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-800 dark:text-green-200">{visualDetections}</div>
            <p className="text-xs text-green-600 dark:text-green-400">
              Visuaalinen tunnistus
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500 bg-blue-50 dark:bg-blue-950">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">
              Automaattitunnistus
            </CardTitle>
            <Target className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-800 dark:text-blue-200">{autoDetected}</div>
            <p className="text-xs text-blue-600 dark:text-blue-400">
              {((autoDetected / (totalValidated || 1)) * 100).toFixed(1)}% automaattisia
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500 bg-purple-50 dark:bg-purple-950">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300">
              Keskimääräinen Luottamus
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-800 dark:text-purple-200">
              {(averageConfidence * 100).toFixed(1)}%
            </div>
            <p className="text-xs text-purple-600 dark:text-purple-400">
              Algoritmin varmuus
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500 bg-orange-50 dark:bg-orange-950">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-700 dark:text-orange-300">
              Validoidut Yhteensä
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-800 dark:text-orange-200">{totalValidated}</div>
            <p className="text-xs text-orange-600 dark:text-orange-400">
              {recentConversions} viimeinen 24h
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Service-Based Conversions List */}
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-green-400" />
            Palveluvaraukset (Privacy Safe)
            <div className="flex gap-2 ml-auto">
              <Badge variant="outline" className="bg-green-100 text-green-700">
                {totalValidated} vahvistettua
              </Badge>
              <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                {visualDetections} visual
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {validatedConversions?.map((conversion) => {
              const services = getBookedServices(conversion);
              const isVisualDetection = hasVisualDetection(conversion);
              
              return (
                <div 
                  key={conversion.id}
                  className={`flex items-center justify-between p-4 rounded-lg border hover:border-green-500 transition-colors ${
                    isVisualDetection 
                      ? 'bg-green-900 border-green-600' 
                      : 'bg-gray-800 border-gray-700'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div>
                      <p className="font-medium text-green-400">
                        {conversion.session_id.substring(0, 8)}...
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(conversion.created_at).toLocaleString('fi-FI')}
                      </p>
                    </div>
                    
                    {/* Service Information */}
                    <div className="flex items-center space-x-3">
                      {services.map((service, index) => (
                        <div key={index} className="flex items-center gap-2">
                          {getServiceIcon(service)}
                          <span className="text-sm font-medium text-blue-300">
                            {service}
                          </span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex space-x-2">
                      {isVisualDetection && (
                        <Badge variant="default" className="bg-green-600">
                          <Eye className="h-3 w-3 mr-1" />
                          Visual Detection
                        </Badge>
                      )}
                      {conversion.booking_confirmation_detected && !isVisualDetection && (
                        <Badge variant="default" className="bg-blue-600">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Auto-tunnistettu
                        </Badge>
                      )}
                      {conversion.manually_verified && (
                        <Badge variant="secondary" className="bg-yellow-600">
                          <Users className="h-3 w-3 mr-1" />
                          Admin vahvistettu
                        </Badge>
                      )}
                      {conversion.utm_source && (
                        <Badge variant="outline">
                          {conversion.utm_source}
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-green-400">
                        {((conversion.confidence_score || 0) * 100).toFixed(0)}%
                      </span>
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-400">
                        {Math.floor((conversion.booking_page_time || 0) / 60)}min
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">
                      {conversion.iframe_interactions || 0} Timma-interaktiota
                    </p>
                    <div className="flex gap-2 mt-2">
                      {!conversion.manually_verified && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-green-600 text-green-400 hover:bg-green-600"
                            onClick={() => verifyConversionMutation.mutate({ 
                              id: conversion.id, 
                              verified: true,
                              notes: 'Manuaalisesti vahvistettu adminissa'
                            })}
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Vahvista
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-red-600 text-red-400 hover:bg-red-600"
                            onClick={() => verifyConversionMutation.mutate({ 
                              id: conversion.id, 
                              verified: false,
                              notes: 'Hylätty adminissa - ei todellinen konversio'
                            })}
                          >
                            <XCircle className="h-3 w-3 mr-1" />
                            Hylkää
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            
            {(!validatedConversions || validatedConversions.length === 0) && (
              <div className="text-center py-8 text-gray-400">
                <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-gray-600" />
                <p>Ei validoituja Timma-konversioita löytynyt</p>
                <p className="text-sm">
                  Konversiot näkyvät täällä kun ne täyttävät validointikriteerit
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Timma Interactions Preview */}
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <MousePointer className="h-5 w-5 text-blue-400" />
            Viimeisimmät Timma Interaktiot
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {recentInteractions?.slice(0, 10).map((interaction) => (
              <div key={interaction.id} className="flex items-center justify-between p-2 bg-gray-800 rounded text-sm">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={
                    interaction.interaction_type === 'visual_conversion_detected'
                      ? 'bg-green-800 text-green-300'
                      : 'text-xs'
                  }>
                    {interaction.interaction_type === 'visual_conversion_detected' ? '👁️ Visual' : interaction.interaction_type}
                  </Badge>
                  <span className="text-gray-300">
                    {interaction.session_id.substring(0, 8)}...
                  </span>
                </div>
                <span className="text-gray-500 text-xs">
                  {new Date(interaction.created_at).toLocaleTimeString('fi-FI')}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ImprovedTimmaAnalytics;
