
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUpdateHomepageSection } from '@/hooks/useHomepageContent';
import { useToast } from '@/hooks/use-toast';
import { Megaphone, Eye, EyeOff } from 'lucide-react';

interface CampaignBannerManagerProps {
  content?: any;
}

const CampaignBannerManager: React.FC<CampaignBannerManagerProps> = ({ content }) => {
  const { toast } = useToast();
  const updateSection = useUpdateHomepageSection();

  // Get current banner data
  const bannerData = content?.content || {};
  const colorScheme = content?.color_scheme || {};
  const layoutSettings = content?.layout_settings || {};

  const [formData, setFormData] = useState({
    text: bannerData.text || '',
    link_url: bannerData.link_url || '',
    link_text: bannerData.link_text || 'Lue lisää',
    target_blank: bannerData.target_blank || false,
    background_color: colorScheme.background_color || '#3B82F6',
    text_color: colorScheme.text_color || '#FFFFFF',
    link_color: colorScheme.link_color || '#FFFFFF',
    closeable: layoutSettings.closeable !== false,
    is_active: content?.is_active || false
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    try {
      const updates = {
        content: {
          text: formData.text,
          link_url: formData.link_url,
          link_text: formData.link_text,
          target_blank: formData.target_blank
        },
        color_scheme: {
          background_color: formData.background_color,
          text_color: formData.text_color,
          link_color: formData.link_color
        },
        layout_settings: {
          closeable: formData.closeable,
          sticky: true
        },
        is_active: formData.is_active
      };

      await updateSection.mutateAsync({
        id: content?.id,
        updates
      });

      toast({
        title: "Kampanjabanneri tallennettu",
        description: "Bannerin asetukset on päivitetty onnistuneesti."
      });
    } catch (error) {
      toast({
        title: "Virhe",
        description: "Bannerin tallentaminen epäonnistui.",
        variant: "destructive"
      });
    }
  };

  const presetColors = [
    { name: 'Blondify Blue', bg: '#3B82F6', text: '#FFFFFF' },
    { name: 'Success Green', bg: '#10B981', text: '#FFFFFF' },
    { name: 'Warning Orange', bg: '#F59E0B', text: '#FFFFFF' },
    { name: 'Error Red', bg: '#EF4444', text: '#FFFFFF' },
    { name: 'Purple', bg: '#8B5CF6', text: '#FFFFFF' },
    { name: 'Pink', bg: '#EC4899', text: '#FFFFFF' }
  ];

  return (
    <Card className="bg-gray-900 border-gray-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-blondify-blue" />
            <CardTitle className="text-white">Kampanjabanneri</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            {formData.is_active ? (
              <Eye className="w-4 h-4 text-green-400" />
            ) : (
              <EyeOff className="w-4 h-4 text-gray-400" />
            )}
            <Switch
              checked={formData.is_active}
              onCheckedChange={(checked) => handleInputChange('is_active', checked)}
            />
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Banner Text */}
        <div className="space-y-2">
          <Label htmlFor="banner-text" className="text-white">Bannerin teksti</Label>
          <Textarea
            id="banner-text"
            placeholder="Syötä kampanjabannerin teksti..."
            value={formData.text}
            onChange={(e) => handleInputChange('text', e.target.value)}
            className="bg-gray-800 border-gray-600 text-white"
            rows={2}
          />
        </div>

        {/* Link Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="link-url" className="text-white">Linkin URL</Label>
            <Input
              id="link-url"
              placeholder="/varaa-aika"
              value={formData.link_url}
              onChange={(e) => handleInputChange('link_url', e.target.value)}
              className="bg-gray-800 border-gray-600 text-white"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="link-text" className="text-white">Linkin teksti</Label>
            <Input
              id="link-text"
              placeholder="Lue lisää"
              value={formData.link_text}
              onChange={(e) => handleInputChange('link_text', e.target.value)}
              className="bg-gray-800 border-gray-600 text-white"
            />
          </div>
        </div>

        {/* Link Options */}
        <div className="flex items-center space-x-2">
          <Switch
            id="target-blank"
            checked={formData.target_blank}
            onCheckedChange={(checked) => handleInputChange('target_blank', checked)}
          />
          <Label htmlFor="target-blank" className="text-white">Avaa linkki uudessa välilehdessä</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="closeable"
            checked={formData.closeable}
            onCheckedChange={(checked) => handleInputChange('closeable', checked)}
          />
          <Label htmlFor="closeable" className="text-white">Käyttäjä voi sulkea bannerin</Label>
        </div>

        {/* Color Presets */}
        <div className="space-y-2">
          <Label className="text-white">Värimallipohja</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {presetColors.map((preset) => (
              <button
                key={preset.name}
                onClick={() => {
                  handleInputChange('background_color', preset.bg);
                  handleInputChange('text_color', preset.text);
                  handleInputChange('link_color', preset.text);
                }}
                className="flex items-center gap-2 p-2 rounded border border-gray-600 hover:border-gray-500 transition-colors"
                style={{ backgroundColor: preset.bg, color: preset.text }}
              >
                <div 
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: preset.bg }}
                />
                <span className="text-xs">{preset.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Custom Colors */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="bg-color" className="text-white">Taustaväri</Label>
            <div className="flex gap-2">
              <Input
                id="bg-color"
                type="color"
                value={formData.background_color}
                onChange={(e) => handleInputChange('background_color', e.target.value)}
                className="w-12 h-10 p-1 bg-gray-800 border-gray-600"
              />
              <Input
                value={formData.background_color}
                onChange={(e) => handleInputChange('background_color', e.target.value)}
                className="flex-1 bg-gray-800 border-gray-600 text-white"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="text-color" className="text-white">Tekstin väri</Label>
            <div className="flex gap-2">
              <Input
                id="text-color"
                type="color"
                value={formData.text_color}
                onChange={(e) => handleInputChange('text_color', e.target.value)}
                className="w-12 h-10 p-1 bg-gray-800 border-gray-600"
              />
              <Input
                value={formData.text_color}
                onChange={(e) => handleInputChange('text_color', e.target.value)}
                className="flex-1 bg-gray-800 border-gray-600 text-white"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="link-color" className="text-white">Linkin väri</Label>
            <div className="flex gap-2">
              <Input
                id="link-color"
                type="color"
                value={formData.link_color}
                onChange={(e) => handleInputChange('link_color', e.target.value)}
                className="w-12 h-10 p-1 bg-gray-800 border-gray-600"
              />
              <Input
                value={formData.link_color}
                onChange={(e) => handleInputChange('link_color', e.target.value)}
                className="flex-1 bg-gray-800 border-gray-600 text-white"
              />
            </div>
          </div>
        </div>

        {/* Preview */}
        {formData.text && (
          <div className="space-y-2">
            <Label className="text-white">Esikatselu</Label>
            <div 
              className="p-3 rounded border text-center"
              style={{ 
                backgroundColor: formData.background_color,
                color: formData.text_color 
              }}
            >
              <span className="text-sm">
                {formData.text}
                {formData.link_url && (
                  <span className="ml-2">
                    <span 
                      className="underline font-semibold"
                      style={{ color: formData.link_color }}
                    >
                      {formData.link_text}
                    </span>
                  </span>
                )}
              </span>
            </div>
          </div>
        )}

        {/* Save Button */}
        <Button
          onClick={handleSave}
          disabled={updateSection.isPending}
          className="w-full bg-blondify-blue hover:bg-blondify-blue/80"
        >
          {updateSection.isPending ? 'Tallennetaan...' : 'Tallenna banneri'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default CampaignBannerManager;
