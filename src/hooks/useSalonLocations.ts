
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface SalonLocation {
  id: string;
  name: string;
  address: string;
  city: string;
  postal_code?: string;
  latitude: number;
  longitude: number;
  phone?: string;
  email?: string;
  opening_hours: {
    mon_fri?: string;
    sat?: string;
    sun?: string;
  };
  description?: string;
  is_active: boolean;
  display_order: number;
  image_url?: string;
}

export const useSalonLocations = () => {
  return useQuery({
    queryKey: ['salon-locations'],
    queryFn: async (): Promise<SalonLocation[]> => {
      const { data, error } = await supabase
        .from('salon_locations')
        .select('*')
        .eq('is_active', true)
        .order('display_order');

      if (error) {
        console.error('Error fetching salon locations:', error);
        throw error;
      }

      return data?.map(salon => ({
        ...salon,
        opening_hours: salon.opening_hours as any || {}
      })) || [];
    },
  });
};
