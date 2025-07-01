
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Service {
  id: string;
  name: string;
  description: string;
  image_path: string;
  price?: string;
  slug?: string;
  service_type?: string;
  category_id?: string;
  featured?: boolean;
  has_landing_page?: boolean;
  landing_page_content?: any;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
}

export function useServicesByType(type?: string) {
  const { toast } = useToast();

  const fetchServices = async (): Promise<Service[]> => {
    try {
      console.log('Fetching services by type:', type || 'all');
      let query = supabase
        .from('services')
        .select('*');
      
      if (type && type !== 'all') {
        query = query.eq('service_type', type);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching services:', error);
        toast({
          title: "Virhe",
          description: "Palveluiden hakeminen epäonnistui.",
          variant: "destructive",
        });
        throw new Error(error.message);
      }
      
      console.log('Services fetched successfully:', data?.length || 0);
      return data || [];
    } catch (err) {
      console.error('Error in services fetch:', err);
      toast({
        title: "Virhe",
        description: "Palveluiden hakeminen epäonnistui.",
        variant: "destructive",
      });
      throw err;
    }
  };

  return useQuery({
    queryKey: ['services', type],
    queryFn: fetchServices,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
  });
}
