
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Campaign {
  id: string;
  name: string;
  description: string;
  slug: string;
  banner_image: string;
  background_image?: string;
  profile_image?: string;
  influencer_name: string;
  type: 'influencer' | 'basic';
  redirect_url: string;
  recommended_services: Array<{
    id: string;
    name: string;
    highlight?: boolean;
  }>;
  is_active: boolean;
  social_media_urls?: Record<string, string>;
  discount_code?: string;
  content_blocks?: Array<{
    type: string;
    content?: string;
    url?: string;
    caption?: string;
  }>;
  // New fields for expanded functionality
  influencer_bio?: string;
  influencer_stats?: Record<string, any>;
  partner_logos?: Array<{
    name: string;
    url: string;
    logo_url: string;
  }>;
  exclusive_offers?: Array<{
    title: string;
    description: string;
    discount?: string;
    expires_at?: string;
  }>;
  pricing_table?: Array<{
    service: string;
    original_price: string;
    campaign_price: string;
    savings?: string;
  }>;
  testimonials?: Array<{
    name: string;
    review: string;
    rating: number;
    image_url?: string;
  }>;
  faq_items?: Array<{
    question: string;
    answer: string;
  }>;
  countdown_end_date?: string;
  hero_video_url?: string;
  gallery_images?: Array<{
    url: string;
    caption?: string;
    alt_text?: string;
  }>;
  // Enhanced campaign fields
  campaign_text?: string;
  booking_calendar_enabled?: boolean;
  featured_products?: Array<{
    name: string;
    description?: string;
    price?: string;
    image?: string;
  }>;
  custom_styles?: Record<string, any>;
}

export function useCampaign(slug: string) {
  const { toast } = useToast();

  const fetchCampaign = async (): Promise<Campaign | null> => {
    try {
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .single();
      
      if (error) {
        console.error('Error fetching campaign:', error);
        toast({
          title: 'Virhe',
          description: 'Kampanjan hakeminen epäonnistui.',
          variant: 'destructive',
        });
        return null;
      }
      
      if (data) {
        // Process the data and cast it to our Campaign type
        const campaign: Campaign = {
          ...data,
          type: data.type as 'influencer' | 'basic',
          recommended_services: Array.isArray(data.recommended_services) 
            ? data.recommended_services 
            : (typeof data.recommended_services === 'string' 
                ? JSON.parse(data.recommended_services) 
                : []),
          social_media_urls: typeof data.social_media_urls === 'object' 
            ? data.social_media_urls as Record<string, string>
            : {},
          content_blocks: Array.isArray(data.content_blocks) 
            ? data.content_blocks as Array<{ type: string; content?: string; url?: string; caption?: string }>
            : [],
          // Process new JSONB fields with proper type assertions
          influencer_stats: typeof data.influencer_stats === 'object' 
            ? data.influencer_stats as Record<string, any>
            : {},
          partner_logos: Array.isArray(data.partner_logos) 
            ? data.partner_logos as Array<{ name: string; url: string; logo_url: string }>
            : [],
          exclusive_offers: Array.isArray(data.exclusive_offers) 
            ? data.exclusive_offers as Array<{ title: string; description: string; discount?: string; expires_at?: string }>
            : [],
          pricing_table: Array.isArray(data.pricing_table) 
            ? data.pricing_table as Array<{ service: string; original_price: string; campaign_price: string; savings?: string }>
            : [],
          testimonials: Array.isArray(data.testimonials) 
            ? data.testimonials as Array<{ name: string; review: string; rating: number; image_url?: string }>
            : [],
          faq_items: Array.isArray(data.faq_items) 
            ? data.faq_items as Array<{ question: string; answer: string }>
            : [],
          gallery_images: Array.isArray(data.gallery_images) 
            ? data.gallery_images as Array<{ url: string; caption?: string; alt_text?: string }>
            : [],
          featured_products: Array.isArray(data.featured_products) 
            ? data.featured_products as Array<{ name: string; description?: string; price?: string; image?: string }>
            : [],
          custom_styles: typeof data.custom_styles === 'object' 
            ? data.custom_styles as Record<string, any>
            : {},
        };
        
        return campaign;
      }
      
      return null;
    } catch (err) {
      console.error('Error in campaign fetch:', err);
      toast({
        title: 'Virhe',
        description: 'Kampanjan hakeminen epäonnistui.',
        variant: 'destructive',
      });
      return null;
    }
  };

  return useQuery({
    queryKey: ['campaign', slug],
    queryFn: fetchCampaign,
    enabled: !!slug,
  });
}
