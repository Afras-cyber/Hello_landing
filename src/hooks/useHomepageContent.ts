
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface HomepageSection {
  id: string;
  section_name: string;
  content: any;
  is_active: boolean;
  display_order: number;
  image_url?: string;
  background_url?: string;
  link_url?: string;
  button_text?: string;
  color_scheme?: any;
  layout_settings?: any;
  created_at: string;
  updated_at: string;
}

export const useHomepageContent = () => {
  return useQuery({
    queryKey: ['homepage-content'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('homepage_content')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      return data as HomepageSection[];
    }
  });
};

export const useUpdateHomepageSection = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<HomepageSection> }) => {
      const { error } = await supabase
        .from('homepage_content')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homepage-content'] });
      toast({
        title: "Tallennettu",
        description: "Muutokset tallennettu onnistuneesti.",
      });
    },
    onError: (error) => {
      console.error('Error updating homepage section:', error);
      toast({
        title: "Virhe",
        description: "Tallentaminen epäonnistui.",
        variant: "destructive"
      });
    }
  });
};

export const useToggleSectionActive = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from('homepage_content')
        .update({ is_active })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homepage-content'] });
      toast({
        title: "Päivitetty",
        description: "Osion näkyvyys päivitetty.",
      });
    }
  });
};

export const useUpdateSectionOrder = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (sections: { id: string; display_order: number }[]) => {
      const updates = sections.map(section => 
        supabase
          .from('homepage_content')
          .update({ display_order: section.display_order })
          .eq('id', section.id)
      );

      const results = await Promise.all(updates);
      const errors = results.filter(result => result.error);
      
      if (errors.length > 0) {
        throw new Error('Failed to update section order');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homepage-content'] });
      toast({
        title: "Järjestys päivitetty",
        description: "Osioiden järjestys tallennettu.",
      });
    }
  });
};
