import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Save, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import OpeningHoursManager from '@/components/admin/OpeningHoursManager';
import GlobalSettings from '@/components/admin/GlobalSettings';
import NavigationManager from '@/components/admin/NavigationManager';
import TestimonialsManager from '@/components/admin/TestimonialsManager';
import HeadScriptManager from '@/components/admin/HeadScriptManager';

const AdminSettings: React.FC = () => {
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState('Järjestelmä on tällä hetkellä huollossa');
  const [estimatedCompletion, setEstimatedCompletion] = useState('Arvioitu palautumisaika: Pian');
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const saveMaintenanceSettings = async () => {
    try {
      setSaving(true);
      
      const { error } = await supabase
        .from('maintenance_settings')
        .upsert({
          id: 'main',
          is_enabled: maintenanceMode,
          message: maintenanceMessage,
          estimated_completion: estimatedCompletion,
          updated_at: new Date().toISOString()
        }, { onConflict: 'id' });

      if (error) throw error;

      toast({
        title: "Tallennettu",
        description: "Huoltoasetukset päivitetty onnistuneesti.",
      });
    } catch (error) {
      console.error('Error saving maintenance settings:', error);
      toast({
        title: "Virhe",
        description: "Asetusten tallentaminen epäonnistui.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold font-redhat text-white">Tekniset asetukset</h1>
          <p className="text-gray-400">Hallitse sivuston teknisiä asetuksia ja toiminnallisuuksia</p>
        </div>

        <Tabs defaultValue="navigation" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="navigation">Navigaatio</TabsTrigger>
            <TabsTrigger value="testimonials">Asiakasarvostelut</TabsTrigger>
            <TabsTrigger value="opening_hours">Aukioloajat</TabsTrigger>
            <TabsTrigger value="head_scripts">Head Scriptit</TabsTrigger>
            <TabsTrigger value="maintenance">Huoltotila</TabsTrigger>
            <TabsTrigger value="site_settings">Yleiset asetukset</TabsTrigger>
          </TabsList>

          <TabsContent value="navigation">
            <NavigationManager />
          </TabsContent>

          <TabsContent value="testimonials">
            <TestimonialsManager />
          </TabsContent>
          
          <TabsContent value="opening_hours">
            <OpeningHoursManager />
          </TabsContent>

          <TabsContent value="head_scripts">
            <HeadScriptManager />
          </TabsContent>

          <TabsContent value="maintenance">
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-blondify-blue" />
                  <CardTitle className="text-white">Huoltotila</CardTitle>
                </div>
                <Button 
                  onClick={saveMaintenanceSettings} 
                  disabled={saving} 
                  className="bg-blondify-blue hover:bg-blondify-blue/80"
                >
                  <Save className="mr-2 h-4 w-4" />
                  Tallenna
                </Button>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={maintenanceMode}
                    onCheckedChange={setMaintenanceMode}
                  />
                  <Label className="text-white">Aktivoi huoltotila</Label>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="maintenance-message" className="text-white">
                      Huoltoviesti
                    </Label>
                    <Textarea
                      id="maintenance-message"
                      value={maintenanceMessage}
                      onChange={(e) => setMaintenanceMessage(e.target.value)}
                      className="bg-gray-800 border-gray-600 text-white"
                      placeholder="Viesti joka näytetään käyttäjille huoltotilan aikana"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="estimated-completion" className="text-white">
                      Arvioitu palautumisaika
                    </Label>
                    <Input
                      id="estimated-completion"
                      value={estimatedCompletion}
                      onChange={(e) => setEstimatedCompletion(e.target.value)}
                      className="bg-gray-800 border-gray-600 text-white"
                      placeholder="Esim. Arvioitu palautumisaika: 2 tuntia"
                    />
                  </div>
                </div>

                <div className="bg-yellow-900/20 border border-yellow-600 rounded-lg p-4">
                  <p className="text-yellow-200 text-sm">
                    <strong>Huomio:</strong> Huoltotilan aktivointi estää kaikkien käyttäjien pääsyn sivustolle, 
                    paitsi admin-käyttäjien. Käytä tätä vain hätätilanteissa tai huoltotöiden aikana.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="site_settings">
            <GlobalSettings />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminSettings;
