
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X, Plus } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { sanitizeFilename } from '@/utils/fileUtils';

interface SpecialistFormProps {
  onClose: () => void;
  onSuccess: () => void;
  editingSpecialist?: any;
  isInline?: boolean;
}

const SpecialistForm: React.FC<SpecialistFormProps> = ({ 
  onClose, 
  onSuccess, 
  editingSpecialist, 
  isInline = false 
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [specialty, setSpecialty] = useState('');
  const [specialties, setSpecialties] = useState<string[]>([]);
  
  const form = useForm({
    defaultValues: {
      name: editingSpecialist?.name || '',
      role: editingSpecialist?.role || '',
      bio: editingSpecialist?.bio || '',
      location: editingSpecialist?.location || 'Helsinki',
      is_active: editingSpecialist?.is_active ?? true,
    }
  });

  useEffect(() => {
    // Set specialties if editing
    if (editingSpecialist?.specialties) {
      setSpecialties(editingSpecialist.specialties);
    }
    
    // Set image preview if editing
    if (editingSpecialist?.image_path) {
      setImagePreview(editingSpecialist.image_path);
    }
  }, [editingSpecialist]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const addSpecialty = () => {
    if (specialty.trim() && !specialties.includes(specialty.trim())) {
      setSpecialties([...specialties, specialty.trim()]);
      setSpecialty('');
    }
  };

  const removeSpecialty = (index: number) => {
    const newSpecialties = [...specialties];
    newSpecialties.splice(index, 1);
    setSpecialties(newSpecialties);
  };

  const onSubmit = async (values: any) => {
    setLoading(true);
    try {
      let imagePath = editingSpecialist?.image_path || '';
      
      // Upload image if selected
      if (imageFile) {
        console.log('Uploading image to media bucket...');
        
        // Sanitize the filename to ensure it's valid for Supabase Storage
        const sanitizedFilename = sanitizeFilename(imageFile.name);
        const filename = `team/${Date.now()}-${sanitizedFilename}`;
        
        console.log('Original filename:', imageFile.name);
        console.log('Sanitized filename:', filename);
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('media')
          .upload(filename, imageFile);
        
        if (uploadError) {
          console.error('Upload error:', uploadError);
          throw uploadError;
        }
        
        const { data } = supabase.storage
          .from('media')
          .getPublicUrl(filename);
          
        imagePath = data.publicUrl;
        console.log('Image uploaded successfully:', imagePath);
      }
      
      // If no image uploaded and no existing image, use a default placeholder
      if (!imagePath) {
        imagePath = 'https://via.placeholder.com/400x600/gray/white?text=No+Image';
      }
      
      const specialistData = {
        ...values,
        specialties,
        image_path: imagePath,
      };
      
      console.log('Saving specialist data:', specialistData);
      
      let response;
      if (editingSpecialist && editingSpecialist.id) {
        // Update existing specialist
        console.log('Updating existing specialist with ID:', editingSpecialist.id);
        response = await supabase
          .from('team_members')
          .update(specialistData)
          .eq('id', editingSpecialist.id);
      } else {
        // Generate ID for new specialist
        const id = crypto.randomUUID();
        console.log('Creating new specialist with ID:', id);
        // Create new specialist
        response = await supabase
          .from('team_members')
          .insert([{ id, ...specialistData }]);
      }
      
      if (response.error) {
        console.error('Database error:', response.error);
        throw response.error;
      }
      
      toast({
        title: "Onnistui",
        description: editingSpecialist ? "Specialist päivitetty!" : "Uusi specialist lisätty!",
      });
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving specialist:', error);
      toast({
        title: "Virhe",
        description: "Specialistin tallentaminen epäonnistui.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // For modal display
  if (!isInline) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-gray-900 rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-white">
              {editingSpecialist ? 'Muokkaa specialistia' : 'Lisää uusi specialist'}
            </h2>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={onClose}
              className="text-white hover:bg-gray-800"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {renderForm()}
        </div>
      </div>
    );
  }
  
  // For inline display on the specialists detail page
  return (
    <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-white">
          {editingSpecialist ? 'Muokkaa specialistia' : 'Lisää uusi specialist'}
        </h2>
      </div>
      
      {renderForm()}
    </div>
  );
  
  function renderForm() {
    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Nimi</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Specialistin nimi" 
                    {...field} 
                    className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-300 focus:border-blondify-blue"
                  />
                </FormControl>
                <FormMessage className="text-red-400" />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Titteli</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="esim. Blonde Specialist" 
                    {...field} 
                    className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-300 focus:border-blondify-blue"
                  />
                </FormControl>
                <FormMessage className="text-red-400" />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Toimipiste</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="esim. Helsinki" 
                    {...field} 
                    className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-300 focus:border-blondify-blue"
                  />
                </FormControl>
                <FormMessage className="text-red-400" />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="bio"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Biografia</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Lyhyt kuvaus" 
                    {...field} 
                    rows={4}
                    className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-300 focus:border-blondify-blue resize-none"
                  />
                </FormControl>
                <FormMessage className="text-red-400" />
              </FormItem>
            )}
          />
          
          <div className="space-y-2">
            <Label className="text-white">Erikoisalat</Label>
            <div className="flex gap-2">
              <Input 
                placeholder="Lisää erikoisala"
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSpecialty())}
                className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-300 focus:border-blondify-blue"
              />
              <Button 
                type="button" 
                onClick={addSpecialty}
                size="icon"
                className="bg-blondify-blue hover:bg-blue-600 text-white"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-2 mt-2">
              {specialties.map((item, index) => (
                <Badge 
                  key={index} 
                  variant="secondary"
                  className="flex items-center gap-1 py-1 bg-gray-600 text-gray-200 hover:bg-gray-500"
                >
                  {item}
                  <X 
                    className="h-3 w-3 cursor-pointer hover:text-red-400" 
                    onClick={() => removeSpecialty(index)}
                  />
                </Badge>
              ))}
            </div>
          </div>
          
          <FormField
            control={form.control}
            name="is_active"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                <FormControl>
                  <input
                    type="checkbox"
                    checked={field.value}
                    onChange={field.onChange}
                    className="h-4 w-4 rounded border-gray-600 bg-gray-700 text-blondify-blue focus:ring-blondify-blue focus:ring-offset-0"
                  />
                </FormControl>
                <FormLabel className="m-0 text-white">Aktiivinen</FormLabel>
              </FormItem>
            )}
          />
          
          <div className="space-y-2">
            <Label htmlFor="image" className="text-white">Profiilikuva</Label>
            <Input
              id="image"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="cursor-pointer bg-gray-700 border-gray-600 text-white file:bg-gray-600 file:text-white file:border-0 file:rounded-md file:px-3 file:py-1 file:mr-3 hover:file:bg-gray-500"
            />
            
            {imagePreview && (
              <div className="mt-2 relative">
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  className="h-40 w-auto object-cover rounded-md border border-gray-600"
                />
                <button
                  type="button"
                  onClick={() => {
                    setImagePreview(null);
                    setImageFile(null);
                  }}
                  className="absolute top-1 right-1 bg-black/70 rounded-full p-1 hover:bg-black/90 text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
          
          <div className="flex justify-end gap-2 pt-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              disabled={loading}
              className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
            >
              Peruuta
            </Button>
            <Button 
              type="submit"
              disabled={loading}
              className="bg-blondify-blue hover:bg-blue-600 text-white"
            >
              {loading ? 'Tallennetaan...' : 'Tallenna'}
            </Button>
          </div>
        </form>
      </Form>
    );
  }
};

export default SpecialistForm;
