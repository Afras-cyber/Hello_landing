
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useSpecialistPortfolio } from '@/hooks/useSpecialistPortfolio';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, Edit2, Upload } from 'lucide-react';

interface SpecialistPortfolioManagerProps {
  specialistId: string;
}

const SpecialistPortfolioManager: React.FC<SpecialistPortfolioManagerProps> = ({
  specialistId
}) => {
  const { portfolioImages, addImage, deleteImage, updateImage, isLoading } = useSpecialistPortfolio(specialistId);
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingImage, setEditingImage] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false);

  const [newImage, setNewImage] = useState({
    alt_text: '',
    description: '',
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'Virhe',
        description: 'Kuva on liian suuri. Maksimikoko on 5MB.',
        variant: 'destructive'
      });
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Virhe',
        description: 'Valitse kelvollinen kuvatiedosto.',
        variant: 'destructive'
      });
      return;
    }

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `specialist_portfolio/${fileName}`;

      // Käytä olemassa olevaa buckettia tai luoda uusi
      const { error: uploadError, data } = await supabase.storage
        .from('media')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.log('Upload error:', uploadError);
        // Jos bucket ei ole olemassa, yritä luoda se
        if (uploadError.message.includes('Bucket not found')) {
          toast({
            title: 'Virhe',
            description: 'Tiedostojen tallennusalue ei ole vielä määritetty. Ota yhteyttä ylläpitoon.',
            variant: 'destructive'
          });
          return;
        }
        throw uploadError;
      }

      const { data: urlData } = supabase.storage
        .from('media')
        .getPublicUrl(filePath);

      console.log('Adding image with URL:', urlData.publicUrl);

      addImage({
        image_url: urlData.publicUrl,
        alt_text: newImage.alt_text,
        description: newImage.description,
      });

      setNewImage({ alt_text: '', description: '' });
      setIsAddDialogOpen(false);

    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: 'Virhe',
        description: 'Kuvan lataus epäonnistui.',
        variant: 'destructive'
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleEditImage = (image: any) => {
    setEditingImage({ ...image });
  };

  const handleUpdateImage = () => {
    if (!editingImage) return;
    
    updateImage({
      imageId: editingImage.id,
      updates: {
        alt_text: editingImage.alt_text,
        description: editingImage.description,
      }
    });
    setEditingImage(null);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blondify-blue"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-white">Portfolio Kuvat</h3>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blondify-blue hover:bg-blue-600">
              <Plus className="h-4 w-4 mr-2" />
              Lisää kuva
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gray-800 border-gray-700">
            <DialogHeader>
              <DialogTitle className="text-white">Lisää portfolio kuva</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="image-upload" className="text-gray-300">Kuva</Label>
                <Input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
              <div>
                <Label htmlFor="alt-text" className="text-gray-300">Alt-teksti</Label>
                <Input
                  id="alt-text"
                  value={newImage.alt_text}
                  onChange={(e) => setNewImage(prev => ({ ...prev, alt_text: e.target.value }))}
                  placeholder="Kuvan kuvaus..."
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
              <div>
                <Label htmlFor="description" className="text-gray-300">Kuvaus</Label>
                <Textarea
                  id="description"
                  value={newImage.description}
                  onChange={(e) => setNewImage(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Portfolio työn kuvaus..."
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
              {isUploading && (
                <div className="flex items-center justify-center">
                  <Upload className="h-4 w-4 animate-pulse mr-2" />
                  <span className="text-gray-300">Ladataan kuvaa...</span>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {portfolioImages.map((image) => (
          <Card key={image.id} className="bg-gray-800 border-gray-700">
            <CardContent className="p-4">
              <div className="aspect-square mb-3 overflow-hidden rounded-lg">
                <img
                  src={image.image_url}
                  alt={image.alt_text || 'Portfolio kuva'}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {image.description && (
                <p className="text-sm text-gray-300 mb-3 line-clamp-2">
                  {image.description}
                </p>
              )}
              
              <div className="flex justify-between items-center">
                <Badge variant="outline" className="text-xs">
                  #{image.display_order}
                </Badge>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleEditImage(image)}
                    className="text-gray-400 hover:text-white"
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => deleteImage(image.id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {portfolioImages.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400">Ei portfolio kuvia</p>
          <p className="text-sm text-gray-500 mt-2">Lisää ensimmäinen kuva yllä olevalla napilla</p>
        </div>
      )}

      {/* Edit Dialog */}
      {editingImage && (
        <Dialog open={true} onOpenChange={() => setEditingImage(null)}>
          <DialogContent className="bg-gray-800 border-gray-700">
            <DialogHeader>
              <DialogTitle className="text-white">Muokkaa kuvaa</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-alt-text" className="text-gray-300">Alt-teksti</Label>
                <Input
                  id="edit-alt-text"
                  value={editingImage.alt_text || ''}
                  onChange={(e) => setEditingImage(prev => ({ ...prev, alt_text: e.target.value }))}
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
              <div>
                <Label htmlFor="edit-description" className="text-gray-300">Kuvaus</Label>
                <Textarea
                  id="edit-description"
                  value={editingImage.description || ''}
                  onChange={(e) => setEditingImage(prev => ({ ...prev, description: e.target.value }))}
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setEditingImage(null)}
                >
                  Peruuta
                </Button>
                <Button
                  onClick={handleUpdateImage}
                  className="bg-blondify-blue hover:bg-blue-600"
                >
                  Tallenna
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default SpecialistPortfolioManager;
