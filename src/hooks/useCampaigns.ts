
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Campaign } from './useCampaign';

export function useCampaigns() {
  const { toast } = useToast();

  const fetchCampaigns = async (): Promise<Campaign[]> => {
    try {
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching campaigns:', error);
        toast({
          title: 'Virhe',
          description: 'Kampanjoiden hakeminen epäonnistui.',
          variant: 'destructive',
        });
        throw new Error(error.message);
      }
      
      // Process each campaign data and cast it to our Campaign type
      return (data || []).map(item => {
        const campaign: Campaign = {
          ...item,
          type: item.type as 'influencer' | 'basic',
          recommended_services: Array.isArray(item.recommended_services) 
            ? item.recommended_services 
            : (typeof item.recommended_services === 'string' 
                ? JSON.parse(item.recommended_services) 
                : []),
          // Properly handle social_media_urls
          social_media_urls: typeof item.social_media_urls === 'object' 
            ? item.social_media_urls as Record<string, string>
            : {},
          // Properly handle content_blocks
          content_blocks: Array.isArray(item.content_blocks) 
            ? item.content_blocks as Array<{ type: string; content?: string; url?: string; caption?: string }>
            : [],
          // Process new JSONB fields with proper type assertions
          influencer_stats: typeof item.influencer_stats === 'object' 
            ? item.influencer_stats as Record<string, any>
            : {},
          partner_logos: Array.isArray(item.partner_logos) 
            ? item.partner_logos as Array<{ name: string; url: string; logo_url: string }>
            : [],
          exclusive_offers: Array.isArray(item.exclusive_offers) 
            ? item.exclusive_offers as Array<{ title: string; description: string; discount?: string; expires_at?: string }>
            : [],
          pricing_table: Array.isArray(item.pricing_table) 
            ? item.pricing_table as Array<{ service: string; original_price: string; campaign_price: string; savings?: string }>
            : [],
          testimonials: Array.isArray(item.testimonials) 
            ? item.testimonials as Array<{ name: string; review: string; rating: number; image_url?: string }>
            : [],
          faq_items: Array.isArray(item.faq_items) 
            ? item.faq_items as Array<{ question: string; answer: string }>
            : [],
          gallery_images: Array.isArray(item.gallery_images) 
            ? item.gallery_images as Array<{ url: string; caption?: string; alt_text?: string }>
            : [],
          featured_products: Array.isArray(item.featured_products) 
            ? item.featured_products as Array<{ name: string; description?: string; price?: string; image?: string }>
            : [],
          custom_styles: typeof item.custom_styles === 'object' 
            ? item.custom_styles as Record<string, any>
            : {},
        };
        
        return campaign;
      });
    } catch (err) {
      console.error('Error in campaigns fetch:', err);
      toast({
        title: 'Virhe',
        description: 'Kampanjoiden hakeminen epäonnistui.',
        variant: 'destructive',
      });
      throw err;
    }
  };

  return useQuery({
    queryKey: ['campaigns'],
    queryFn: fetchCampaigns,
  });
}
