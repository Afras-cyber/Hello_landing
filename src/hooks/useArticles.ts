
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Article {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  imageUrl: string;
  date: string;
  slug: string;
  created_at: string;
}

export function useArticles() {
  const { toast } = useToast();

  const fetchArticles = async (): Promise<Article[]> => {
    console.log('🔍 Fetching articles from database...');
    
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .order('created_at', { ascending: false });
    
    console.log('📡 Supabase articles response:', { data, error });
    
    if (error) {
      console.error('❌ Error fetching articles:', error);
      toast({
        title: 'Virhe',
        description: 'Artikkeleiden hakeminen epäonnistui.',
        variant: 'destructive',
      });
      throw new Error(error.message);
    }
    
    if (!data || data.length === 0) {
      console.log('⚠️ No articles found in database');
      return [];
    }
    
    // Transform the database columns to match our interface
    const articles: Article[] = data.map(article => ({
      id: article.id,
      title: article.title || '',
      excerpt: article.excerpt || '',
      content: article.content || '',
      imageUrl: article.imageurl || '', // Note: database column is 'imageurl', not 'imageUrl'
      date: article.date || '',
      slug: article.slug || '',
      created_at: article.created_at || ''
    }));
    
    console.log('✅ Transformed articles:', articles);
    
    return articles;
  };

  return useQuery({
    queryKey: ['articles'],
    queryFn: fetchArticles,
    retry: 3,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
