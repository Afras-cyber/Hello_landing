
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Career {
  id: string;
  title: string;
  location: string;
  type: string;
  description: string;
  created_at: string;
}

export function useCareers() {
  const { toast } = useToast();

  const fetchCareers = async (): Promise<Career[]> => {
    try {
      const { data, error } = await supabase
        .from('careers')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching careers:', error);
        toast({
          title: 'Virhe',
          description: 'Työpaikkojen hakeminen epäonnistui.',
          variant: 'destructive',
        });
        throw new Error(error.message);
      }
      
      return data || [];
    } catch (err) {
      console.error('Error in careers fetch:', err);
      toast({
        title: 'Virhe',
        description: 'Työpaikkojen hakeminen epäonnistui.',
        variant: 'destructive',
      });
      throw err;
    }
  };

  return useQuery({
    queryKey: ['careers'],
    queryFn: fetchCareers,
  });
}
