
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useUnifiedPortfolio, useUpdateUnifiedPortfolioImage } from '@/hooks/useUnifiedPortfolio';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { GripVertical, Star, Edit, Eye, Settings } from 'lucide-react';
import MediaLibrary from './MediaLibrary';

const EnhancedPortfolioManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState('portfolio');
  const [editingImage, setEditingImage] = useState<string | null>(null);
  const [dragEnabled, setDragEnabled] = useState(false);

  const { data: images = [], isLoading } = useUnifiedPortfolio();
  const updateImageMutation = useUpdateUnifiedPortfolioImage();

  // Group images by source type
  const portfolioImages = images.filter(img => img.source_type === 'portfolio');
  const showcaseImages = images.filter(img => img.source_type === 'client_showcase');
  const homepageImages = images.filter(img => img.source_type === 'homepage');

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const sourceIndex = result.source.index;
    const destIndex = result.destination.index;

    // Update display order for affected images
    const currentImages = getCurrentImages();
    const reorderedImages = Array.from(currentImages);
    const [movedImage] = reorderedImages.splice(sourceIndex, 1);
    reorderedImages.splice(destIndex, 0, movedImage);

    // Update display orders
    reorderedImages.forEach((image, index) => {
      updateImageMutation.mutate({
        id: image.id,
        display_order: index
      });
    });
  };

  const getCurrentImages = () => {
    switch (activeTab) {
      case 'portfolio': return portfolioImages.sort((a, b) => a.display_order - b.display_order);
      case 'showcase': return showcaseImages.sort((a, b) => a.display_order - b.display_order);
      case 'homepage': return homepageImages.sort((a, b) => a.display_order - b.display_order);
      default: return [];
    }
  };

  const toggleFeatured = (imageId: string, currentFeatured: boolean) => {
    updateImageMutation.mutate({
      id: imageId,
      is_featured: !currentFeatured
    });
  };

  const updateImageDetails = (imageId: string, data: any) => {
    updateImageMutation.mutate({
      id: imageId,
      ...data
    });
    setEditingImage(null);
  };

  const currentImages = getCurrentImages();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Portfolio-hallinta</h2>
          <p className="text-gray-400">Hallitse kaikkia portfolio-kuvia ja niiden järjestystä</p>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant={dragEnabled ? "default" : "outline"}
            onClick={() => setDragEnabled(!dragEnabled)}
            className="border-gray-600 text-white hover:bg-gray-800"
          >
            <GripVertical className="w-4 h-4 mr-2" />
            {dragEnabled ? 'Lopeta järjestely' : 'Järjestele kuvia'}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-gray-800">
          <TabsTrigger value="portfolio" className="data-[state=active]:bg-blondify-blue">
            Portfolio ({portfolioImages.length})
          </TabsTrigger>
          <TabsTrigger value="showcase" className="data-[state=active]:bg-blondify-blue">
            Client Showcase ({showcaseImages.length})
          </TabsTrigger>
          <TabsTrigger value="homepage" className="data-[state=active]:bg-blondify-blue">
            Homepage ({homepageImages.length})
          </TabsTrigger>
          <TabsTrigger value="library" className="data-[state=active]:bg-blondify-blue">
            Media Library
          </TabsTrigger>
        </TabsList>

        <TabsContent value="library">
          <MediaLibrary />
        </TabsContent>

        {['portfolio', 'showcase', 'homepage'].map(tabValue => (
          <TabsContent key={tabValue} value={tabValue}>
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center justify-between">
                  <span>
                    {tabValue === 'portfolio' && 'Portfolio-kuvat'}
                    {tabValue === 'showcase' && 'Client Showcase -kuvat'}
                    {tabValue === 'homepage' && 'Etusivun kuvat'}
                  </span>
                  <Badge variant="outline" className="bg-gray-700 border-gray-600 text-gray-300">
                    {currentImages.length} kuvaa
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {currentImages.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Ei kuvia tässä kategoriassa.</p>
                    <p className="text-sm mt-2">Lisää kuvia Media Library -välilehdeltä.</p>
                  </div>
                ) : dragEnabled ? (
                  <DragDropContext onDragEnd={handleDragEnd}>
                    <Droppable droppableId="images">
                      {(provided) => (
                        <div
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                        >
                          {currentImages.map((image, index) => (
                            <Draggable key={image.id} draggableId={image.id} index={index}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  className={`bg-gray-800 rounded-lg overflow-hidden ${
                                    snapshot.isDragging ? 'shadow-2xl transform rotate-3' : ''
                                  }`}
                                >
                                  <div
                                    {...provided.dragHandleProps}
                                    className="bg-gray-700 p-2 cursor-grab active:cursor-grabbing"
                                  >
                                    <GripVertical className="h-5 w-5 text-gray-400 mx-auto" />
                                  </div>
                                  <div className="aspect-square relative">
                                    <img
                                      src={image.image_url}
                                      alt={image.alt_text || 'Portfolio kuva'}
                                      className="w-full h-full object-cover"
                                    />
                                    {image.is_featured && (
                                      <Star className="absolute top-2 right-2 h-5 w-5 text-yellow-500 fill-current" />
                                    )}
                                  </div>
                                  <div className="p-3">
                                    <p className="text-white text-sm font-medium truncate">
                                      {image.alt_text || 'Nimetön kuva'}
                                    </p>
                                    <p className="text-gray-400 text-xs">
                                      Järjestys: {image.display_order + 1}
                                    </p>
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
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {currentImages.map((image) => (
                      <div key={image.id} className="relative group bg-gray-800 rounded-lg overflow-hidden">
                        <div className="aspect-square">
                          <img
                            src={image.image_url}
                            alt={image.alt_text || 'Portfolio kuva'}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                          <Button
                            size="sm"
                            variant={image.is_featured ? "default" : "secondary"}
                            onClick={() => toggleFeatured(image.id, image.is_featured)}
                            className={image.is_featured ? "bg-yellow-600 hover:bg-yellow-700" : ""}
                          >
                            <Star className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => setEditingImage(image.id)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="p-3">
                          <p className="text-white text-sm font-medium truncate">
                            {image.alt_text || 'Nimetön kuva'}
                          </p>
                          <div className="flex items-center justify-between mt-1">
                            <p className="text-gray-400 text-xs">
                              {image.category || 'Ei kategoriaa'}
                            </p>
                            {image.is_featured && (
                              <Badge variant="outline" className="bg-yellow-500/10 border-yellow-500/30 text-yellow-300 text-xs">
                                Featured
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Edit Image Dialog */}
      {editingImage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="bg-gray-900 border-gray-700 w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-white">Muokkaa kuvab</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {(() => {
                const image = images.find(img => img.id === editingImage);
                if (!image) return null;
                
                return (
                  <>
                    <div>
                      <Label className="text-white">Alt-teksti</Label>
                      <Input
                        defaultValue={image.alt_text || ''}
                        className="bg-gray-800 border-gray-600 text-white"
                        id="alt-text"
                      />
                    </div>
                    <div>
                      <Label className="text-white">Kategoria</Label>
                      <Input
                        defaultValue={image.category || ''}
                        className="bg-gray-800 border-gray-600 text-white"
                        id="category"
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setEditingImage(null)}
                        className="border-gray-600 text-white hover:bg-gray-800"
                      >
                        Peruuta
                      </Button>
                      <Button
                        onClick={() => {
                          const altText = (document.getElementById('alt-text') as HTMLInputElement)?.value;
                          const category = (document.getElementById('category') as HTMLInputElement)?.value;
                          updateImageDetails(editingImage, {
                            alt_text: altText,
                            category: category || null
                          });
                        }}
                        className="bg-blondify-blue hover:bg-blondify-blue/90"
                      >
                        Tallenna
                      </Button>
                    </div>
                  </>
                );
              })()}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default EnhancedPortfolioManager;
