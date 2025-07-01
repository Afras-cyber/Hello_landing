
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type PageContentData = { text: string; type: string; content?: any };
export type PageContent = Record<string, PageContentData>;

export const usePageContent = (pageSlug: string) => {
  return useQuery({
    queryKey: ['page-content', pageSlug],
    queryFn: async (): Promise<PageContent> => {
      // First get the page ID
      const { data: page, error: pageError } = await supabase
        .from('pages')
        .select('id')
        .eq('slug', pageSlug)
        .eq('is_active', true)
        .single();

      if (pageError || !page) {
        console.log(`Page not found: ${pageSlug}`);
        return {};
      }

      // Then get the sections
      const { data: sections, error: sectionsError } = await supabase
        .from('page_sections')
        .select('*')
        .eq('page_id', page.id)
        .eq('is_active', true)
        .order('display_order');

      if (sectionsError) {
        console.error('Error fetching page sections:', sectionsError);
        return {};
      }

      // Convert to object with section_key as key
      const contentMap = (sections || []).reduce((acc, section) => {
        let textContent = '';
        let fullContent: any = null;

        if (section.content_type === 'json') {
          fullContent = section.content;
          textContent = ''; // No simple text representation
        } else {
          if (section.content && typeof section.content === 'object' && 'text' in section.content) {
            textContent = (section.content as { text: string }).text;
          } else if (typeof section.content === 'string') {
            textContent = section.content;
          }
        }
        
        acc[section.section_key] = {
          text: textContent,
          type: section.content_type,
          content: fullContent,
        };
        return acc;
      }, {} as PageContent);

      return contentMap;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
};

// Helper function to get content with fallback
export const getPageContent = (content: PageContent | undefined, key: string, fallback: any): PageContentData => {
  if (!content || !content[key]) {
    if (typeof fallback === 'string') {
      return { text: fallback, type: 'text' };
    }
    // Assume it's a json fallback
    return { text: '', type: 'json', content: fallback };
  }
  return content[key];
};
