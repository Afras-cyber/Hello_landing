
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category?: string;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export const useFaqItems = () => {
  return useQuery({
    queryKey: ['faq-items'],
    queryFn: async (): Promise<FaqItem[]> => {
      const { data, error } = await supabase
        .from('faq_items')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) {
        console.error('Error fetching FAQ items:', error);
        throw error;
      }

      return data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
};
