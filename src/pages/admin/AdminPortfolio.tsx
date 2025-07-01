import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Plus, Trash2, Upload, Image, Star } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useUnifiedPortfolio, useAddUnifiedPortfolioImage, useDeleteUnifiedPortfolioImage, useUpdateUnifiedPortfolioImage } from '@/hooks/useUnifiedPortfolio';

interface StorageImage {
  name: string;
  id: string;
  updated_at: string;
  created_at: string;
  last_accessed_at: string;
  metadata: any;
}

const AdminPortfolio: React.FC = () => {
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [selectedSourceType, setSelectedSourceType] = useState<'portfolio' | 'client_showcase' | 'homepage'>('portfolio');
  const [altText, setAltText] = useState('');
  const [category, setCategory] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: unifiedImages = [], isLoading: unifiedLoading } = useUnifiedPortfolio();
  const addImageMutation = useAddUnifiedPortfolioImage();
  const deleteImageMutation = useDeleteUnifiedPortfolioImage();
  const updateImageMutation = useUpdateUnifiedPortfolioImage();

  // Fetch portfolio images from storage
  const { data: portfolioImages = [], isLoading } = useQuery({
    queryKey: ['portfolio-storage-images'],
    queryFn: async (): Promise<StorageImage[]> => {
      const { data, error } = await supabase.storage
        .from('portfolio')
        .list('', {
          sortBy: { column: 'created_at', order: 'desc' }
        });
      
      if (error) throw error;
      return data?.filter(file => file.name.match(/\.(jpeg|jpg|png|webp|gif)$/i)) || [];
    },
  });

  // Upload new image
  const uploadImageMutation = useMutation({
    mutationFn: async (file: File) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('portfolio')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });
      
      if (error) throw error;
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('portfolio')
        .getPublicUrl(fileName);
      
      // Add to unified portfolio
      await addImageMutation.mutateAsync({
        image_url: publicUrl,
        source_type: selectedSourceType,
        alt_text: altText || 'Portfolio kuva',
        category: category || undefined,
        display_order: 0,
        is_featured: false
      });
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolio-storage-images'] });
      setIsAddingItem(false);
      setUploadFile(null);
      setAltText('');
      setCategory('');
      toast({
        title: 'Portfolio-kuva lisätty',
        description: 'Kuva ladattiin onnistuneesti portfolioon.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Virhe',
        description: `Kuvan lataaminen epäonnistui: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  const handleUpload = () => {
    if (!uploadFile) {
      toast({
        title: 'Virhe',
        description: 'Valitse ensin kuva ladattavaksi.',
        variant: 'destructive',
      });
      return;
    }
    uploadImageMutation.mutate(uploadFile);
  };

  const handleDeleteImage = (imageId: string) => {
    if (confirm('Haluatko varmasti poistaa tämän kuvan? Toimintoa ei voi peruuttaa.')) {
      deleteImageMutation.mutate(imageId, {
        onSuccess: () => {
          toast({
            title: 'Kuva poistettu',
            description: 'Kuva on poistettu onnistuneesti.',
          });
        },
        onError: (error: any) => {
          toast({
            title: 'Virhe',
            description: `Kuvan poistaminen epäonnistui: ${error.message}`,
            variant: 'destructive',
          });
        },
      });
    }
  };

  const toggleFeatured = (imageId: string, currentFeatured: boolean) => {
    updateImageMutation.mutate({
      id: imageId,
      is_featured: !currentFeatured
    });
  };

  const getImageUrl = (fileName: string) => {
    return supabase.storage.from('portfolio').getPublicUrl(fileName).data.publicUrl;
  };

  if (isLoading || unifiedLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin h-8 w-8 text-blondify-blue" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Portfolio-hallinta</h1>
          <p className="text-gray-400">Hallitse kaikkia portfolio-kuvia (Portfolio, Client Showcase, Homepage)</p>
        </div>
        <Dialog open={isAddingItem} onOpenChange={setIsAddingItem}>
          <DialogTrigger asChild>
            <Button className="bg-blondify-blue hover:bg-blondify-blue/90 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Lisää kuva
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gray-900 border-gray-700 text-white">
            <DialogHeader>
              <DialogTitle className="text-white">Lisää uusi portfolio-kuva</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="source_type" className="text-white">Kuvan tyyppi *</Label>
                <Select value={selectedSourceType} onValueChange={(value) => setSelectedSourceType(value as any)}>
                  <SelectTrigger className="bg-gray-800 border-gray-600">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    <SelectItem value="portfolio">Portfolio</SelectItem>
                    <SelectItem value="client_showcase">Client Showcase</SelectItem>
                    <SelectItem value="homepage">Homepage</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="image_file" className="text-white">Valitse kuva *</Label>
                <Input
                  id="image_file"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>
              <div>
                <Label htmlFor="alt_text" className="text-white">Alt-teksti</Label>
                <Input
                  id="alt_text"
                  value={altText}
                  onChange={(e) => setAltText(e.target.value)}
                  placeholder="Kuvan kuvaus..."
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>
              <div>
                <Label htmlFor="category" className="text-white">Kategoria</Label>
                <Input
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="Esim. Vaalennukset, Raidoitukset..."
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => setIsAddingItem(false)}
                  className="border-gray-600 text-white hover:bg-gray-800"
                >
                  Peruuta
                </Button>
                <Button 
                  onClick={handleUpload}
                  disabled={uploadImageMutation.isPending}
                  className="bg-blondify-blue hover:bg-blondify-blue/90 text-white"
                >
                  {uploadImageMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Upload className="h-4 w-4 mr-2" />
                  )}
                  Lataa kuva
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Yhdistetty Portfolio ({unifiedImages.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {unifiedImages.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Image className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Ei portfolio-kuvia vielä lisätty.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {unifiedImages.map((image) => (
                <div key={image.id} className="relative group">
                  <div className="aspect-square overflow-hidden rounded-lg bg-gray-800">
                    <img
                      src={image.image_url}
                      alt={image.alt_text || 'Portfolio kuva'}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/placeholder.svg';
                      }}
                    />
                  </div>
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                    <Button
                      variant={image.is_featured ? "default" : "secondary"}
                      size="sm"
                      onClick={() => toggleFeatured(image.id, image.is_featured)}
                      className={image.is_featured ? "bg-yellow-600 hover:bg-yellow-700" : ""}
                    >
                      <Star className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteImage(image.id)}
                      disabled={deleteImageMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded">
                        {image.source_type}
                      </span>
                      {image.is_featured && (
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      )}
                    </div>
                    <p className="text-sm font-medium text-white truncate">
                      {image.alt_text || 'Portfolio kuva'}
                    </p>
                    {image.category && (
                      <p className="text-xs text-gray-400">{image.category}</p>
                    )}
                    <p className="text-xs text-gray-400">
                      {new Date(image.created_at).toLocaleDateString('fi-FI')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPortfolio;
