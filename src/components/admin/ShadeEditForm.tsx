import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { HairShade, HairShadeImage, HairShadeCategory } from '@/hooks/useHairShades';
import { Loader2, X, Upload, Plus, ChevronUp, ChevronDown, Star, CheckCircle, Clock } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

interface ShadeEditFormProps {
  shade: HairShade | null;
  onClose: () => void;
  onSuccess: () => void;
  isOpen: boolean;
}

const ShadeEditForm: React.FC<ShadeEditFormProps> = ({
  shade,
  onClose,
  onSuccess,
  isOpen
}) => {
  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState<Set<string>>(new Set());
  const [uploadedImages, setUploadedImages] = useState<Set<string>>(new Set());
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'neutral' as HairShadeCategory,
    display_order: 0,
    images: [] as HairShadeImage[]
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Load data when shade changes or dialog opens
  useEffect(() => {
    if (isOpen) {
      if (shade) {
        console.log('🎨 Loading existing shade for editing:', shade.name);
        setFormData({
          name: shade.name || '',
          description: shade.description || '',
          category: shade.category || 'neutral',
          display_order: shade.display_order || 0,
          images: shade.images || []
        });
        // Mark all existing images as uploaded
        setUploadedImages(new Set(shade.images?.map((_, index) => index.toString()) || []));
      } else {
        console.log('🆕 Creating new shade');
        setFormData({
          name: '',
          description: '',
          category: 'neutral',
          display_order: 0,
          images: []
        });
        setUploadedImages(new Set());
      }
      setUploadingImages(new Set());
    }
  }, [shade, isOpen]);

  const saveShadeToDatabase = async (updatedFormData: typeof formData) => {
    console.log('💾 Saving shade to database:', updatedFormData);
    try {
      if (shade) {
        console.log('📝 Updating existing shade with ID:', shade.id);
        const { error } = await supabase
          .from('hair_shades')
          .update({
            name: updatedFormData.name,
            description: updatedFormData.description,
            category: updatedFormData.category,
            display_order: updatedFormData.display_order,
            images: updatedFormData.images as any
          })
          .eq('id', shade.id);

        if (error) throw error;
        console.log('✅ Shade updated successfully');
      } else {
        console.log('🆕 Creating new shade');
        const { error } = await supabase
          .from('hair_shades')
          .insert({
            id: crypto.randomUUID(),
            name: updatedFormData.name,
            description: updatedFormData.description,
            category: updatedFormData.category,
            display_order: updatedFormData.display_order,
            images: updatedFormData.images as any
          });

        if (error) throw error;
        console.log('✅ New shade created successfully');
      }

      await queryClient.invalidateQueries({ queryKey: ['hairShades'] });
      onSuccess();
    } catch (error) {
      console.error('❌ Error saving shade:', error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('📤 Form submission started');
    setLoading(true);

    try {
      await saveShadeToDatabase(formData);

      toast({
        title: shade ? "Päivitetty" : "Luotu",
        description: shade ? "Sävy päivitetty onnistuneesti." : "Uusi sävy luotu onnistuneesti."
      });

      onClose();
    } catch (error) {
      console.error('❌ Error saving shade:', error);
      toast({
        title: "Virhe",
        description: "Sävyn tallentaminen epäonnistui.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImageFileUpload = async (file: File) => {
    console.log('📸 Starting image upload process');
    console.log('📄 File details:', {
      name: file.name,
      size: file.size,
      type: file.type
    });
    
    // Create a temporary URL for immediate display
    const tempUrl = URL.createObjectURL(file);
    const tempId = Date.now().toString();
    
    // Add image immediately to form with temp URL
    const newImage = { 
      url: tempUrl, 
      alt: formData.name + ' kuva',
      tempId
    };
    
    console.log('🖼️ Adding temporary image to form data:', newImage);
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, newImage]
    }));
    
    // Track upload status
    setUploadingImages(prev => new Set(prev).add(tempId));
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `shade-images/${fileName}`;

      console.log('☁️ Uploading to Supabase Storage:', filePath);

      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(filePath, file);

      if (uploadError) {
        console.error('❌ Supabase upload error:', uploadError);
        throw uploadError;
      }

      console.log('✅ File uploaded successfully to storage');

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('media')
        .getPublicUrl(filePath);

      console.log('🔗 Generated public URL:', publicUrl);

      // Replace temp URL with actual URL
      setFormData(prev => ({
        ...prev,
        images: prev.images.map(img => 
          img.tempId === tempId 
            ? { url: publicUrl, alt: img.alt }
            : img
        )
      }));

      // Mark as uploaded (no longer uploading)
      setUploadingImages(prev => {
        const newSet = new Set(prev);
        newSet.delete(tempId);
        return newSet;
      });

      // Mark as successfully uploaded
      const imageIndex = formData.images.findIndex(img => img.tempId === tempId);
      if (imageIndex !== -1) {
        setUploadedImages(prev => new Set(prev).add(imageIndex.toString()));
      }

      // Clean up temp URL
      URL.revokeObjectURL(tempUrl);

      toast({
        title: "Kuva ladattu",
        description: "Kuva ladattu onnistuneesti. Muista tallentaa lomake."
      });

      console.log('✅ Image upload process completed successfully');
    } catch (error) {
      console.error('❌ Image upload failed:', error);
      
      // Remove the failed image from form data
      setFormData(prev => ({
        ...prev,
        images: prev.images.filter(img => img.tempId !== tempId)
      }));
      
      // Clean up temp URL
      URL.revokeObjectURL(tempUrl);
      
      setUploadingImages(prev => {
        const newSet = new Set(prev);
        newSet.delete(tempId);
        return newSet;
      });
      
      toast({
        title: "Virhe",
        description: "Kuvan lataaminen epäonnistui.",
        variant: "destructive"
      });
    }
  };

  const handleImageUrlAdd = () => {
    console.log('🔗 Adding manual URL input field');
    const newImage = { url: '', alt: formData.name + ' kuva' };
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, newImage]
    }));
  };

  const handleImageUpdate = (index: number, field: keyof HairShadeImage, value: string) => {
    console.log(`📝 Updating image ${index} field ${field}:`, value);
    setFormData(prev => ({
      ...prev,
      images: prev.images.map((img, i) => 
        i === index ? { ...img, [field]: value } : img
      )
    }));
  };

  const handleImageRemove = (index: number) => {
    console.log('🗑️ Removing image at index:', index);
    const imageToRemove = formData.images[index];
    
    // Clean up temp URL if it exists
    if (imageToRemove.url.startsWith('blob:')) {
      URL.revokeObjectURL(imageToRemove.url);
    }
    
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));

    // Update uploaded images set
    setUploadedImages(prev => {
      const newSet = new Set(prev);
      newSet.delete(index.toString());
      return newSet;
    });
  };

  const moveImage = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= formData.images.length) return;

    console.log(`🔄 Moving image from index ${index} to ${newIndex}`);
    
    const newImages = [...formData.images];
    [newImages[index], newImages[newIndex]] = [newImages[newIndex], newImages[index]];
    
    setFormData(prev => ({
      ...prev,
      images: newImages
    }));
  };

  const setAsMainImage = (index: number) => {
    if (index === 0) return; // Already main image
    
    console.log(`⭐ Setting image at index ${index} as main image`);
    
    const newImages = [...formData.images];
    const imageToMove = newImages.splice(index, 1)[0];
    newImages.unshift(imageToMove);
    
    setFormData(prev => ({
      ...prev,
      images: newImages
    }));
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      console.log('📁 File selected from input:', file.name);
      handleImageFileUpload(file);
    }
  };

  const getImageStatus = (image: HairShadeImage, index: number) => {
    if (image.tempId && uploadingImages.has(image.tempId)) {
      return { type: 'uploading', icon: <Loader2 className="w-3 h-3 animate-spin" />, color: 'text-blue-400' };
    }
    if (uploadedImages.has(index.toString()) || (!image.tempId && image.url && !image.url.startsWith('blob:'))) {
      return { type: 'uploaded', icon: <CheckCircle className="w-3 h-3" />, color: 'text-green-400' };
    }
    if (image.url.startsWith('blob:')) {
      return { type: 'pending', icon: <Clock className="w-3 h-3" />, color: 'text-yellow-400' };
    }
    return null;
  };

  const mainImage = formData.images[0];
  const otherImages = formData.images.slice(1);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-black text-white border-gray-800">
        <DialogHeader>
          <DialogTitle className="text-white">
            {shade ? 'Muokkaa sävyä' : 'Lisää uusi sävy'}
          </DialogTitle>
          <DialogDescription className="text-gray-300">
            {shade ? 'Muokkaa olemassa olevaa sävyä ja sen ominaisuuksia.' : 'Luo uusi sävy järjestelmään.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label htmlFor="name" className="text-white">Nimi</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
                className="bg-gray-800 text-white border-gray-600 focus:border-blondify-blue"
              />
            </div>

            <div>
              <Label htmlFor="description" className="text-white">Kuvaus</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="bg-gray-800 text-white border-gray-600 focus:border-blondify-blue"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category" className="text-white">Kategoria</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value: HairShadeCategory) => 
                    setFormData(prev => ({ ...prev, category: value }))
                  }
                >
                  <SelectTrigger className="bg-gray-800 text-white border-gray-600">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 text-white border-gray-600">
                    <SelectItem value="cool">Cool</SelectItem>
                    <SelectItem value="warm">Warm</SelectItem>
                    <SelectItem value="neutral">Neutral</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="display_order" className="text-white">Järjestys</Label>
                <Input
                  id="display_order"
                  type="number"
                  value={formData.display_order}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    display_order: parseInt(e.target.value) || 0 
                  }))}
                  className="bg-gray-800 text-white border-gray-600 focus:border-blondify-blue"
                />
              </div>
            </div>

            {/* Enhanced Image Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <Label className="text-white text-lg">Sävykuvat</Label>
                <div className="flex gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileInputChange}
                    className="hidden"
                    id="image-upload"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById('image-upload')?.click()}
                    disabled={uploadingImages.size > 0}
                    className="border-gray-600 text-black hover:bg-gray-700 hover:text-white bg-white"
                  >
                    {uploadingImages.size > 0 ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                    {uploadingImages.size > 0 ? 'Lataa...' : 'Lataa kuva'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleImageUrlAdd}
                    className="border-gray-600 text-black hover:bg-gray-700 hover:text-white bg-white"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Lisää URL
                  </Button>
                </div>
              </div>

              {/* Main Image Section */}
              {mainImage && (
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <Label className="text-white text-sm font-medium">Pääkuva</Label>
                    {(() => {
                      const status = getImageStatus(mainImage, 0);
                      return status && (
                        <div className={`flex items-center gap-1 text-xs ${status.color}`}>
                          {status.icon}
                          {status.type === 'uploading' ? 'Lataa...' : 
                           status.type === 'uploaded' ? 'Valmis' : 'Odottaa'}
                        </div>
                      );
                    })()}
                  </div>
                  <div className="bg-gray-800 border border-gray-600 rounded-lg p-4">
                    <div className="flex gap-4">
                      <div className="w-48 h-64 rounded overflow-hidden bg-gray-700 flex-shrink-0">
                        <img 
                          src={mainImage.url} 
                          alt={mainImage.alt || 'Pääkuva'} 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </div>
                      <div className="flex-1 space-y-3">
                        <div>
                          <Label className="text-sm text-white">Kuvan URL</Label>
                          <Input
                            value={mainImage.url.startsWith('blob:') ? 'Ladataan...' : mainImage.url}
                            onChange={(e) => !mainImage.url.startsWith('blob:') && handleImageUpdate(0, 'url', e.target.value)}
                            placeholder="https://example.com/image.jpg"
                            disabled={mainImage.url.startsWith('blob:')}
                            className="bg-gray-700 text-white border-gray-600 focus:border-blondify-blue"
                          />
                        </div>
                        <div>
                          <Label className="text-sm text-white">Alt-teksti</Label>
                          <Input
                            value={mainImage.alt || ''}
                            onChange={(e) => handleImageUpdate(0, 'alt', e.target.value)}
                            placeholder="Kuvan kuvaus"
                            className="bg-gray-700 text-white border-gray-600 focus:border-blondify-blue"
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleImageRemove(0)}
                            className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                          >
                            <X className="w-4 h-4 mr-1" />
                            Poista
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Other Images Gallery */}
              {otherImages.length > 0 && (
                <div className="mb-4">
                  <Label className="text-white text-sm font-medium mb-3 block">Muut kuvat</Label>
                  <div className="space-y-3">
                    {otherImages.map((image, index) => {
                      const actualIndex = index + 1; // Adjust for main image
                      const status = getImageStatus(image, actualIndex);
                      return (
                        <div key={actualIndex} className="bg-gray-800 border border-gray-600 rounded-lg p-3">
                          <div className="flex gap-3 items-start">
                            <div className="w-20 h-24 rounded overflow-hidden bg-gray-700 flex-shrink-0">
                              {image.url && (
                                <img 
                                  src={image.url} 
                                  alt={image.alt || 'Kuva'} 
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                  }}
                                />
                              )}
                            </div>
                            
                            <div className="flex-1 space-y-2">
                              <div>
                                <Label className="text-xs text-white">URL</Label>
                                <Input
                                  value={image.url.startsWith('blob:') ? 'Ladataan...' : image.url}
                                  onChange={(e) => !image.url.startsWith('blob:') && handleImageUpdate(actualIndex, 'url', e.target.value)}
                                  placeholder="https://example.com/image.jpg"
                                  disabled={image.url.startsWith('blob:')}
                                  className="bg-gray-700 text-white border-gray-600 focus:border-blondify-blue text-sm"
                                />
                              </div>
                              <div>
                                <Label className="text-xs text-white">Alt-teksti</Label>
                                <Input
                                  value={image.alt || ''}
                                  onChange={(e) => handleImageUpdate(actualIndex, 'alt', e.target.value)}
                                  placeholder="Kuvan kuvaus"
                                  className="bg-gray-700 text-white border-gray-600 focus:border-blondify-blue text-sm"
                                />
                              </div>
                              {status && (
                                <div className={`flex items-center gap-1 text-xs ${status.color}`}>
                                  {status.icon}
                                  {status.type === 'uploading' ? 'Lataa taustalla...' : 
                                   status.type === 'uploaded' ? 'Valmis' : 'Odottaa'}
                                </div>
                              )}
                            </div>

                            <div className="flex flex-col gap-1">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => setAsMainImage(actualIndex)}
                                className="text-yellow-400 hover:text-yellow-300 hover:bg-yellow-900/20 px-2"
                                title="Aseta pääkuvaksi"
                              >
                                <Star className="w-3 h-3" />
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => moveImage(actualIndex, 'up')}
                                disabled={actualIndex === 1}
                                className="text-blue-400 hover:text-blue-300 hover:bg-blue-900/20 px-2"
                                title="Siirrä ylös"
                              >
                                <ChevronUp className="w-3 h-3" />
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => moveImage(actualIndex, 'down')}
                                disabled={actualIndex === formData.images.length - 1}
                                className="text-blue-400 hover:text-blue-300 hover:bg-blue-900/20 px-2"
                                title="Siirrä alas"
                              >
                                <ChevronDown className="w-3 h-3" />
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleImageRemove(actualIndex)}
                                className="text-red-400 hover:text-red-300 hover:bg-red-900/20 px-2"
                                title="Poista"
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {formData.images.length === 0 && (
                <div className="text-center py-12 text-gray-400 border-2 border-dashed border-gray-600 rounded-lg bg-gray-800">
                  <Upload className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg mb-2">Ei kuvia lisätty</p>
                  <p className="text-sm">Lataa kuva tai lisää URL aloittaaksesi</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-600">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              className="border-gray-600 text-black hover:bg-gray-700 hover:text-white bg-white"
            >
              Peruuta
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="bg-blondify-blue hover:bg-blue-600 text-black"
            >
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {shade ? 'Päivitä' : 'Luo'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ShadeEditForm;
