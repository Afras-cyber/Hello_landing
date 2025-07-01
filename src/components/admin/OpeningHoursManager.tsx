
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Save, Clock } from 'lucide-react';

interface OpeningHour {
  id: string;
  day_of_week: string;
  opening_time: string | null;
  closing_time: string | null;
  is_closed: boolean;
  display_order: number;
}

const OpeningHoursManager: React.FC = () => {
  const [openingHours, setOpeningHours] = useState<OpeningHour[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchOpeningHours();
  }, []);

  const fetchOpeningHours = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('opening_hours')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) {
        console.error('Error fetching opening hours:', error);
        toast({
          title: "Virhe",
          description: "Aukioloaikojen hakeminen epäonnistui.",
          variant: "destructive"
        });
        return;
      }

      setOpeningHours(data || []);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Virhe",
        description: "Aukioloaikojen hakeminen epäonnistui.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateOpeningHour = (id: string, field: string, value: any) => {
    setOpeningHours(prev => 
      prev.map(hour => 
        hour.id === id ? { ...hour, [field]: value } : hour
      )
    );
  };

  const saveOpeningHours = async () => {
    try {
      setSaving(true);
      
      const updates = openingHours.map(hour => ({
        id: hour.id,
        day_of_week: hour.day_of_week,
        opening_time: hour.is_closed ? null : hour.opening_time,
        closing_time: hour.is_closed ? null : hour.closing_time,
        is_closed: hour.is_closed,
        display_order: hour.display_order,
        updated_at: new Date().toISOString()
      }));

      for (const update of updates) {
        const { error } = await supabase
          .from('opening_hours')
          .update(update)
          .eq('id', update.id);

        if (error) {
          throw error;
        }
      }

      toast({
        title: "Tallennettu!",
        description: "Aukioloajat on päivitetty onnistuneesti."
      });

    } catch (error) {
      console.error('Error saving opening hours:', error);
      toast({
        title: "Virhe",
        description: "Aukioloaikojen tallentaminen epäonnistui.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin h-8 w-8 text-blondify-blue" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center">
          <Clock className="mr-2 h-5 w-5" />
          Aukioloaikojen hallinta
        </CardTitle>
        <Button onClick={saveOpeningHours} disabled={saving}>
          {saving ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Tallenna muutokset
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {openingHours.map((hour) => (
            <div key={hour.id} className="bg-gray-800 p-4 rounded-lg border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-white">{hour.day_of_week}</h3>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={`closed-${hour.id}`}
                    checked={hour.is_closed}
                    onCheckedChange={(checked) => 
                      updateOpeningHour(hour.id, 'is_closed', checked)
                    }
                  />
                  <Label htmlFor={`closed-${hour.id}`} className="text-sm text-gray-300">
                    Suljettu
                  </Label>
                </div>
              </div>
              
              {!hour.is_closed && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`opening-${hour.id}`} className="text-sm text-gray-300 mb-2 block">
                      Avautumisaika
                    </Label>
                    <Input
                      id={`opening-${hour.id}`}
                      type="time"
                      value={hour.opening_time || ''}
                      onChange={(e) => updateOpeningHour(hour.id, 'opening_time', e.target.value)}
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`closing-${hour.id}`} className="text-sm text-gray-300 mb-2 block">
                      Sulkeutumisaika
                    </Label>
                    <Input
                      id={`closing-${hour.id}`}
                      type="time"
                      value={hour.closing_time || ''}
                      onChange={(e) => updateOpeningHour(hour.id, 'closing_time', e.target.value)}
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                </div>
              )}
              
              {hour.is_closed && (
                <p className="text-center text-gray-400 py-4">Suljettu</p>
              )}
            </div>
          ))}
        </div>
        
        <div className="mt-6 p-4 bg-blue-950/30 rounded-lg border border-blue-800/50">
          <h4 className="font-medium text-blue-200 mb-2">Ohje:</h4>
          <p className="text-sm text-blue-300">
            Muokkaa aukioloaikoja päivittäin. Valitse "Suljettu" jos kyseinen päivä on kokonaan kiinni. 
            Muutokset tulevat voimaan välittömästi tallennuksen jälkeen ja näkyvät sivuston footerissa.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default OpeningHoursManager;
