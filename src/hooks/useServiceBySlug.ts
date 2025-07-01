
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Service } from './useServicesByType';

export function useServiceBySlug(slug?: string) {
  const { toast } = useToast();

  const fetchService = async (): Promise<Service | null> => {
    if (!slug) return null;
    
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('slug', slug)
        .single();
      
      if (error) {
        console.error('Error fetching service:', error);
        toast({
          title: 'Virhe',
          description: 'Palvelun hakeminen epäonnistui.',
          variant: 'destructive',
        });
        throw new Error(error.message);
      }
      
      return data;
    } catch (err) {
      console.error('Error in service fetch:', err);
      toast({
        title: 'Virhe',
        description: 'Palvelun hakeminen epäonnistui.',
        variant: 'destructive',
      });
      throw err;
    }
  };

  return useQuery({
    queryKey: ['service', slug],
    queryFn: fetchService,
    enabled: !!slug
  });
}
