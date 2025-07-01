
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';

interface ServiceFormProps {
  onClose: () => void;
  onSuccess: () => void;
  editingService?: any;
  isInline?: boolean;
}

const ServiceForm: React.FC<ServiceFormProps> = ({ onClose, onSuccess, editingService, isInline = false }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const isMobile = useIsMobile();
  
  const form = useForm({
    defaultValues: {
      name: editingService?.name || '',
      description: editingService?.description || '',
      price: editingService?.price || '',
      category_id: editingService?.category_id || '',
      featured: editingService?.featured || false,
      slug: editingService?.slug || '',
      service_type: editingService?.service_type || '',
    }
  });
  
  useEffect(() => {
    const initializeData = async () => {
      await ensureCategoriesExist();
      await fetchCategories();
    };
    
    initializeData();
    
    // Set image preview if editing
    if (editingService?.image_path) {
      setImagePreview(editingService.image_path);
    }
  }, [editingService, toast]);

  const ensureCategoriesExist = async () => {
    try {
      console.log('Ensuring categories exist...');
      const { data, error } = await supabase.rpc('migrate_services_data');
      
      if (error) {
        console.error('Error running migrate_services_data:', error);
        // Don't throw here as categories might already exist
      } else {
        console.log('Migration result:', data);
      }
    } catch (error) {
      console.error('Error ensuring categories exist:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      setCategoriesLoading(true);
      console.log('Fetching service categories...');
      
      const { data, error } = await supabase
        .from('service_categories')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('Error fetching categories:', error);
        throw error;
      }
      
      console.log('Categories fetched successfully:', data?.length || 0, 'categories');
      setCategories(data || []);
      
      if (!data || data.length === 0) {
        toast({
          title: "Ei kategorioita",
          description: "Palvelukategorioita ei löytynyt. Ota yhteyttä järjestelmänvalvojaan.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast({
        title: "Virhe",
        description: "Kategorioiden hakeminen epäonnistui.",
        variant: "destructive"
      });
    } finally {
      setCategoriesLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      console.log('File selected:', file.name, 'Size:', file.size, 'Type:', file.type);
      
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Virheellinen tiedostotyyppi",
          description: "Sallitut tiedostotyypit: JPEG, PNG, WebP, GIF",
          variant: "destructive"
        });
        return;
      }
      
      // Validate file size (50MB max)
      if (file.size > 52428800) {
        toast({
          title: "Tiedosto liian suuri",
          description: "Maksimi tiedostokoko on 50MB",
          variant: "destructive"
        });
        return;
      }
      
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (values: any) => {
    console.log('Form submission started with values:', values);
    setLoading(true);
    
    try {
      let imagePath = editingService?.image_path || null;
      
      // Upload image if selected
      if (imageFile) {
        console.log('Starting image upload...');
        const filename = `${Date.now()}-${imageFile.name}`;
        
        console.log('Uploading to service-images bucket with filename:', filename);
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('service-images')
          .upload(filename, imageFile);
        
        if (uploadError) {
          console.error('Image upload error:', uploadError);
          toast({
            title: "Kuvan tallennus epäonnistui",
            description: `Virhe: ${uploadError.message}`,
            variant: "destructive"
          });
          throw uploadError;
        }
        
        console.log('Image uploaded successfully:', uploadData);
        
        const { data } = supabase.storage
          .from('service-images')
          .getPublicUrl(filename);
          
        imagePath = data.publicUrl;
        console.log('Public URL generated:', imagePath);
      }
      
      const serviceData = {
        ...values,
        image_path: imagePath,
      };
      
      console.log('Saving service data:', serviceData);
      
      let response;
      if (editingService) {
        console.log('Updating existing service with ID:', editingService.id);
        response = await supabase
          .from('services')
          .update(serviceData)
          .eq('id', editingService.id);
      } else {
        console.log('Creating new service');
        response = await supabase
          .from('services')
          .insert([serviceData]);
      }
      
      if (response.error) {
        console.error('Database save error:', response.error);
        toast({
          title: "Tietokannan virhe",
          description: `Virhe: ${response.error.message}`,
          variant: "destructive"
        });
        throw response.error;
      }
      
      console.log('Service saved successfully');
      toast({
        title: "Onnistui",
        description: editingService ? "Palvelu päivitetty!" : "Uusi palvelu lisätty!",
      });
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving service:', error);
      toast({
        title: "Virhe",
        description: "Palvelun tallentaminen epäonnistui. Tarkista konsoli lisätiedoille.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const formContent = (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* First row - Basic info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Palvelun nimi *</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="esim. Blondi-paketti" 
                    {...field} 
                    className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-400 focus:border-blondify-blue"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Hinta</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="esim. alk. 149€" 
                    {...field} 
                    className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-400 focus:border-blondify-blue"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Second row - URL and Type */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="slug"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">URL-polku</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="esim. vaalennus-paketti" 
                    {...field} 
                    className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-400 focus:border-blondify-blue"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="service_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Palvelun tyyppi</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="esim. vaalennus" 
                    {...field} 
                    className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-400 focus:border-blondify-blue"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Third row - Category and Featured toggle */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
          <FormField
            control={form.control}
            name="category_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Kategoria</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                  value={field.value}
                  disabled={categoriesLoading}
                >
                  <FormControl>
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white focus:border-blondify-blue">
                      <SelectValue placeholder={
                        categoriesLoading 
                          ? "Ladataan kategorioita..." 
                          : categories.length === 0 
                            ? "Ei kategorioita saatavilla" 
                            : "Valitse kategoria"
                      } />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    {categories.map((category) => (
                      <SelectItem 
                        key={category.id} 
                        value={category.id}
                        className="text-white hover:bg-gray-700 focus:bg-gray-700"
                      >
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
                {categories.length === 0 && !categoriesLoading && (
                  <p className="text-xs text-yellow-400">
                    Ei kategorioita. Ota yhteyttä järjestelmänvalvojaan.
                  </p>
                )}
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="featured"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between space-x-3 space-y-0 rounded-md border border-gray-700 bg-gray-800/50 p-4">
                <div className="space-y-1 leading-none">
                  <FormLabel className="text-white">Suositeltu palvelu</FormLabel>
                  <p className="text-sm text-gray-400">Näytetään etusivulla</p>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className="data-[state=checked]:bg-blondify-blue"
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
        
        {/* Fourth row - Description (full width) */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white">Kuvaus</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Palvelun kuvaus asiakkaalle" 
                  {...field} 
                  rows={3}
                  className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-400 focus:border-blondify-blue resize-none"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Fifth row - Image upload */}
        <div className="space-y-3">
          <Label htmlFor="image" className="text-white">Palvelun kuva</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
            <div className="space-y-2">
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="cursor-pointer bg-gray-800 border-gray-700 text-white file:bg-gray-700 file:text-white file:border-0 file:mr-4 file:px-4 file:py-2 file:rounded-md hover:file:bg-gray-600"
              />
              <p className="text-xs text-gray-400">
                Suositeltava koko: 800x600px | Maksimi: 50MB | Tuetut tyypit: JPEG, PNG, WebP, GIF
              </p>
            </div>
            
            {imagePreview && (
              <div className="relative">
                <img 
                  src={imagePreview} 
                  alt="Esikatselu" 
                  className="h-24 w-auto object-cover rounded-md border border-gray-700"
                />
                <button
                  type="button"
                  onClick={() => {
                    setImagePreview(null);
                    setImageFile(null);
                  }}
                  className="absolute -top-2 -right-2 bg-red-600 hover:bg-red-700 rounded-full p-1 text-white transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>
        </div>
        
        {/* Action buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onClose}
            disabled={loading}
            className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white"
          >
            Peruuta
          </Button>
          <Button 
            type="submit"
            disabled={loading || categoriesLoading}
            className="bg-blondify-blue hover:bg-blue-600 text-white"
          >
            {loading ? 'Tallennetaan...' : 'Tallenna palvelu'}
          </Button>
        </div>
      </form>
    </Form>
  );

  if (isInline) {
    return (
      <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
        {formContent}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className={`bg-gray-900 rounded-lg border border-gray-800 shadow-2xl ${
        isMobile 
          ? 'w-full max-w-md mx-3 max-h-[90vh]' 
          : 'w-full max-w-4xl mx-6 max-h-[85vh]'
      } overflow-hidden flex flex-col`}>
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-800 flex-shrink-0">
          <h2 className="text-xl font-bold text-white">
            {editingService ? 'Muokkaa palvelua' : 'Lisää uusi palvelu'}
          </h2>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={onClose}
            className="text-gray-400 hover:text-white hover:bg-gray-800"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {formContent}
        </div>
      </div>
    </div>
  );
};

export default ServiceForm;
