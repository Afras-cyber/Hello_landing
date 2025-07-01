import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { usePageSections } from '@/hooks/usePages';
import { Save, Eye, EyeOff, ArrowLeft, Type, FileText, Clock } from 'lucide-react';
import RichTextEditor from './RichTextEditor';
import './quill-theme.css';

interface PageSectionManagerProps {
  pageId: string;
  pageTitle: string;
  onBack: () => void;
}

const PageSectionManager: React.FC<PageSectionManagerProps> = ({ pageId, pageTitle, onBack }) => {
  const { sections, isLoading, updateSection, toggleSectionStatus } = usePageSections(pageId);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [editContent, setEditContent] = useState<string>('');

  const handleEditSection = (section: any) => {
    setEditingSection(section.id);
    setEditContent(section.content?.text || '');
  };

  const handleSaveSection = (sectionId: string) => {
    updateSection({
      sectionId,
      content: { text: editContent }
    });
    setEditingSection(null);
    setEditContent('');
  };

  const handleToggleSection = (sectionId: string, currentStatus: boolean) => {
    toggleSectionStatus({
      sectionId,
      isActive: !currentStatus
    });
  };

  const getSectionIcon = (contentType: string) => {
    return contentType === 'richtext' ? <FileText className="w-4 h-4" /> : <Type className="w-4 h-4" />;
  };

  const getSectionTypeLabel = (contentType: string) => {
    return contentType === 'richtext' ? 'Rikastettu teksti' : 'Yksinkertainen teksti';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fi-FI', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return <div>Ladataan...</div>;
  }

  // Sort sections by display_order and group by importance
  const sortedSections = [...sections].sort((a, b) => a.display_order - b.display_order);
  const heroSections = sortedSections.filter(s => s.section_key.includes('hero'));
  const contentSections = sortedSections.filter(s => !s.section_key.includes('hero'));

  // Get the most recent update date
  const latestUpdate = sections.length > 0 
    ? Math.max(...sections.map(s => new Date(s.updated_at).getTime()))
    : Date.now();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          onClick={onBack}
          className="border-gray-600 text-white hover:bg-gray-800"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Takaisin sivuihin
        </Button>
        <div className="flex-1">
          <h2 className="text-xl font-semibold text-white">
            {pageTitle} - Sisältöblokit
          </h2>
          <p className="text-gray-400 text-sm">
            {sections.length} tekstialuetta • Viimeksi päivitetty {formatDate(latestUpdate.toString())}
          </p>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-green-400" />
              <span className="text-sm text-gray-300">Aktiivisia</span>
            </div>
            <div className="text-2xl font-bold text-white">
              {sections.filter(s => s.is_active).length}
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-gray-300">Rikastettu teksti</span>
            </div>
            <div className="text-2xl font-bold text-white">
              {sections.filter(s => s.content_type === 'richtext').length}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Type className="w-4 h-4 text-purple-400" />
              <span className="text-sm text-gray-300">Yksinkertainen</span>
            </div>
            <div className="text-2xl font-bold text-white">
              {sections.filter(s => s.content_type === 'text').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Hero sections */}
      {heroSections.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
            Hero-alue ({heroSections.length})
          </h3>
          <div className="grid gap-4">
            {heroSections.map((section) => (
              <SectionCard
                key={section.id}
                section={section}
                editingSection={editingSection}
                editContent={editContent}
                onEdit={handleEditSection}
                onSave={handleSaveSection}
                onToggle={handleToggleSection}
                onContentChange={setEditContent}
                onCancel={() => setEditingSection(null)}
                getSectionIcon={getSectionIcon}
                getSectionTypeLabel={getSectionTypeLabel}
              />
            ))}
          </div>
        </div>
      )}

      {/* Content sections */}
      {contentSections.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
            Sisältöalueet ({contentSections.length})
          </h3>
          <div className="grid gap-4">
            {contentSections.map((section) => (
              <SectionCard
                key={section.id}
                section={section}
                editingSection={editingSection}
                editContent={editContent}
                onEdit={handleEditSection}
                onSave={handleSaveSection}
                onToggle={handleToggleSection}
                onContentChange={setEditContent}
                onCancel={() => setEditingSection(null)}
                getSectionIcon={getSectionIcon}
                getSectionTypeLabel={getSectionTypeLabel}
              />
            ))}
          </div>
        </div>
      )}
        
      {sections.length === 0 && (
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-8 text-center">
            <p className="text-gray-400">
              Tälle sivulle ei ole vielä määritetty sisältöblokkeja.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

interface SectionCardProps {
  section: any;
  editingSection: string | null;
  editContent: string;
  onEdit: (section: any) => void;
  onSave: (sectionId: string) => void;
  onToggle: (sectionId: string, currentStatus: boolean) => void;
  onContentChange: (content: string) => void;
  onCancel: () => void;
  getSectionIcon: (contentType: string) => React.ReactNode;
  getSectionTypeLabel: (contentType: string) => string;
}

const SectionCard: React.FC<SectionCardProps> = ({
  section,
  editingSection,
  editContent,
  onEdit,
  onSave,
  onToggle,
  onContentChange,
  onCancel,
  getSectionIcon,
  getSectionTypeLabel
}) => {
  return (
    <Card 
      className={`bg-gray-800 border-gray-700 transition-all ${
        section.is_active ? 'border-l-4 border-l-green-500' : 'border-l-4 border-l-red-500 opacity-75'
      }`}
    >
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-white text-lg flex items-center gap-2">
            {getSectionIcon(section.content_type)}
            {section.section_name}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-gray-700 border-gray-600 text-gray-300">
              {getSectionTypeLabel(section.content_type)}
            </Badge>
            <Switch
              checked={section.is_active}
              onCheckedChange={() => onToggle(section.id, section.is_active)}
            />
            {section.is_active ? (
              <Eye className="w-4 h-4 text-green-400" />
            ) : (
              <EyeOff className="w-4 h-4 text-gray-500" />
            )}
          </div>
        </div>
        <div className="flex items-center gap-4 text-xs text-gray-400">
          <span>Avain: {section.section_key}</span>
          <span>Järjestys: {section.display_order}</span>
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>Päivitetty {new Date(section.updated_at).toLocaleDateString('fi-FI')}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {editingSection === section.id ? (
          <div className="space-y-4">
            <div>
              <Label className="text-white mb-2 block">Sisältö</Label>
              {section.content_type === 'richtext' ? (
                <RichTextEditor
                  value={editContent}
                  onChange={onContentChange}
                />
              ) : (
                <Textarea
                  value={editContent}
                  onChange={(e) => onContentChange(e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white"
                  rows={4}
                />
              )}
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => onSave(section.id)}
                className="bg-blondify-blue hover:bg-blue-600"
              >
                <Save className="w-4 h-4 mr-2" />
                Tallenna
              </Button>
              <Button
                variant="outline"
                onClick={onCancel}
                className="border-gray-600 text-white hover:bg-gray-800"
              >
                Peruuta
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-gray-900 rounded-md text-white prose prose-sm prose-invert max-w-none">
              {section.content_type === 'richtext' ? (
                <div dangerouslySetInnerHTML={{ __html: section.content?.text || '<i>Ei sisältöä</i>' }} />
              ) : (
                <p className="whitespace-pre-wrap">{section.content?.text || 'Ei sisältöä'}</p>
              )}
            </div>
            <Button
              variant="outline"
              onClick={() => onEdit(section)}
              className="border-gray-600 text-white hover:bg-gray-800"
            >
              Muokkaa sisältöä
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PageSectionManager;
