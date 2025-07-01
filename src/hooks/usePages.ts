
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Page {
  id: string;
  slug: string;
  title: string;
  description?: string;
  is_active: boolean;
  is_system_page: boolean;
  created_at: string;
  updated_at: string;
}

interface PageSection {
  id: string;
  page_id: string;
  section_key: string;
  section_name: string;
  content_type: string;
  content: any;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const usePages = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const pagesQuery = useQuery({
    queryKey: ['pages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pages')
        .select('*')
        .order('title');
      
      if (error) throw error;
      return data as Page[];
    }
  });

  const updatePageStatus = useMutation({
    mutationFn: async ({ pageId, isActive }: { pageId: string; isActive: boolean }) => {
      const { error } = await supabase
        .from('pages')
        .update({ is_active: isActive })
        .eq('id', pageId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pages'] });
      toast({
        title: "Sivu päivitetty",
        description: "Sivun tila on päivitetty onnistuneesti."
      });
    },
    onError: () => {
      toast({
        title: "Virhe",
        description: "Sivun tilan päivittäminen epäonnistui.",
        variant: "destructive"
      });
    }
  });

  return {
    pages: pagesQuery.data || [],
    isLoading: pagesQuery.isLoading,
    updatePageStatus: updatePageStatus.mutate
  };
};

export const usePageSections = (pageId: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const sectionsQuery = useQuery({
    queryKey: ['page-sections', pageId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('page_sections')
        .select('*')
        .eq('page_id', pageId)
        .order('display_order');
      
      if (error) throw error;
      return data as PageSection[];
    },
    enabled: !!pageId
  });

  const updateSection = useMutation({
    mutationFn: async ({ sectionId, content }: { sectionId: string; content: any }) => {
      const { error } = await supabase
        .from('page_sections')
        .update({ content, updated_at: new Date().toISOString() })
        .eq('id', sectionId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['page-sections', pageId] });
      toast({
        title: "Sisältö tallennettu",
        description: "Sisältöblokki on päivitetty onnistuneesti."
      });
    },
    onError: () => {
      toast({
        title: "Virhe",
        description: "Sisällön tallentaminen epäonnistui.",
        variant: "destructive"
      });
    }
  });

  const toggleSectionStatus = useMutation({
    mutationFn: async ({ sectionId, isActive }: { sectionId: string; isActive: boolean }) => {
      const { error } = await supabase
        .from('page_sections')
        .update({ is_active: isActive })
        .eq('id', sectionId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['page-sections', pageId] });
      toast({
        title: "Osio päivitetty",
        description: "Osion tila on päivitetty onnistuneesti."
      });
    }
  });

  return {
    sections: sectionsQuery.data || [],
    isLoading: sectionsQuery.isLoading,
    updateSection: updateSection.mutate,
    toggleSectionStatus: toggleSectionStatus.mutate
  };
};
