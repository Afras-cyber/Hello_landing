import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { X, Upload, Video, Image as ImageIcon, Plus, Trash2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { useServicesByType } from '@/hooks/useServicesByType';

interface CampaignFormProps {
  onClose: () => void;
  onSuccess: (campaignId?: string) => void;
  editingCampaign?: any;
  isInline?: boolean;
}

interface CampaignFormData {
  name: string;
  description: string;
  slug: string;
  type: string;
  influencer_name: string;
  influencer_bio: string;
  discount_code: string;
  hero_video_url: string;
  countdown_end_date: string;
  campaign_text: string;
  booking_calendar_enabled: boolean;
  is_active: boolean;
  social_media_profiles: Record<string, string>;
  recommended_services: any[];
  testimonials: any[];
  faq_items: any[];
  gallery_images: any[];
  featured_products: any[];
}

const CampaignForm: React.FC<CampaignFormProps> = ({
  onClose,
  onSuccess,
  editingCampaign,
  isInline = false
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [backgroundFile, setBackgroundFile] = useState<File | null>(null);
  const [backgroundPreview, setBackgroundPreview] = useState<string | null>(null);
  const [profileFile, setProfileFile] = useState<File | null>(null);
  const [profilePreview, setProfilePreview] = useState<string | null>(null);
  const [heroVideoFile, setHeroVideoFile] = useState<File | null>(null);
  const [heroVideoPreview, setHeroVideoPreview] = useState<string | null>(null);
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const isMobile = useIsMobile();
  const { data: services = [] } = useServicesByType();

  // Popular social media platforms
  const popularPlatforms = [
    { key: 'instagram', label: 'Instagram', placeholder: 'https://instagram.com/@käyttäjänimi' },
    { key: 'tiktok', label: 'TikTok', placeholder: 'https://tiktok.com/@käyttäjänimi' },
    { key: 'youtube', label: 'YouTube', placeholder: 'https://youtube.com/@käyttäjänimi' },
    { key: 'facebook', label: 'Facebook', placeholder: 'https://facebook.com/käyttäjänimi' },
    { key: 'twitter', label: 'Twitter/X', placeholder: 'https://twitter.com/käyttäjänimi' },
    { key: 'linkedin', label: 'LinkedIn', placeholder: 'https://linkedin.com/in/käyttäjänimi' }
  ];

  const form = useForm<CampaignFormData>({
    defaultValues: {
      name: editingCampaign?.name || '',
      description: editingCampaign?.description || '',
      slug: editingCampaign?.slug || '',
      type: editingCampaign?.type || 'basic',
      influencer_name: editingCampaign?.influencer_name || '',
      influencer_bio: editingCampaign?.influencer_bio || '',
      discount_code: editingCampaign?.discount_code || '',
      hero_video_url: editingCampaign?.hero_video_url || '',
      countdown_end_date: editingCampaign?.countdown_end_date || '',
      campaign_text: editingCampaign?.campaign_text || '',
      booking_calendar_enabled: editingCampaign?.booking_calendar_enabled !== false,
      is_active: editingCampaign?.is_active || false,
      social_media_profiles: popularPlatforms.reduce((acc, platform) => {
        acc[platform.key] = editingCampaign?.social_media_urls?.[platform.key]?.profile_url || '';
        return acc;
      }, {} as Record<string, string>),
      recommended_services: editingCampaign?.recommended_services || [],
      testimonials: editingCampaign?.testimonials || [],
      faq_items: editingCampaign?.faq_items || [],
      gallery_images: editingCampaign?.gallery_images || [],
      featured_products: editingCampaign?.featured_products || []
    }
  });

  const {
    fields: featuredProductsFields,
    append: appendFeaturedProduct,
    remove: removeFeaturedProduct
  } = useFieldArray({
    control: form.control,
    name: "featured_products"
  });

  const {
    fields: testimonialsFields,
    append: appendTestimonial,
    remove: removeTestimonial
  } = useFieldArray({
    control: form.control,
    name: "testimonials"
  });

  const {
    fields: faqFields,
    append: appendFaq,
    remove: removeFaq
  } = useFieldArray({
    control: form.control,
    name: "faq_items"
  });

  const {
    fields: galleryFields,
    append: appendGallery,
    remove: removeGallery
  } = useFieldArray({
    control: form.control,
    name: "gallery_images"
  });

  const watchType = form.watch('type');

  // Initialize selected services from existing campaign
  useEffect(() => {
    if (editingCampaign?.featured_products) {
      const serviceIds = editingCampaign.featured_products
        .map((product: any) => product.service_id)
        .filter(Boolean);
      setSelectedServiceIds(serviceIds);
    }
  }, [editingCampaign]);

  useEffect(() => {
    if (editingCampaign?.background_image) {
      setBackgroundPreview(editingCampaign.background_image);
    }
    if (editingCampaign?.profile_image) {
      setProfilePreview(editingCampaign.profile_image);
    }
    if (editingCampaign?.hero_video_url) {
      setHeroVideoPreview(editingCampaign.hero_video_url);
    }
  }, [editingCampaign]);

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'background' | 'profile') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        switch (type) {
          case 'background':
            setBackgroundFile(file);
            setBackgroundPreview(result);
            break;
          case 'profile':
            setProfileFile(file);
            setProfilePreview(result);
            break;
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setHeroVideoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setHeroVideoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadFile = async (file: File, folder: string) => {
    const filename = `${folder}/${Date.now()}-${file.name}`;
    const {
      data: uploadData,
      error: uploadError
    } = await supabase.storage.from('media').upload(filename, file);
    if (uploadError) {
      throw uploadError;
    }
    const {
      data
    } = supabase.storage.from('media').getPublicUrl(filename);
    return data.publicUrl;
  };

  const handleServiceSelection = (serviceId: string, checked: boolean) => {
    if (checked) {
      setSelectedServiceIds(prev => [...prev, serviceId]);
    } else {
      setSelectedServiceIds(prev => prev.filter(id => id !== serviceId));
    }
  };

  const onSubmit = async (values: CampaignFormData) => {
    setLoading(true);
    try {
      let backgroundImagePath = editingCampaign?.background_image || null;
      let profileImagePath = editingCampaign?.profile_image || null;
      let heroVideoPath = editingCampaign?.hero_video_url || null;

      // Upload images if selected
      if (backgroundFile) {
        backgroundImagePath = await uploadFile(backgroundFile, 'campaign-backgrounds');
      }
      if (profileFile) {
        profileImagePath = await uploadFile(profileFile, 'campaign-profiles');
      }
      if (heroVideoFile) {
        heroVideoPath = await uploadFile(heroVideoFile, 'campaign-videos');
      }

      // Process featured products from selected services
      const featuredProducts = selectedServiceIds.map(serviceId => {
        const service = services.find(s => s.id === serviceId);
        return service ? {
          service_id: serviceId,
          name: service.name,
          description: service.description,
          price: service.price,
          image: service.image_path
        } : null;
      }).filter(Boolean);

      // Process social media URLs
      const socialMediaUrls = popularPlatforms.reduce((acc: any, platform) => {
        const profileUrl = values.social_media_profiles[platform.key];
        if (profileUrl && profileUrl.trim()) {
          acc[platform.key] = {
            profile_url: profileUrl.trim(),
            bio_link: '',
            story_link: '',
            post_link: ''
          };
        }
        return acc;
      }, {});

      const campaignData = {
        name: values.name,
        description: values.description,
        slug: values.slug,
        type: values.type,
        influencer_name: values.influencer_name,
        influencer_bio: values.influencer_bio,
        discount_code: values.discount_code,
        hero_video_url: heroVideoPath,
        countdown_end_date: values.countdown_end_date || null,
        campaign_text: values.campaign_text,
        booking_calendar_enabled: values.booking_calendar_enabled,
        is_active: values.is_active,
        background_image: backgroundImagePath,
        profile_image: profileImagePath,
        social_media_urls: socialMediaUrls,
        recommended_services: values.recommended_services,
        featured_products: featuredProducts,
        testimonials: values.testimonials,
        faq_items: values.faq_items,
        gallery_images: values.gallery_images
      };

      console.log('Saving campaign data:', campaignData);

      let response;
      let savedCampaignId;

      if (editingCampaign && editingCampaign.id) {
        console.log('Updating existing campaign with ID:', editingCampaign.id);
        response = await supabase
          .from('campaigns')
          .update(campaignData)
          .eq('id', editingCampaign.id)
          .select()
          .single();
        savedCampaignId = editingCampaign.id;
      } else {
        console.log('Creating new campaign');
        response = await supabase
          .from('campaigns')
          .insert([campaignData])
          .select()
          .single();
        savedCampaignId = response.data?.id;
      }

      if (response.error) {
        console.error('Error saving campaign:', response.error);
        throw response.error;
      }

      toast({
        title: "Onnistui",
        description: editingCampaign ? "Kampanja päivitetty!" : "Uusi kampanja lisätty!"
      });

      onSuccess(savedCampaignId);
      if (!isInline) {
        onClose();
      }
    } catch (error) {
      console.error('Error saving campaign:', error);
      toast({
        title: "Virhe",
        description: "Kampanjan tallentaminen epäonnistui.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const formContent = (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white font-semibold">Kampanjan nimi</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Kampanjan nimi" 
                    {...field} 
                    className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-300" 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white font-semibold">Kampanjatyyppi</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                      <SelectValue placeholder="Valitse tyyppi" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-gray-700 border-gray-600">
                    <SelectItem value="basic" className="text-white">Peruskampanja</SelectItem>
                    <SelectItem value="influencer" className="text-white">Vaikuttajakampanja</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white font-semibold">Kuvaus</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Kampanjan kuvaus" 
                  {...field} 
                  rows={3} 
                  className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-300" 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="campaign_text"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white font-semibold">Kampanjateksti</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Lisäteksti kampanjasivulle" 
                  {...field} 
                  rows={3} 
                  className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-300" 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="slug"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white font-semibold">URL-polku</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="esim. kesatajoitus-2025" 
                    {...field} 
                    className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-300" 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="discount_code"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white font-semibold">Alennuskoodi</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="esim. SUMMER25" 
                    {...field} 
                    className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-300" 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Featured Products from Services */}
        <div className="space-y-4 border-t border-gray-600 pt-6">
          <div className="flex justify-between items-center">
            <Label className="text-white font-semibold">Suosituimmat palvelut</Label>
            <span className="text-sm text-gray-300">Valitse aktiivisista palveluista</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
            {services.map((service) => (
              <div key={service.id} className="flex items-start space-x-3 p-3 bg-gray-800 rounded-lg">
                <Checkbox
                  id={`service-${service.id}`}
                  checked={selectedServiceIds.includes(service.id)}
                  onCheckedChange={(checked) => handleServiceSelection(service.id, checked as boolean)}
                  className="mt-1"
                />
                <div className="flex-1 min-w-0">
                  <label
                    htmlFor={`service-${service.id}`}
                    className="text-sm font-medium text-white cursor-pointer block"
                  >
                    {service.name}
                  </label>
                  <p className="text-xs text-gray-300 mt-1 line-clamp-2">
                    {service.description}
                  </p>
                  {service.price && (
                    <p className="text-xs text-blondify-blue mt-1 font-medium">
                      {service.price}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400">
            Valitut palvelut ({selectedServiceIds.length}) näkyvät kampanjasivulla suosituimpina tuotteina.
          </p>
        </div>

        {/* Image Uploads */}
        <div className="space-y-6 border-t border-gray-600 pt-6">
          <h3 className="text-lg font-semibold text-white">Kuvat</h3>
          
          {/* Hero Image Upload */}
          <div className="space-y-2">
            <Label htmlFor="background-image" className="text-white font-semibold">Hero-taustakuva</Label>
            <div className="flex items-center gap-4">
              <Input 
                id="background-image" 
                type="file" 
                accept="image/*" 
                onChange={(e) => handleImageFileChange(e, 'background')} 
                className="bg-gray-700 border-gray-600 text-white file:bg-gray-600 file:text-white file:border-0 file:mr-4 file:py-2 file:px-4 file:rounded cursor-pointer" 
              />
              <Button type="button" variant="outline" className="border-gray-600 text-slate-950 bg-slate-50">
                <ImageIcon className="w-4 h-4 mr-2" />
                Valitse hero-tausta
              </Button>
            </div>
            
            {backgroundPreview && (
              <div className="mt-2 relative">
                <img 
                  src={backgroundPreview} 
                  alt="Hero Background Preview" 
                  className="h-40 w-auto object-cover rounded-md border border-gray-600" 
                />
                <button 
                  type="button" 
                  onClick={() => {
                    setBackgroundPreview(null);
                    setBackgroundFile(null);
                  }} 
                  className="absolute top-1 right-1 bg-black/70 rounded-full p-1 hover:bg-black/90 text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          {/* Profile Image Upload */}
          <div className="space-y-2">
            <Label htmlFor="profile-image" className="text-white font-semibold">Profiilukuva (hero-reunalla)</Label>
            <div className="flex items-center gap-4">
              <Input 
                id="profile-image" 
                type="file" 
                accept="image/*" 
                onChange={(e) => handleImageFileChange(e, 'profile')} 
                className="bg-gray-700 border-gray-600 text-white file:bg-gray-600 file:text-white file:border-0 file:mr-4 file:py-2 file:px-4 file:rounded cursor-pointer" 
              />
              <Button type="button" variant="outline" className="border-gray-600 text-slate-950 bg-slate-50">
                <ImageIcon className="w-4 h-4 mr-2" />
                Valitse profiilukuva
              </Button>
            </div>
            
            {profilePreview && (
              <div className="mt-2 relative">
                <img 
                  src={profilePreview} 
                  alt="Profile Preview" 
                  className="h-32 w-32 object-cover rounded-full border border-gray-600" 
                />
                <button 
                  type="button" 
                  onClick={() => {
                    setProfilePreview(null);
                    setProfileFile(null);
                  }} 
                  className="absolute top-1 right-1 bg-black/70 rounded-full p-1 hover:bg-black/90 text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Influencer-specific fields */}
        {watchType === 'influencer' && (
          <div className="space-y-6 p-4 bg-purple-900/20 rounded-lg border border-purple-600/30">
            <h3 className="text-lg font-semibold text-purple-300">Somettajan tiedot</h3>
            
            <FormField
              control={form.control}
              name="influencer_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white font-semibold">Vaikuttajan nimi</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="esim. @somevaikuttaja" 
                      {...field} 
                      className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-300" 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="influencer_bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white font-semibold">Vaikuttajan esittely</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Kerro vaikuttajasta..." 
                      {...field} 
                      rows={3} 
                      className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-300" 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Social Media Profile Links */}
            <div className="space-y-4">
              <Label className="text-white font-semibold">Somekanavien profiilit</Label>
              <p className="text-sm text-gray-300">Lisää vaikuttajan profiilin linkit eri somekanavissa</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {popularPlatforms.map((platform) => (
                  <FormField
                    key={platform.key}
                    control={form.control}
                    name={`social_media_profiles.${platform.key}`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm text-gray-300">{platform.label}</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder={platform.placeholder} 
                            {...field} 
                            className="bg-gray-700 border-gray-600 text-white text-xs placeholder:text-gray-400" 
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Featured Products Management */}
        <div className="space-y-3 border-t border-gray-600 pt-6">
          <div className="flex justify-between items-center">
            <Label className="text-white font-semibold">Suosituimmat tuotteet</Label>
            <Button 
              type="button" 
              size="sm" 
              onClick={() => appendFeaturedProduct({ name: '', description: '', price: '', image: '' })}
              className="bg-blondify-blue hover:bg-blue-600"
            >
              <Plus className="w-4 h-4 mr-1" /> Lisää tuote
            </Button>
          </div>
          {featuredProductsFields.map((field, index) => (
            <div key={field.id} className="p-4 bg-gray-800 rounded-lg space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-300">Tuote {index + 1}</span>
                <Button 
                  type="button" 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => removeFeaturedProduct(index)}
                  className="text-red-400 hover:text-red-300"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name={`featured_products.${index}.name`}
                  render={({ field }) => (
                    <FormControl>
                      <Input 
                        placeholder="Tuotteen nimi" 
                        {...field} 
                        className="bg-gray-700 border-gray-600 text-white text-sm" 
                      />
                    </FormControl>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`featured_products.${index}.price`}
                  render={({ field }) => (
                    <FormControl>
                      <Input 
                        placeholder="Hinta (esim. alk. 159€)" 
                        {...field} 
                        className="bg-gray-700 border-gray-600 text-white text-sm" 
                      />
                    </FormControl>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name={`featured_products.${index}.description`}
                render={({ field }) => (
                  <FormControl>
                    <Textarea 
                      placeholder="Tuotteen kuvaus..." 
                      {...field} 
                      rows={2} 
                      className="bg-gray-700 border-gray-600 text-white text-sm" 
                    />
                  </FormControl>
                )}
              />
              <FormField
                control={form.control}
                name={`featured_products.${index}.image`}
                render={({ field }) => (
                  <FormControl>
                    <Input 
                      placeholder="Kuvan URL" 
                      {...field} 
                      className="bg-gray-700 border-gray-600 text-white text-sm" 
                    />
                  </FormControl>
                )}
              />
            </div>
          ))}
        </div>

        {/* Testimonials Management */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <Label className="text-white font-semibold">Asiakaspalautteet</Label>
            <Button 
              type="button" 
              size="sm" 
              onClick={() => appendTestimonial({ name: '', review: '', rating: 5 })}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Plus className="w-4 h-4 mr-1" /> Lisää
            </Button>
          </div>
          {testimonialsFields.map((field, index) => (
            <div key={field.id} className="p-3 bg-gray-800 rounded-lg space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-300">Palaute {index + 1}</span>
                <Button 
                  type="button" 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => removeTestimonial(index)}
                  className="text-red-400 hover:text-red-300"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <FormField
                  control={form.control}
                  name={`testimonials.${index}.name`}
                  render={({ field }) => (
                    <FormControl>
                      <Input 
                        placeholder="Asiakkaan nimi" 
                        {...field} 
                        className="bg-gray-700 border-gray-600 text-white text-sm" 
                      />
                    </FormControl>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`testimonials.${index}.rating`}
                  render={({ field }) => (
                    <FormControl>
                      <Select onValueChange={(value) => field.onChange(parseInt(value))} defaultValue={field.value?.toString()}>
                        <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                          <SelectValue placeholder="Arvosana" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-700 border-gray-600">
                          {[5, 4, 3, 2, 1].map(rating => (
                            <SelectItem key={rating} value={rating.toString()} className="text-white">
                              {rating} tähteä
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name={`testimonials.${index}.review`}
                render={({ field }) => (
                  <FormControl>
                    <Textarea 
                      placeholder="Asiakkaan palaute..." 
                      {...field} 
                      rows={2} 
                      className="bg-gray-700 border-gray-600 text-white text-sm" 
                    />
                  </FormControl>
                )}
              />
            </div>
          ))}
        </div>

        {/* FAQ Management */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <Label className="text-white font-semibold">Usein kysytyt kysymykset</Label>
            <Button 
              type="button" 
              size="sm" 
              onClick={() => appendFaq({ question: '', answer: '' })}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Plus className="w-4 h-4 mr-1" /> Lisää
            </Button>
          </div>
          {faqFields.map((field, index) => (
            <div key={field.id} className="p-3 bg-gray-800 rounded-lg space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-300">FAQ {index + 1}</span>
                <Button 
                  type="button" 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => removeFaq(index)}
                  className="text-red-400 hover:text-red-300"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              <FormField
                control={form.control}
                name={`faq_items.${index}.question`}
                render={({ field }) => (
                  <FormControl>
                    <Input 
                      placeholder="Kysymys" 
                      {...field} 
                      className="bg-gray-700 border-gray-600 text-white text-sm" 
                    />
                  </FormControl>
                )}
              />
              <FormField
                control={form.control}
                name={`faq_items.${index}.answer`}
                render={({ field }) => (
                  <FormControl>
                    <Textarea 
                      placeholder="Vastaus..." 
                      {...field} 
                      rows={2} 
                      className="bg-gray-700 border-gray-600 text-white text-sm" 
                    />
                  </FormControl>
                )}
              />
            </div>
          ))}
        </div>

        {/* Hero Video Upload */}
        <div className="space-y-2">
          <Label htmlFor="hero-video" className="text-white font-semibold">Hero-video</Label>
          <div className="flex items-center gap-4">
            <Input 
              id="hero-video" 
              type="file" 
              accept="video/*" 
              onChange={handleVideoFileChange} 
              className="bg-gray-700 border-gray-600 text-white file:bg-gray-600 file:text-white file:border-0 file:mr-4 file:py-2 file:px-4 file:rounded cursor-pointer" 
            />
            <Button type="button" variant="outline" className="border-gray-600 text-slate-950 bg-slate-50">
              <Video className="w-4 h-4 mr-2" />
              Valitse video
            </Button>
          </div>
          
          {heroVideoPreview && (
            <div className="mt-2 relative">
              <video 
                src={heroVideoPreview} 
                className="h-40 w-auto object-cover rounded-md border border-gray-600" 
                controls 
              />
              <button 
                type="button" 
                onClick={() => {
                  setHeroVideoPreview(null);
                  setHeroVideoFile(null);
                }} 
                className="absolute top-1 right-1 bg-black/70 rounded-full p-1 hover:bg-black/90 text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
        
        <FormField
          control={form.control}
          name="hero_video_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white font-semibold">Tai Hero-videon URL (valinnainen)</FormLabel>
              <FormControl>
                <Input 
                  placeholder="https://www.youtube.com/embed/..." 
                  {...field} 
                  className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-300" 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="booking_calendar_enabled"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between space-x-3 space-y-0 rounded-md border border-gray-600 p-4 bg-gray-700/50">
              <div className="space-y-1 leading-none">
                <FormLabel className="text-white font-semibold">Varauskalenteri käytössä</FormLabel>
                <p className="text-sm text-gray-300">Näytä varauskalenteri kampanjasivulla</p>
              </div>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="is_active"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between space-x-3 space-y-0 rounded-md border border-gray-600 p-4 bg-gray-700/50">
              <div className="space-y-1 leading-none">
                <FormLabel className="text-white font-semibold">Aktiivinen kampanja</FormLabel>
                <p className="text-sm text-gray-300">Näytä kampanja julkisella sivulla</p>
              </div>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />
        
        <div className="flex justify-end gap-2 pt-2">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onClose} 
            disabled={loading}
            className="border-gray-600 text-white hover:bg-gray-700"
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

  if (isInline) {
    return (
      <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
        {formContent}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className={`bg-gray-900 rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto ${isMobile ? 'mx-3' : ''}`}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">
            {editingCampaign ? 'Muokkaa kampanjaa' : 'Lisää uusi kampanja'}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-gray-800">
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        {formContent}
      </div>
    </div>
  );
};

export default CampaignForm;
