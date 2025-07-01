
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useSpecialistTestimonials } from '@/hooks/useSpecialistTestimonials';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, Edit2, Star, Upload } from 'lucide-react';

interface SpecialistTestimonialsManagerProps {
  specialistId: string;
}

const SpecialistTestimonialsManager: React.FC<SpecialistTestimonialsManagerProps> = ({
  specialistId
}) => {
  const { testimonials, addTestimonial, deleteTestimonial, updateTestimonial, isLoading } = useSpecialistTestimonials(specialistId);
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false);

  const [newTestimonial, setNewTestimonial] = useState({
    customer_name: '',
    customer_age: '',
    testimonial_text: '',
    is_featured: false,
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
      const filePath = `testimonial_images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('portfolio')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        throw uploadError;
      }

      const { data: urlData } = supabase.storage
        .from('portfolio')
        .getPublicUrl(filePath);

      return urlData.publicUrl;

    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: 'Virhe',
        description: 'Kuvan lataus epäonnistui.',
        variant: 'destructive'
      });
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddTestimonial = async (imageFile?: File) => {
    let imageUrl = '';
    
    if (imageFile) {
      const uploadedUrl = await handleFileUpload({ target: { files: [imageFile] } } as any);
      if (uploadedUrl) {
        imageUrl = uploadedUrl;
      }
    }

    addTestimonial({
      customer_name: newTestimonial.customer_name,
      customer_age: newTestimonial.customer_age ? parseInt(newTestimonial.customer_age) : undefined,
      testimonial_text: newTestimonial.testimonial_text,
      image_url: imageUrl || undefined,
      is_featured: newTestimonial.is_featured,
    });

    setNewTestimonial({
      customer_name: '',
      customer_age: '',
      testimonial_text: '',
      is_featured: false,
    });
    setIsAddDialogOpen(false);
  };

  const handleEditTestimonial = (testimonial: any) => {
    setEditingTestimonial({ 
      ...testimonial,
      customer_age: testimonial.customer_age?.toString() || '',
    });
  };

  const handleUpdateTestimonial = () => {
    if (!editingTestimonial) return;
    
    updateTestimonial({
      testimonialId: editingTestimonial.id,
      updates: {
        customer_name: editingTestimonial.customer_name,
        customer_age: editingTestimonial.customer_age ? parseInt(editingTestimonial.customer_age) : undefined,
        testimonial_text: editingTestimonial.testimonial_text,
        is_featured: editingTestimonial.is_featured,
      }
    });
    setEditingTestimonial(null);
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
        <h3 className="text-lg font-semibold text-white">Asiakaspalautteet</h3>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blondify-blue hover:bg-blue-600">
              <Plus className="h-4 w-4 mr-2" />
              Lisää palaute
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gray-800 border-gray-700 max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-white">Lisää asiakaspalaute</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="customer-name" className="text-gray-300">Asiakkaan nimi</Label>
                  <Input
                    id="customer-name"
                    value={newTestimonial.customer_name}
                    onChange={(e) => setNewTestimonial(prev => ({ ...prev, customer_name: e.target.value }))}
                    placeholder="Asiakkaan nimi"
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="customer-age" className="text-gray-300">Ikä (valinnainen)</Label>
                  <Input
                    id="customer-age"
                    type="number"
                    value={newTestimonial.customer_age}
                    onChange={(e) => setNewTestimonial(prev => ({ ...prev, customer_age: e.target.value }))}
                    placeholder="Ikä"
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="testimonial-text" className="text-gray-300">Palaute</Label>
                <Textarea
                  id="testimonial-text"
                  value={newTestimonial.testimonial_text}
                  onChange={(e) => setNewTestimonial(prev => ({ ...prev, testimonial_text: e.target.value }))}
                  placeholder="Asiakkaan palaute..."
                  rows={4}
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>

              <div>
                <Label htmlFor="customer-image" className="text-gray-300">Asiakkaan kuva (valinnainen)</Label>
                <Input
                  id="customer-image"
                  type="file"
                  accept="image/*"
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is-featured"
                  checked={newTestimonial.is_featured}
                  onCheckedChange={(checked) => setNewTestimonial(prev => ({ ...prev, is_featured: checked }))}
                />
                <Label htmlFor="is-featured" className="text-gray-300">Suosittu palaute</Label>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsAddDialogOpen(false)}
                >
                  Peruuta
                </Button>
                <Button
                  onClick={() => {
                    const fileInput = document.getElementById('customer-image') as HTMLInputElement;
                    const file = fileInput?.files?.[0];
                    handleAddTestimonial(file);
                  }}
                  className="bg-blondify-blue hover:bg-blue-600"
                  disabled={!newTestimonial.customer_name || !newTestimonial.testimonial_text}
                >
                  Lisää palaute
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {testimonials.map((testimonial) => (
          <Card key={testimonial.id} className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  {testimonial.image_url && (
                    <img
                      src={testimonial.image_url}
                      alt={testimonial.customer_name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  )}
                  <div>
                    <h4 className="font-semibold text-white">
                      {testimonial.customer_name}
                      {testimonial.customer_age && (
                        <span className="text-gray-400 font-normal">, {testimonial.customer_age}v</span>
                      )}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      {testimonial.is_featured && (
                        <Badge className="bg-yellow-600 text-white text-xs">
                          <Star className="h-3 w-3 mr-1" />
                          Suosittu
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-xs">
                        #{testimonial.display_order}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleEditTestimonial(testimonial)}
                    className="text-gray-400 hover:text-white"
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => deleteTestimonial(testimonial.id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <blockquote className="text-gray-300 italic border-l-4 border-blondify-blue pl-4">
                "{testimonial.testimonial_text}"
              </blockquote>
            </CardContent>
          </Card>
        ))}
      </div>

      {testimonials.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400">Ei asiakaspalautteita</p>
          <p className="text-sm text-gray-500 mt-2">Lisää ensimmäinen palaute yllä olevalla napilla</p>
        </div>
      )}

      {/* Edit Dialog */}
      {editingTestimonial && (
        <Dialog open={true} onOpenChange={() => setEditingTestimonial(null)}>
          <DialogContent className="bg-gray-800 border-gray-700 max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-white">Muokkaa asiakaspalautetta</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-customer-name" className="text-gray-300">Asiakkaan nimi</Label>
                  <Input
                    id="edit-customer-name"
                    value={editingTestimonial.customer_name || ''}
                    onChange={(e) => setEditingTestimonial(prev => ({ ...prev, customer_name: e.target.value }))}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-customer-age" className="text-gray-300">Ikä</Label>
                  <Input
                    id="edit-customer-age"
                    type="number"
                    value={editingTestimonial.customer_age || ''}
                    onChange={(e) => setEditingTestimonial(prev => ({ ...prev, customer_age: e.target.value }))}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="edit-testimonial-text" className="text-gray-300">Palaute</Label>
                <Textarea
                  id="edit-testimonial-text"
                  value={editingTestimonial.testimonial_text || ''}
                  onChange={(e) => setEditingTestimonial(prev => ({ ...prev, testimonial_text: e.target.value }))}
                  rows={4}
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-is-featured"
                  checked={editingTestimonial.is_featured || false}
                  onCheckedChange={(checked) => setEditingTestimonial(prev => ({ ...prev, is_featured: checked }))}
                />
                <Label htmlFor="edit-is-featured" className="text-gray-300">Suosittu palaute</Label>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setEditingTestimonial(null)}
                >
                  Peruuta
                </Button>
                <Button
                  onClick={handleUpdateTestimonial}
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

export default SpecialistTestimonialsManager;
