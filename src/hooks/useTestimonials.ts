
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Testimonial {
  id: string;
  name: string;
  text: string;
  rating: number;
  service: string;
  avatar?: string;
  created_at: string;
}

export function useTestimonials() {
  return useQuery({
    queryKey: ['testimonials'],
    queryFn: async (): Promise<Testimonial[]> => {
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .eq('is_published', true)
        .order('display_order', { ascending: true });
      
      if (error) {
        console.error('Error fetching testimonials:', error);
        throw error;
      }
      
      // Log the raw data to see what we're getting
      console.log('Raw testimonials data:', data);
      
      // Map the database fields to our interface
      const mappedData = (data || []).map(item => {
        console.log('Mapping testimonial item:', item);
        return {
          id: item.id,
          name: item.customer_name,
          text: item.testimonial_text || '', // Ensure we always have a string
          rating: item.rating,
          service: item.service_type,
          avatar: item.customer_image,
          created_at: item.created_at
        };
      });
      
      console.log('Mapped testimonials data:', mappedData);
      return mappedData;
    },
  });
}
