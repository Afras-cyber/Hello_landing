
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface GlobalSetting {
  id: string;
  key: string;
  value: any;
  category: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export const useGlobalSettings = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const settingsQuery = useQuery({
    queryKey: ['global-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('global_settings')
        .select('*')
        .order('category, key');
      
      if (error) throw error;
      return data as GlobalSetting[];
    }
  });

  const updateSetting = useMutation({
    mutationFn: async ({ key, value, category }: { key: string; value: any; category: string }) => {
      const { error } = await supabase
        .from('global_settings')
        .upsert({ 
          key, 
          value, 
          category,
          updated_at: new Date().toISOString() 
        }, {
          onConflict: 'key'
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['global-settings'] });
      toast({
        title: "Asetus päivitetty",
        description: "Asetus on tallennettu onnistuneesti."
      });
    },
    onError: () => {
      toast({
        title: "Virhe",
        description: "Asetuksen tallentaminen epäonnistui.",
        variant: "destructive"
      });
    }
  });

  const getSetting = (key: string, defaultValue?: any) => {
    const setting = settingsQuery.data?.find(s => s.key === key);
    const value = setting?.value ?? defaultValue;

    // Handle cases where a value might be an object like { "value": "..." }
    if (typeof value === 'object' && value !== null && 'value' in value && Object.keys(value).length === 1) {
      return value.value;
    }

    return value;
  };

  const getSettingsByCategory = (category: string) => {
    return settingsQuery.data?.filter(s => s.category === category) || [];
  };

  return {
    settings: settingsQuery.data || [],
    isLoading: settingsQuery.isLoading,
    updateSetting: updateSetting.mutate,
    getSetting,
    getSettingsByCategory
  };
};
