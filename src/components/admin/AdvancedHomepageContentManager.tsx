import React, { useState } from 'react';
import { useHomepageContent, useUpdateHomepageSection, useToggleSectionActive, useUpdateSectionOrder } from '@/hooks/useHomepageContent';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Save, Edit, Eye, EyeOff, GripVertical, Palette, Image, Link as LinkIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const AdvancedHomepageContentManager: React.FC = () => {
  const { data: sections, isLoading } = useHomepageContent();
  const updateSection = useUpdateHomepageSection();
  const toggleActive = useToggleSectionActive();
  const updateOrder = useUpdateSectionOrder();
  
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [editData, setEditData] = useState<any>({});
  const [saving, setSaving] = useState<string | null>(null);

  const handleEditStart = (section: any) => {
    setEditingSection(section.id);
    setEditData({
      content: section.content,
      image_url: section.image_url || '',
      background_url: section.background_url || '',
      link_url: section.link_url || '',
      button_text: section.button_text || '',
      color_scheme: section.color_scheme || {},
      layout_settings: section.layout_settings || {}
    });
  };

  const handleSave = async (sectionId: string) => {
    setSaving(sectionId);
    try {
      await updateSection.mutateAsync({
        id: sectionId,
        updates: editData
      });
      setEditingSection(null);
    } finally {
      setSaving(null);
    }
  };

  const handleToggleActive = (section: any) => {
    toggleActive.mutate({
      id: section.id,
      is_active: !section.is_active
    });
  };

  const updateContentField = (field: string, value: any) => {
    setEditData((prev: any) => ({
      ...prev,
      content: {
        ...prev.content,
        [field]: value
      }
    }));
  };

  const updateDirectField = (field: string, value: any) => {
    setEditData((prev: any) => ({
      ...prev,
      [field]: value
    }));
  };

  const renderSectionEditor = (section: any) => {
    const isEditing = editingSection === section.id;
    const content = isEditing ? editData.content : section.content;

    if (!isEditing) {
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <GripVertical className="h-5 w-5 text-gray-400 cursor-move" />
              <div>
                <h3 className="font-semibold text-lg capitalize text-white">
                  {section.section_name.replace(/_/g, ' ')}
                </h3>
                <Badge variant={section.is_active ? "default" : "secondary"}>
                  {section.is_active ? 'Aktiivinen' : 'Piilotettu'}
                </Badge>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={section.is_active}
                onCheckedChange={() => handleToggleActive(section)}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleEditStart(section)}
                className="border-blondify-blue text-blondify-blue hover:bg-blondify-blue hover:text-white"
              >
                <Edit className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300">
            {content?.title && (
              <div>
                <strong className="text-blondify-blue">Otsikko:</strong>
                <p className="truncate">{content.title}</p>
              </div>
            )}
            {content?.subtitle && (
              <div>
                <strong className="text-blondify-blue">Alaotsikko:</strong>
                <p className="truncate">{content.subtitle}</p>
              </div>
            )}
            {content?.description && (
              <div>
                <strong className="text-blondify-blue">Kuvaus:</strong>
                <p className="truncate">{content.description}</p>
              </div>
            )}
            {(content?.button_text || content?.primary_button_text) && (
              <div>
                <strong className="text-blondify-blue">Painike:</strong>
                <p className="truncate">{content.button_text || content.primary_button_text}</p>
              </div>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg capitalize text-white">
            Muokkaa: {section.section_name.replace(/_/g, ' ')}
          </h3>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditingSection(null)}
            >
              Peruuta
            </Button>
            <Button
              size="sm"
              onClick={() => handleSave(section.id)}
              disabled={saving === section.id}
              className="bg-blondify-blue hover:bg-blondify-blue/80"
            >
              {saving === section.id ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        <Tabs defaultValue="content" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="content">Sisältö</TabsTrigger>
            <TabsTrigger value="media">Media</TabsTrigger>
            <TabsTrigger value="styling">Tyyli</TabsTrigger>
            <TabsTrigger value="advanced">Lisäasetukset</TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="space-y-4">
            {renderContentFields(section, content, updateContentField)}
          </TabsContent>

          <TabsContent value="media" className="space-y-4">
            <div>
              <Label htmlFor="image_url" className="flex items-center gap-2">
                <Image className="h-4 w-4" />
                Kuvan URL
              </Label>
              <Input
                id="image_url"
                value={editData.image_url || ''}
                onChange={(e) => updateDirectField('image_url', e.target.value)}
                placeholder="https://example.com/image.jpg"
              />
            </div>
            <div>
              <Label htmlFor="background_url" className="flex items-center gap-2">
                <Palette className="h-4 w-4" />
                Taustakuvan URL
              </Label>
              <Input
                id="background_url"
                value={editData.background_url || ''}
                onChange={(e) => updateDirectField('background_url', e.target.value)}
                placeholder="https://example.com/background.jpg"
              />
            </div>
          </TabsContent>

          <TabsContent value="styling" className="space-y-4">
            <div>
              <Label>Värimaailma</Label>
              <Textarea
                value={JSON.stringify(editData.color_scheme || {}, null, 2)}
                onChange={(e) => {
                  try {
                    updateDirectField('color_scheme', JSON.parse(e.target.value));
                  } catch (err) {
                    // Invalid JSON, don't update
                  }
                }}
                placeholder='{"primary": "#4F46E5", "secondary": "#10B981"}'
                rows={3}
              />
            </div>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-4">
            <div>
              <Label htmlFor="link_url" className="flex items-center gap-2">
                <LinkIcon className="h-4 w-4" />
                Linkin URL
              </Label>
              <Input
                id="link_url"
                value={editData.link_url || ''}
                onChange={(e) => updateDirectField('link_url', e.target.value)}
                placeholder="/sivu"
              />
            </div>
            <div>
              <Label>Asettelun asetukset</Label>
              <Textarea
                value={JSON.stringify(editData.layout_settings || {}, null, 2)}
                onChange={(e) => {
                  try {
                    updateDirectField('layout_settings', JSON.parse(e.target.value));
                  } catch (err) {
                    // Invalid JSON, don't update
                  }
                }}
                placeholder='{"spacing": "large", "alignment": "center"}'
                rows={3}
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    );
  };

  const renderContentFields = (section: any, content: any, updateContentField: any) => {
    const sectionName = section.section_name;

    // Common fields for most sections
    const commonFields = (
      <>
        {(content?.title !== undefined || sectionName === 'hero' || sectionName === 'featured_services') && (
          <div>
            <Label htmlFor="title">Otsikko</Label>
            <Input
              id="title"
              value={content?.title || ''}
              onChange={(e) => updateContentField('title', e.target.value)}
            />
          </div>
        )}
        
        {(content?.subtitle !== undefined || sectionName === 'featured_services') && (
          <div>
            <Label htmlFor="subtitle">Alaotsikko</Label>
            <Textarea
              id="subtitle"
              value={content?.subtitle || ''}
              onChange={(e) => updateContentField('subtitle', e.target.value)}
              rows={2}
            />
          </div>
        )}

        {(content?.description !== undefined || sectionName === 'consultation_banner') && (
          <div>
            <Label htmlFor="description">Kuvaus</Label>
            <Textarea
              id="description"
              value={content?.description || ''}
              onChange={(e) => updateContentField('description', e.target.value)}
              rows={3}
            />
          </div>
        )}
      </>
    );

    // Section-specific fields
    if (sectionName === 'hero') {
      return (
        <>
          {commonFields}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="primary_button_text">Ensisijainen painike</Label>
              <Input
                id="primary_button_text"
                value={content?.primary_button_text || ''}
                onChange={(e) => updateContentField('primary_button_text', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="primary_button_url">Ensisijainen painikkeen URL</Label>
              <Input
                id="primary_button_url"
                value={content?.primary_button_url || ''}
                onChange={(e) => updateContentField('primary_button_url', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="secondary_button_text">Toissijainen painike</Label>
              <Input
                id="secondary_button_text"
                value={content?.secondary_button_text || ''}
                onChange={(e) => updateContentField('secondary_button_text', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="secondary_button_url">Toissijainen painikkeen URL</Label>
              <Input
                id="secondary_button_url"
                value={content?.secondary_button_url || ''}
                onChange={(e) => updateContentField('secondary_button_url', e.target.value)}
              />
            </div>
          </div>
        </>
      );
    }

    if (sectionName === 'stats_bar') {
      return (
        <div>
          <Label>Tilastot (JSON-muoto)</Label>
          <Textarea
            value={JSON.stringify(content?.stats || [], null, 2)}
            onChange={(e) => {
              try {
                updateContentField('stats', JSON.parse(e.target.value));
              } catch (err) {
                // Invalid JSON, don't update
              }
            }}
            rows={10}
            placeholder='[{"label": "Asiakasta", "value": "1000+", "icon": "users"}]'
          />
        </div>
      );
    }

    // Default fields for other sections
    return (
      <>
        {commonFields}
        {(content?.button_text !== undefined) && (
          <div>
            <Label htmlFor="button_text">Painikkeen teksti</Label>
            <Input
              id="button_text"
              value={content?.button_text || ''}
              onChange={(e) => updateContentField('button_text', e.target.value)}
            />
          </div>
        )}
        {(content?.button_url !== undefined) && (
          <div>
            <Label htmlFor="button_url">Painikkeen URL</Label>
            <Input
              id="button_url"
              value={content?.button_url || ''}
              onChange={(e) => updateContentField('button_url', e.target.value)}
            />
          </div>
        )}
      </>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin h-8 w-8 text-blondify-blue" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Etusivun sisällönhallinta</h2>
          <p className="text-gray-400">Muokkaa kaikkia etusivun osioita</p>
        </div>
        <Badge variant="outline" className="text-blondify-blue border-blondify-blue">
          {sections?.filter(s => s.is_active).length || 0} aktiivista osiota
        </Badge>
      </div>

      <div className="space-y-4">
        {sections?.map((section) => (
          <Card key={section.id} className="bg-gray-900 border-gray-700">
            <CardContent className="p-6">
              {renderSectionEditor(section)}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdvancedHomepageContentManager;
