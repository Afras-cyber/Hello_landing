
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ArticleImage {
  id: string;
  article_id: string;
  image_url: string;
  alt_text?: string;
  display_order: number;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
}

export function useArticleImages(articleId: string) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: images = [], isLoading, error } = useQuery({
    queryKey: ['article-images', articleId],
    queryFn: async (): Promise<ArticleImage[]> => {
      if (!articleId) return [];
      
      const { data, error } = await supabase
        .from('article_images')
        .select('*')
        .eq('article_id', articleId)
        .order('display_order', { ascending: true });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!articleId,
  });

  const addImageMutation = useMutation({
    mutationFn: async ({ imageUrl, altText, isPrimary }: { 
      imageUrl: string; 
      altText?: string; 
      isPrimary?: boolean;
    }) => {
      const maxOrder = Math.max(...images.map(img => img.display_order), -1);
      
      const { data, error } = await supabase
        .from('article_images')
        .insert({
          article_id: articleId,
          image_url: imageUrl,
          alt_text: altText,
          display_order: maxOrder + 1,
          is_primary: isPrimary || images.length === 0
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['article-images', articleId] });
      toast({
        title: 'Kuva lisätty',
        description: 'Kuva lisättiin onnistuneesti artikkeliin.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Virhe',
        description: `Kuvan lisääminen epäonnistui: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  const updateImageMutation = useMutation({
    mutationFn: async ({ imageId, updates }: { 
      imageId: string; 
      updates: Partial<ArticleImage>;
    }) => {
      const { data, error } = await supabase
        .from('article_images')
        .update(updates)
        .eq('id', imageId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['article-images', articleId] });
    },
  });

  const deleteImageMutation = useMutation({
    mutationFn: async (imageId: string) => {
      const { error } = await supabase
        .from('article_images')
        .delete()
        .eq('id', imageId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['article-images', articleId] });
      toast({
        title: 'Kuva poistettu',
        description: 'Kuva poistettiin onnistuneesti.',
      });
    },
  });

  const reorderImagesMutation = useMutation({
    mutationFn: async (reorderedImages: ArticleImage[]) => {
      const updates = reorderedImages.map((img, index) => 
        supabase
          .from('article_images')
          .update({ display_order: index })
          .eq('id', img.id)
      );
      
      await Promise.all(updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['article-images', articleId] });
    },
  });

  return {
    images,
    isLoading,
    error,
    addImage: addImageMutation.mutateAsync,
    updateImage: updateImageMutation.mutateAsync,
    deleteImage: deleteImageMutation.mutateAsync,
    reorderImages: reorderImagesMutation.mutateAsync,
    isAddingImage: addImageMutation.isPending,
  };
}
