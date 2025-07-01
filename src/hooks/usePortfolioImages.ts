
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface PortfolioImage {
  id: string;
  image_url: string;
  category?: string;
  alt_text?: string;
  created_at: string;
}

export const usePortfolioImages = () => {
  return useQuery({
    queryKey: ['portfolio-images'],
    queryFn: async (): Promise<PortfolioImage[]> => {
      const { data, error } = await supabase
        .from('portfolio')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return data || [];
    },
  });
};
