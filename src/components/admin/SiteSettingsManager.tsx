
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Save } from 'lucide-react';

interface SiteSetting {
  id: string;
  setting_key: string;
  setting_value: any;
  category: string;
  description?: string;
}

const SiteSettingsManager: React.FC = () => {
  const [settings, setSettings] = useState<SiteSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchSiteSettings();
  }, []);

  const fetchSiteSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .order('category', { ascending: true });

      if (error) throw error;
      setSettings(data || []);
    } catch (error) {
      console.error('Error fetching site settings:', error);
      toast({
        title: "Virhe",
        description: "Sivuston asetusten hakeminen epäonnistui.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = (settingKey: string, field: string, value: any) => {
    setSettings(prev => 
      prev.map(setting => {
        if (setting.setting_key === settingKey) {
          const updatedValue = { ...setting.setting_value, [field]: value };
          return { ...setting, setting_value: updatedValue };
        }
        return setting;
      })
    );
  };

  const saveSetting = async (setting: SiteSetting) => {
    try {
      setSaving(true);
      const { error } = await supabase
        .from('site_settings')
        .update({ setting_value: setting.setting_value })
        .eq('setting_key', setting.setting_key);

      if (error) throw error;

      toast({
        title: "Tallennettu",
        description: "Asetukset tallennettu onnistuneesti.",
      });
    } catch (error) {
      console.error('Error saving setting:', error);
      toast({
        title: "Virhe",
        description: "Tallentaminen epäonnistui.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const getSettingByKey = (key: string) => {
    return settings.find(s => s.setting_key === key);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin h-8 w-8 text-blondify-blue" />
      </div>
    );
  }

  const companyInfo = getSettingByKey('company_info');
  const socialMedia = getSettingByKey('social_media');
  const footerContent = getSettingByKey('footer_content');

  return (
    <div className="space-y-6">
      <Tabs defaultValue="general" className="w-full">
        <TabsList>
          <TabsTrigger value="general">Yleiset tiedot</TabsTrigger>
          <TabsTrigger value="social">Sosiaalinen media</TabsTrigger>
          <TabsTrigger value="footer">Footer</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Yrityksen tiedot</CardTitle>
              <Button 
                onClick={() => companyInfo && saveSetting(companyInfo)}
                disabled={saving}
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Tallenna
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Yrityksen nimi</Label>
                <Input
                  value={companyInfo?.setting_value?.name || ''}
                  onChange={(e) => updateSetting('company_info', 'name', e.target.value)}
                />
              </div>
              <div>
                <Label>Slogan</Label>
                <Input
                  value={companyInfo?.setting_value?.tagline || ''}
                  onChange={(e) => updateSetting('company_info', 'tagline', e.target.value)}
                />
              </div>
              <div>
                <Label>Puhelinnumero</Label>
                <Input
                  value={companyInfo?.setting_value?.phone || ''}
                  onChange={(e) => updateSetting('company_info', 'phone', e.target.value)}
                />
              </div>
              <div>
                <Label>Sähköposti</Label>
                <Input
                  value={companyInfo?.setting_value?.email || ''}
                  onChange={(e) => updateSetting('company_info', 'email', e.target.value)}
                />
              </div>
              <div>
                <Label>Osoite</Label>
                <Input
                  value={companyInfo?.setting_value?.address || ''}
                  onChange={(e) => updateSetting('company_info', 'address', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="social">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Sosiaalisen median linkit</CardTitle>
              <Button 
                onClick={() => socialMedia && saveSetting(socialMedia)}
                disabled={saving}
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Tallenna
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Instagram</Label>
                <Input
                  value={socialMedia?.setting_value?.instagram || ''}
                  onChange={(e) => updateSetting('social_media', 'instagram', e.target.value)}
                />
              </div>
              <div>
                <Label>Facebook</Label>
                <Input
                  value={socialMedia?.setting_value?.facebook || ''}
                  onChange={(e) => updateSetting('social_media', 'facebook', e.target.value)}
                />
              </div>
              <div>
                <Label>TikTok</Label>
                <Input
                  value={socialMedia?.setting_value?.tiktok || ''}
                  onChange={(e) => updateSetting('social_media', 'tiktok', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="footer">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Footer-sisältö</CardTitle>
              <Button 
                onClick={() => footerContent && saveSetting(footerContent)}
                disabled={saving}
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Tallenna
              </Button>
            </CardHeader>
            <CardContent>
              <div>
                <Label>Footer JSON</Label>
                <Textarea
                  value={JSON.stringify(footerContent?.setting_value || {}, null, 2)}
                  onChange={(e) => {
                    try {
                      const parsed = JSON.parse(e.target.value);
                      setSettings(prev => 
                        prev.map(setting => 
                          setting.setting_key === 'footer_content'
                            ? { ...setting, setting_value: parsed }
                            : setting
                        )
                      );
                    } catch (error) {
                      // Invalid JSON, don't update
                    }
                  }}
                  rows={10}
                  className="font-mono text-sm"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SiteSettingsManager;
