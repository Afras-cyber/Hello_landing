
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

interface ConversionRecord {
  id: string;
  session_id: string;
  created_at: string;
  confidence_score: number;
  booking_confirmation_detected: boolean;
  estimated_conversion: boolean;
  conversion_validated: boolean;
  validation_notes: string;
  validated_at: string;
  iframe_interactions: number;
  booking_page_time: number;
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
}

const ConversionValidation = () => {
  const [selectedConversion, setSelectedConversion] = useState<string | null>(null);
  const [validationNotes, setValidationNotes] = useState('');
  const queryClient = useQueryClient();

  const { data: conversions, isLoading } = useQuery({
    queryKey: ['conversion-validation'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('booking_conversions')
        .select('*')
        .or('conversion_validated.is.null,conversion_validated.eq.false')
        .gte('confidence_score', 0.3)
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data as ConversionRecord[];
    }
  });

  const validateMutation = useMutation({
    mutationFn: async ({ conversionId, isValid, notes }: { 
      conversionId: string; 
      isValid: boolean; 
      notes: string;
    }) => {
      const { data, error } = await supabase.rpc('validate_timma_conversion', {
        conversion_id: conversionId,
        is_valid: isValid,
        notes: notes || null,
        validator_id: null // We'll implement user auth later
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversion-validation'] });
      setSelectedConversion(null);
      setValidationNotes('');
      toast.success('Konversio validoitu onnistuneesti');
    },
    onError: (error) => {
      console.error('Validation error:', error);
      toast.error('Virhe validoinnissa');
    }
  });

  const handleValidation = (conversionId: string, isValid: boolean) => {
    validateMutation.mutate({
      conversionId,
      isValid,
      notes: validationNotes
    });
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 0.8) return 'text-green-400';
    if (score >= 0.6) return 'text-yellow-400';
    if (score >= 0.4) return 'text-orange-400';
    return 'text-red-400';
  };

  const getConfidenceLabel = (score: number) => {
    if (score >= 0.8) return 'Korkea';
    if (score >= 0.6) return 'Kohtalainen';
    if (score >= 0.4) return 'Matala';
    return 'Epävarma';
  };

  if (isLoading) {
    return <div className="text-white p-6">Ladataan validoitavia konversioita...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Timma-konversioiden validointi</h2>
        <p className="text-gray-400">
          Tarkista ja validoi algoritmin tunnistamia varauksia. Tämä parantaa konversioiden tarkkuutta.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Clock className="h-4 w-4 text-yellow-500" />
              Odottaa validointia
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {conversions?.length || 0}
            </div>
            <p className="text-xs text-gray-400">Konversiota</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              Korkean luottamuksen
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {conversions?.filter(c => c.confidence_score >= 0.8).length || 0}
            </div>
            <p className="text-xs text-gray-400">Yli 80% varmuus</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Vahvistetut varaukset
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {conversions?.filter(c => c.booking_confirmation_detected).length || 0}
            </div>
            <p className="text-xs text-gray-400">Automaattisesti tunnistettu</p>
          </CardContent>
        </Card>
      </div>

      {/* Conversion List */}
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Validoitavat konversiot</CardTitle>
        </CardHeader>
        <CardContent>
          {conversions && conversions.length > 0 ? (
            <div className="space-y-4">
              {conversions.map((conversion) => (
                <div
                  key={conversion.id}
                  className={`p-4 border border-gray-700 rounded-lg ${
                    selectedConversion === conversion.id ? 'bg-gray-800' : 'bg-gray-900'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="font-medium text-white">
                          Sessio: {conversion.session_id.substring(0, 12)}...
                        </p>
                        <p className="text-sm text-gray-400">
                          {new Date(conversion.created_at).toLocaleString('fi-FI')}
                        </p>
                      </div>
                      
                      <div className="flex gap-2">
                        {conversion.booking_confirmation_detected && (
                          <Badge className="bg-green-600">Vahvistettu</Badge>
                        )}
                        {conversion.utm_source && (
                          <Badge variant="outline">{conversion.utm_source}</Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className={`text-lg font-bold ${getConfidenceColor(conversion.confidence_score)}`}>
                        {(conversion.confidence_score * 100).toFixed(0)}%
                      </div>
                      <div className="text-sm text-gray-400">
                        {getConfidenceLabel(conversion.confidence_score)}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-400">Interaktioita</p>
                      <p className="text-white font-medium">{conversion.iframe_interactions}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Aika sivulla</p>
                      <p className="text-white font-medium">
                        {Math.floor(conversion.booking_page_time / 60)}min {conversion.booking_page_time % 60}s
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Kampanja</p>
                      <p className="text-white font-medium">
                        {conversion.utm_campaign || 'Ei kampanjaa'}
                      </p>
                    </div>
                  </div>

                  {selectedConversion === conversion.id && (
                    <div className="space-y-3 pt-3 border-t border-gray-700">
                      <Textarea
                        placeholder="Lisää muistiinpanoja validoinnista (valinnainen)..."
                        value={validationNotes}
                        onChange={(e) => setValidationNotes(e.target.value)}
                        className="bg-gray-800 border-gray-600 text-white"
                      />
                      
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleValidation(conversion.id, true)}
                          disabled={validateMutation.isPending}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Vahvista varaus
                        </Button>
                        
                        <Button
                          onClick={() => handleValidation(conversion.id, false)}
                          disabled={validateMutation.isPending}
                          variant="destructive"
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Hylkää
                        </Button>
                        
                        <Button
                          onClick={() => {
                            setSelectedConversion(null);
                            setValidationNotes('');
                          }}
                          variant="outline"
                          className="border-gray-600 text-gray-300"
                        >
                          Peruuta
                        </Button>
                      </div>
                    </div>
                  )}

                  {selectedConversion !== conversion.id && (
                    <Button
                      onClick={() => setSelectedConversion(conversion.id)}
                      variant="outline"
                      size="sm"
                      className="mt-2 border-gray-600 text-gray-300"
                    >
                      Validoi tämä konversio
                    </Button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Ei validoitavia konversioita</p>
              <p className="text-sm">Kaikki konversiot on jo validoitu tai ei ole riittävän luotettavia</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ConversionValidation;
