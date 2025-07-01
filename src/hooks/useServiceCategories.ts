
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ServiceCategory {
  id: string;
  name: string;
  description: string;
  image_path?: string;
  slug?: string;
}

export function useServiceCategories() {
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchServiceCategories() {
      try {
        setIsLoading(true);
        
        // Ensure we have sample data
        await supabase.rpc('migrate_services_data');
        
        // Get distinct categories from services table by grouping
        const { data, error } = await supabase
          .from('service_categories')
          .select('*');
        
        if (error) {
          throw error;
        }

        if (data && data.length > 0) {
          console.log("Fetched service categories:", data);
          setCategories(data);
        } else {
          setCategories([]);
          toast({
            title: "Ei palvelukategorioita",
            description: "Palvelukategorioita ei ole vielä määritelty.",
            variant: "default",
          });
        }
      } catch (err: any) {
        console.error("Error fetching service categories:", err);
        setError(err instanceof Error ? err : new Error('Unknown error occurred'));
        
        toast({
          title: "Tietojen hakeminen epäonnistui",
          description: "Palvelukategorioiden lataaminen ei onnistunut.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }

    fetchServiceCategories();
  }, [toast]);

  return { categories, isLoading, error };
}
