
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const usePageSectionsCount = () => {
  return useQuery({
    queryKey: ['page-sections-count'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('page_sections')
        .select('page_id, id')
        .eq('is_active', true);
      
      if (error) throw error;
      
      // Group by page_id and count sections
      const sectionCounts: Record<string, number> = {};
      data?.forEach(section => {
        sectionCounts[section.page_id] = (sectionCounts[section.page_id] || 0) + 1;
      });
      
      return {
        totalSections: data?.length || 0,
        sectionsByPage: sectionCounts
      };
    }
  });
};
