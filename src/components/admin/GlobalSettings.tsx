
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Settings, 
  Palette, 
  Type, 
  Share2, 
  BarChart3, 
  Shield, 
  Database,
  Globe,
  Mail,
  Phone,
  MapPin,
  Clock,
  Save
} from 'lucide-react';
import { useGlobalSettings } from '@/hooks/useGlobalSettings';
import ImageUploadSetting from './ImageUploadSetting';

const GlobalSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('general');
  const { settings, isLoading, updateSetting, getSetting } = useGlobalSettings();

  const handleUpdateSetting = (key: string, value: any, category: string) => {
    updateSetting({ key, value, category });
  };

  if (isLoading) {
    return <div className="p-6 text-white">Ladataan asetuksia...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Sivuston asetukset</h2>
        <p className="text-gray-400">Hallitse sivuston yleisiä asetuksia ja ulkoasua</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-gray-800 grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-9">
          <TabsTrigger value="general" className="data-[state=active]:bg-blondify-blue">
            <Settings className="w-4 h-4 mr-2" />
            Yleiset
          </TabsTrigger>
          <TabsTrigger value="design" className="data-[state=active]:bg-blondify-blue">
            <Palette className="w-4 h-4 mr-2" />
            Ulkoasu
          </TabsTrigger>
          <TabsTrigger value="contact" className="data-[state=active]:bg-blondify-blue">
            <Phone className="w-4 h-4 mr-2" />
            Yhteystiedot
          </TabsTrigger>
          <TabsTrigger value="social" className="data-[state=active]:bg-blondify-blue">
            <Share2 className="w-4 h-4 mr-2" />
            Sosiaalinen
          </TabsTrigger>
          <TabsTrigger value="analytics" className="data-[state=active]:bg-blondify-blue">
            <BarChart3 className="w-4 h-4 mr-2" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="seo" className="data-[state=active]:bg-blondify-blue">
            <Globe className="w-4 h-4 mr-2" />
            SEO
          </TabsTrigger>
          <TabsTrigger value="security" className="data-[state=active]:bg-blondify-blue">
            <Shield className="w-4 h-4 mr-2" />
            Turvallisuus
          </TabsTrigger>
          <TabsTrigger value="backup" className="data-[state=active]:bg-blondify-blue">
            <Database className="w-4 h-4 mr-2" />
            Varmuuskopiot
          </TabsTrigger>
          <TabsTrigger value="newsletter" className="data-[state=active]:bg-blondify-blue">
            <Mail className="w-4 h-4 mr-2" />
            Uutiskirje
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general">
          <div className="grid gap-6">
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Sivuston perustiedot</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-white">Sivuston nimi</Label>
                  <Input 
                    value={getSetting('site_name', 'Blondify') || ''}
                    onChange={(e) => handleUpdateSetting('site_name', e.target.value, 'general')}
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <Label className="text-white">Sivuston kuvaus</Label>
                  <Textarea 
                    value={getSetting('site_description', 'Blondify - Vaaleita hiuksia erikoisliike Jätkäsaaressa') || ''}
                    onChange={(e) => handleUpdateSetting('site_description', e.target.value, 'general')}
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <Label className="text-white">Logo URL</Label>
                  <Input 
                    value={getSetting('logo_url', '') || ''}
                    onChange={(e) => handleUpdateSetting('logo_url', e.target.value, 'general')}
                    placeholder="https://example.com/logo.png"
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <Label className="text-white">Favicon URL</Label>
                  <Input 
                    value={getSetting('favicon_url', '') || ''}
                    onChange={(e) => handleUpdateSetting('favicon_url', e.target.value, 'general')}
                    placeholder="https://example.com/favicon.ico"
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Sivuston tila</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-white">Huoltotila</Label>
                    <p className="text-gray-400 text-sm">Aseta sivusto huoltotilaan</p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-white">Uutiskirje popup</Label>
                    <p className="text-gray-400 text-sm">Näytä uutiskirjeen tilaus popup</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-white">Cookie-banneri</Label>
                    <p className="text-gray-400 text-sm">Näytä cookie-hyväksyntä banneri</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Design Settings */}
        <TabsContent value="design">
          <div className="grid gap-6">
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Värit ja teemat</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-white">Pääväri (Blondify Blue)</Label>
                  <div className="flex items-center gap-4">
                    <Input 
                      type="color"
                      value={getSetting('primary_color', '#0099cc') || '#0099cc'}
                      onChange={(e) => handleUpdateSetting('primary_color', e.target.value, 'design')}
                      className="w-16 h-10 p-1 bg-gray-800 border-gray-600"
                    />
                    <Input 
                      value={getSetting('primary_color', '#0099cc') || '#0099cc'}
                      onChange={(e) => handleUpdateSetting('primary_color', e.target.value, 'design')}
                      className="bg-gray-800 border-gray-600 text-white"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-white">Aksenttiväri</Label>
                  <div className="flex items-center gap-4">
                    <Input 
                      type="color"
                      value={getSetting('accent_color', '#ff6b6b') || '#ff6b6b'}
                      onChange={(e) => handleUpdateSetting('accent_color', e.target.value, 'design')}
                      className="w-16 h-10 p-1 bg-gray-800 border-gray-600"
                    />
                    <Input 
                      value={getSetting('accent_color', '#ff6b6b') || '#ff6b6b'}
                      onChange={(e) => handleUpdateSetting('accent_color', e.target.value, 'design')}
                      className="bg-gray-800 border-gray-600 text-white"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-white">Taustaväri</Label>
                  <div className="flex items-center gap-4">
                    <Input 
                      type="color"
                      value={getSetting('background_color', '#000000') || '#000000'}
                      onChange={(e) => handleUpdateSetting('background_color', e.target.value, 'design')}
                      className="w-16 h-10 p-1 bg-gray-800 border-gray-600"
                    />
                    <Input 
                      value={getSetting('background_color', '#000000') || '#000000'}
                      onChange={(e) => handleUpdateSetting('background_color', e.target.value, 'design')}
                      className="bg-gray-800 border-gray-600 text-white"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Typografia</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-white">Pääfontti</Label>
                  <select className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-white">
                    <option value="inter">Inter</option>
                    <option value="red-hat-display">Red Hat Display</option>
                    <option value="arial">Arial</option>
                    <option value="helvetica">Helvetica</option>
                  </select>
                </div>
                <div>
                  <Label className="text-white">Otsikkofontti</Label>
                  <select className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-white">
                    <option value="red-hat-display">Red Hat Display</option>
                    <option value="inter">Inter</option>
                    <option value="georgia">Georgia</option>
                    <option value="times">Times</option>
                  </select>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Contact Settings */}
        <TabsContent value="contact">
          <div className="grid gap-6">
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Phone className="w-5 h-5" />
                  Yhteystiedot
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-white">Puhelin</Label>
                  <Input 
                    value={getSetting('company_phone', '+358 XX XXX XXXX') || ''}
                    onChange={(e) => handleUpdateSetting('company_phone', e.target.value, 'contact')}
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <Label className="text-white">Sähköposti</Label>
                  <Input 
                    value={getSetting('company_email', 'info@blondify.fi') || ''}
                    onChange={(e) => handleUpdateSetting('company_email', e.target.value, 'contact')}
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <Label className="text-white">Osoite</Label>
                  <Input 
                    value={getSetting('company_address', 'Jätkäsaari, Helsinki') || ''}
                    onChange={(e) => handleUpdateSetting('company_address', e.target.value, 'contact')}
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <Label className="text-white">Postinumero</Label>
                  <Input 
                    value={getSetting('company_postcode', '00000') || ''}
                    onChange={(e) => handleUpdateSetting('company_postcode', e.target.value, 'contact')}
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Aukioloajat
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {['Maanantai', 'Tiistai', 'Keskiviikko', 'Torstai', 'Perjantai', 'Lauantai', 'Sunnuntai'].map((day) => (
                  <div key={day} className="flex items-center gap-4">
                    <div className="w-24">
                      <Label className="text-white text-sm">{day}</Label>
                    </div>
                    <Input 
                      placeholder="09:00"
                      className="bg-gray-800 border-gray-600 text-white flex-1"
                    />
                    <span className="text-gray-400">-</span>
                    <Input 
                      placeholder="17:00"
                      className="bg-gray-800 border-gray-600 text-white flex-1"
                    />
                    <Switch />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Social Media Settings */}
        <TabsContent value="social">
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Share2 className="w-5 h-5" />
                Sosiaalisen median linkit
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-white">Instagram</Label>
                <Input 
                  value={getSetting('instagram_url', '') || ''}
                  onChange={(e) => handleUpdateSetting('instagram_url', e.target.value, 'social')}
                  placeholder="https://instagram.com/blondify"
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>
              <div>
                <Label className="text-white">Facebook</Label>
                <Input 
                  value={getSetting('facebook_url', '') || ''}
                  onChange={(e) => handleUpdateSetting('facebook_url', e.target.value, 'social')}
                  placeholder="https://facebook.com/blondify"
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>
              <div>
                <Label className="text-white">TikTok</Label>
                <Input 
                  value={getSetting('tiktok_url', '') || ''}
                  onChange={(e) => handleUpdateSetting('tiktok_url', e.target.value, 'social')}
                  placeholder="https://tiktok.com/@blondify"
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>
              <div>
                <Label className="text-white">YouTube</Label>
                <Input 
                  value={getSetting('youtube_url', '') || ''}
                  onChange={(e) => handleUpdateSetting('youtube_url', e.target.value, 'social')}
                  placeholder="https://youtube.com/blondify"
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>
              <div>
                <Label className="text-white">LinkedIn</Label>
                <Input 
                  value={getSetting('linkedin_url', '') || ''}
                  onChange={(e) => handleUpdateSetting('linkedin_url', e.target.value, 'social')}
                  placeholder="https://linkedin.com/company/blondify"
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Settings */}
        <TabsContent value="analytics">
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Analytics ja seuranta
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-white">Google Analytics ID</Label>
                <Input 
                  value={getSetting('google_analytics_id', '') || ''}
                  onChange={(e) => handleUpdateSetting('google_analytics_id', e.target.value, 'analytics')}
                  placeholder="GA-XXXXXXXXX-X"
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>
              <div>
                <Label className="text-white">Google Tag Manager ID</Label>
                <Input 
                  value={getSetting('google_tag_manager_id', '') || ''}
                  onChange={(e) => handleUpdateSetting('google_tag_manager_id', e.target.value, 'analytics')}
                  placeholder="GTM-XXXXXXX"
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>
              <div>
                <Label className="text-white">Facebook Pixel ID</Label>
                <Input 
                  value={getSetting('facebook_pixel_id', '') || ''}
                  onChange={(e) => handleUpdateSetting('facebook_pixel_id', e.target.value, 'analytics')}
                  placeholder="XXXXXXXXXXXXXXX"
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-white">Heatmap-seuranta</Label>
                  <p className="text-gray-400 text-sm">Kerää klikkaustietoja sivustolta</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SEO Settings */}
        <TabsContent value="seo">
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Globe className="w-5 h-5" />
                SEO-asetukset
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-white">Oletus meta-kuvaus</Label>
                <Textarea 
                  value={getSetting('meta_description', 'Kuvailuteksti sivustosta hakukoneita varten...') || ''}
                  onChange={(e) => handleUpdateSetting('meta_description', e.target.value, 'seo')}
                  placeholder="Kuvailuteksti sivustosta hakukoneita varten..."
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>
              <div>
                <Label className="text-white">Avainsanat</Label>
                <Input 
                  value={getSetting('keywords', 'hiustenleikkaus, vaalennus, helsinki, jätkäsaari') || ''}
                  onChange={(e) => handleUpdateSetting('keywords', e.target.value, 'seo')}
                  placeholder="hiustenleikkaus, vaalennus, helsinki, jätkäsaari"
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>
              <div>
                <Label className="text-white">Open Graph -kuva</Label>
                <Input 
                  value={getSetting('og_image', '') || ''}
                  onChange={(e) => handleUpdateSetting('og_image', e.target.value, 'seo')}
                  placeholder="URL kuvaan joka näkyy sosiaalisessa mediassa"
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-white">Sitemap.xml automaattinen generointi</Label>
                  <p className="text-gray-400 text-sm">Luo sivukartta hakukoneita varten</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security">
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Turvallisuusasetukset
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-white">Kaksoistodentaminen (2FA)</Label>
                  <p className="text-gray-400 text-sm">Pakollinen kaikille admin-käyttäjille</p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-white">Automaattinen uloskirjautuminen</Label>
                  <p className="text-gray-400 text-sm">Kirjaa ulos 30 min toimettomuuden jälkeen</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div>
                <Label className="text-white">Sallitut IP-osoitteet</Label>
                <Textarea 
                  value={getSetting('allowed_ips', '') || ''}
                  onChange={(e) => handleUpdateSetting('allowed_ips', e.target.value, 'security')}
                  placeholder="192.168.1.1&#10;10.0.0.1"
                  className="bg-gray-800 border-gray-600 text-white"
                />
                <p className="text-gray-400 text-sm">Yksi IP-osoite per rivi. Tyhjä = kaikki sallittu.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Backup Settings */}
        <TabsContent value="backup">
          <div className="grid gap-6">
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  Automaattiset varmuuskopiot
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-white">Päivittäiset varmuuskopiot</Label>
                    <p className="text-gray-400 text-sm">Luo varmuuskopio joka päivä klo 02:00</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div>
                  <Label className="text-white">Säilytysaika (päivää)</Label>
                  <Input 
                    type="number"
                    value={getSetting('backup_retention_days', 30) || 30}
                    onChange={(e) => handleUpdateSetting('backup_retention_days', parseInt(e.target.value), 'backup')}
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
                <div className="flex gap-2">
                  <Button className="bg-blondify-blue hover:bg-blondify-blue/90">
                    Luo varmuuskopio nyt
                  </Button>
                  <Button variant="outline" className="border-gray-600 text-white hover:bg-gray-800">
                    Lataa viimeisin
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Viimeisimmät varmuuskopiot</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-gray-800 rounded">
                      <div>
                        <p className="text-white text-sm">backup-2024-01-{15 + i}.zip</p>
                        <p className="text-gray-400 text-xs">{new Date().toLocaleDateString('fi-FI')} • 24.5 MB</p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="border-gray-600 text-white hover:bg-gray-700">
                          Lataa
                        </Button>
                        <Button size="sm" variant="outline" className="border-gray-600 text-white hover:bg-gray-700">
                          Palauta
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Newsletter Settings */}
        <TabsContent value="newsletter">
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Uutiskirjeen osio (Artikkelit-sivu)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-white">Otsikko</Label>
                <Input
                  value={getSetting('articles_newsletter_title', '') || ''}
                  onChange={(e) => handleUpdateSetting('articles_newsletter_title', e.target.value, 'Uutiskirje (Artikkelit-sivu)')}
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>
              <div>
                <Label className="text-white">Kuvaus</Label>
                <Textarea
                  value={getSetting('articles_newsletter_description', '') || ''}
                  onChange={(e) => handleUpdateSetting('articles_newsletter_description', e.target.value, 'Uutiskirje (Artikkelit-sivu)')}
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>
              <ImageUploadSetting
                label="Kuva"
                currentImageUrl={getSetting('articles_newsletter_image_url', '')}
                onUpload={(url) => handleUpdateSetting('articles_newsletter_image_url', url, 'Uutiskirje (Artikkelit-sivu)')}
                storageFolder="newsletter"
              />
              <div>
                <Label className="text-white">Painikkeen teksti</Label>
                <Input
                  value={getSetting('articles_newsletter_button_text', '') || ''}
                  onChange={(e) => handleUpdateSetting('articles_newsletter_button_text', e.target.value, 'Uutiskirje (Artikkelit-sivu)')}
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>
              <div>
                <Label className="text-white">Yksityisyysteksti</Label>
                <Textarea
                  value={getSetting('articles_newsletter_privacy_text', '') || ''}
                  onChange={(e) => handleUpdateSetting('articles_newsletter_privacy_text', e.target.value, 'Uutiskirje (Artikkelit-sivu)')}
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Save Button */}
      <div className="flex justify-center">
        <Button size="lg" className="bg-blondify-blue hover:bg-blondify-blue/90 px-8">
          Tallenna asetukset
        </Button>
      </div>
    </div>
  );
};

export default GlobalSettings;
