
import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, X, Star, GripVertical, Image as ImageIcon } from 'lucide-react';
import { useArticleImages, ArticleImage } from '@/hooks/useArticleImages';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import OptimizedImage from '@/components/OptimizedImage';

interface ArticleImageManagerProps {
  articleId: string;
  onPrimaryImageChange?: (imageUrl: string) => void;
}

const ArticleImageManager: React.FC<ArticleImageManagerProps> = ({
  articleId,
  onPrimaryImageChange
}) => {
  const { images, addImage, updateImage, deleteImage, reorderImages, isAddingImage } = useArticleImages(articleId);
  const { toast } = useToast();
  const [draggedItem, setDraggedItem] = useState<number | null>(null);

  const uploadImage = async (file: File): Promise<string> => {
    console.log('🖼️ Starting article image upload:', file.name);
    
    // Validate file
    if (file.size > 5 * 1024 * 1024) {
      throw new Error('Kuva on liian suuri. Maksimikoko on 5MB.');
    }

    if (!file.type.startsWith('image/')) {
      throw new Error('Valitse kelvollinen kuvatiedosto.');
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    const filePath = `article_images/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('media')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      throw new Error(`Kuvan lataus epäonnistui: ${uploadError.message}`);
    }

    const { data } = supabase.storage
      .from('media')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const handleFileUpload = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    try {
      const imageUrl = await uploadImage(file);
      await addImage({ 
        imageUrl, 
        altText: file.name,
        isPrimary: images.length === 0 
      });
      
      if (images.length === 0 && onPrimaryImageChange) {
        onPrimaryImageChange(imageUrl);
      }
    } catch (error) {
      toast({
        title: 'Virhe',
        description: error instanceof Error ? error.message : 'Kuvan lataus epäonnistui',
        variant: 'destructive'
      });
    }
  }, [addImage, images.length, onPrimaryImageChange, toast]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    handleFileUpload(e.dataTransfer.files);
  }, [handleFileUpload]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const setPrimaryImage = async (image: ArticleImage) => {
    try {
      // Remove primary status from all images
      const updatePromises = images.map(img => 
        updateImage({ 
          imageId: img.id, 
          updates: { is_primary: img.id === image.id } 
        })
      );
      
      await Promise.all(updatePromises);
      
      if (onPrimaryImageChange) {
        onPrimaryImageChange(image.image_url);
      }
      
      toast({
        title: 'Pääkuva asetettu',
        description: 'Kuva asetettu artikkelin pääkuvaksi.',
      });
    } catch (error) {
      toast({
        title: 'Virhe',
        description: 'Pääkuvan asettaminen epäonnistui',
        variant: 'destructive'
      });
    }
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedItem(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  const handleDragOverItem = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedItem === null || draggedItem === index) return;

    const newImages = [...images];
    const draggedImage = newImages[draggedItem];
    newImages.splice(draggedItem, 1);
    newImages.splice(index, 0, draggedImage);

    reorderImages(newImages);
    setDraggedItem(index);
  };

  const primaryImage = images.find(img => img.is_primary);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-base font-medium text-gray-300">
          Artikkelin kuvat ({images.length})
        </Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => document.getElementById('article-images-input')?.click()}
          disabled={isAddingImage}
        >
          <Upload className="h-4 w-4 mr-2" />
          {isAddingImage ? 'Ladataan...' : 'Lisää kuva'}
        </Button>
      </div>

      {/* File input */}
      <Input
        id="article-images-input"
        type="file"
        accept="image/*"
        onChange={(e) => handleFileUpload(e.target.files)}
        className="hidden"
      />

      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center hover:border-gray-500 transition-colors"
      >
        <ImageIcon className="h-8 w-8 mx-auto mb-2 text-gray-400" />
        <p className="text-gray-400 mb-2">Raahaa ja pudota kuvia tähän tai</p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => document.getElementById('article-images-input')?.click()}
        >
          Valitse tiedostoja
        </Button>
      </div>

      {/* Images grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-4">
          {images.map((image, index) => (
            <Card
              key={image.id}
              className={`relative bg-gray-800 border-gray-700 ${
                image.is_primary ? 'ring-2 ring-blondify-blue' : ''
              }`}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragEnd={handleDragEnd}
              onDragOver={(e) => handleDragOverItem(e, index)}
            >
              <CardContent className="p-3">
                <div className="relative aspect-[3/4] mb-3">
                  <OptimizedImage
                    src={image.image_url}
                    alt={image.alt_text || 'Artikkelin kuva'}
                    className="w-full h-full object-cover rounded"
                    width={300}
                    height={400}
                  />
                  
                  {/* Primary badge */}
                  {image.is_primary && (
                    <div className="absolute top-2 left-2 bg-blondify-blue text-white px-2 py-1 rounded text-xs font-medium">
                      <Star className="h-3 w-3 mr-1 inline" />
                      Pääkuva
                    </div>
                  )}
                  
                  {/* Delete button */}
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-6 w-6"
                    onClick={() => deleteImage(image.id)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                  
                  {/* Drag handle */}
                  <div className="absolute bottom-2 left-2 cursor-move">
                    <GripVertical className="h-4 w-4 text-white bg-black/50 rounded" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Input
                    value={image.alt_text || ''}
                    onChange={(e) => updateImage({ 
                      imageId: image.id, 
                      updates: { alt_text: e.target.value } 
                    })}
                    placeholder="Alt-teksti"
                    className="bg-gray-700 border-gray-600 text-white text-xs"
                  />
                  
                  {!image.is_primary && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="w-full text-xs"
                      onClick={() => setPrimaryImage(image)}
                    >
                      <Star className="h-3 w-3 mr-1" />
                      Aseta pääkuvaksi
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="text-xs text-gray-400">
        <p>• Ensimmäinen kuva asetetaan automaattisesti pääkuvaksi</p>
        <p>• Pääkuva näkyy artikkelin hero-osiossa</p>
        <p>• Raahaa kuvia järjestyksen muuttamiseksi</p>
        <p>• Suositus: pystysuuntaiset kuvat (3:4 suhde), alle 5MB</p>
      </div>
    </div>
  );
};

export default ArticleImageManager;
