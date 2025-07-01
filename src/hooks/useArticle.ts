
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Article } from './useArticles';

export function useArticle(slug: string) {
  const { toast } = useToast();

  const fetchArticle = async (): Promise<Article | null> => {
    console.log('🔍 Fetching article with slug:', slug);
    
    if (!slug) {
      console.log('❌ No article slug provided');
      return null;
    }

    console.log('📡 Making Supabase query for article:', slug);
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();
    
    console.log('📡 Supabase response:', { data, error });
    
    if (error) {
      console.error('❌ Error fetching article:', error);
      toast({
        title: 'Virhe',
        description: 'Artikkelin hakeminen epäonnistui.',
        variant: 'destructive',
      });
      return null;
    }
    
    if (!data) {
      console.log('❌ Article not found with slug:', slug);
      return null;
    }
    
    console.log('✅ Article fetched successfully:', data);
    
    // Transform the database columns to match our interface
    const article: Article = {
      id: data.id,
      title: data.title || '',
      excerpt: data.excerpt || '',
      content: data.content || '',
      imageUrl: data.imageurl || '', // Note: database column is 'imageurl'
      date: data.date || '',
      slug: data.slug || '',
      created_at: data.created_at || ''
    };
    
    console.log('✅ Transformed article:', article);
    
    return article;
  };

  return useQuery({
    queryKey: ['article', slug],
    queryFn: fetchArticle,
    enabled: !!slug,
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
