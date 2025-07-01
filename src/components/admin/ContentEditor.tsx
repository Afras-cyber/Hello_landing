
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useHomepageContent, useToggleSectionActive, useUpdateSectionOrder } from '@/hooks/useHomepageContent';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { GripVertical, Eye, EyeOff, Edit, Settings } from 'lucide-react';
import AdvancedHomepageContentManager from './AdvancedHomepageContentManager';
import CampaignBannerManager from './CampaignBannerManager';

const ContentEditor = () => {
  const { data: sections = [], isLoading } = useHomepageContent();
  const toggleActive = useToggleSectionActive();
  const updateOrder = useUpdateSectionOrder();
  const [editingSection, setEditingSection] = useState<string | null>(null);

  // Find the campaign banner section
  const campaignBannerSection = sections.find(s => s.section_name === 'campaign_banner');
  // Get other sections (excluding campaign banner)
  const otherSections = sections.filter(s => s.section_name !== 'campaign_banner');

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(otherSections);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    const updatedSections = items.map((item, index) => ({
      id: item.id,
      display_order: index
    }));

    updateOrder.mutate(updatedSections);
  };

  const getSectionDisplayName = (sectionName: string) => {
    const names: Record<string, string> = {
      hero: 'Hero-osio',
      stats_bar: 'Tilastopalkki',
      featured_services: 'Suositellut palvelut',
      consultation_banner: 'Konsultaatio-banneri',
      project_list: 'Projektilista',
      clients_showcase: 'Asiakasesillepano',
      shades_tester: 'Sävytestari',
      reviews_showcase: 'Arvostelut',
      articles_section: 'Artikkelit',
      brand_partners: 'Yhteistyökumppanit'
    };
    return names[sectionName] || sectionName;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blondify-blue"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Sisältöeditori</h2>
          <p className="text-gray-400">Hallitse etusivun sisältöjä ja niiden järjestystä</p>
        </div>
      </div>

      <Tabs defaultValue="sections" className="space-y-6">
        <TabsList className="bg-gray-800">
          <TabsTrigger value="sections" className="data-[state=active]:bg-blondify-blue">
            Sivun osiot
          </TabsTrigger>
          <TabsTrigger value="campaign-banner" className="data-[state=active]:bg-blondify-blue">
            Kampanjabanneri
          </TabsTrigger>
        </TabsList>

        <TabsContent value="campaign-banner">
          <CampaignBannerManager content={campaignBannerSection} />
        </TabsContent>

        <TabsContent value="sections" className="space-y-6">
          {editingSection ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-white">
                  Muokkaa: {getSectionDisplayName(editingSection)}
                </h3>
                <Button 
                  variant="outline"
                  onClick={() => setEditingSection(null)}
                  className="border-gray-600 text-gray-300 hover:bg-gray-800"
                >
                  Takaisin listaan
                </Button>
              </div>
              <AdvancedHomepageContentManager />
            </div>
          ) : (
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Sivuosioiden hallinta
                </CardTitle>
              </CardHeader>
              <CardContent>
                <DragDropContext onDragEnd={handleDragEnd}>
                  <Droppable droppableId="sections">
                    {(provided) => (
                      <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                        {otherSections.map((section, index) => (
                          <Draggable key={section.id} draggableId={section.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className={`flex items-center justify-between p-4 bg-gray-800 rounded-lg border ${
                                  snapshot.isDragging ? 'border-blondify-blue' : 'border-gray-700'
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <div {...provided.dragHandleProps} className="cursor-grab">
                                    <GripVertical className="w-4 h-4 text-gray-400" />
                                  </div>
                                  <div>
                                    <h4 className="font-medium text-white">
                                      {getSectionDisplayName(section.section_name)}
                                    </h4>
                                    <p className="text-sm text-gray-400">
                                      {section.section_name}
                                    </p>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setEditingSection(section.section_name)}
                                    className="border-gray-600 text-gray-300 hover:bg-gray-700"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => toggleActive.mutate({
                                      id: section.id,
                                      is_active: !section.is_active
                                    })}
                                    className={`border-gray-600 ${
                                      section.is_active 
                                        ? 'text-green-400 hover:bg-green-900/20' 
                                        : 'text-gray-400 hover:bg-gray-700'
                                    }`}
                                  >
                                    {section.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                  </Button>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ContentEditor;
