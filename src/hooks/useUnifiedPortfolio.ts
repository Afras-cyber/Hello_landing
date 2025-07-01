import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface UnifiedPortfolioImage {
  id: string;
  image_url: string;
  source_type: 'portfolio' | 'client_showcase' | 'homepage';
  category?: string;
  alt_text?: string;
  display_order: number;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

export type UnifiedPortfolioImageInsert = Pick<UnifiedPortfolioImage, 'image_url' | 'source_type'> & 
  Partial<Pick<UnifiedPortfolioImage, 'category' | 'alt_text' | 'display_order' | 'is_featured'>>;

export const useUnifiedPortfolio = () => {
  return useQuery({
    queryKey: ['unified-portfolio'],
    queryFn: async (): Promise<UnifiedPortfolioImage[]> => {
      const { data, error } = await supabase
        .from('unified_portfolio')
        .select('*')
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return (data as UnifiedPortfolioImage[]) || [];
    },
  });
};

export const useAddUnifiedPortfolioImage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (imageData: UnifiedPortfolioImageInsert) => {
      const { data, error } = await supabase
        .from('unified_portfolio')
        .insert(imageData)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unified-portfolio'] });
      queryClient.invalidateQueries({ queryKey: ['portfolio-storage-images'] });
    },
  });
};

export const useDeleteUnifiedPortfolioImage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { data: imageToDelete, error: getError } = await supabase
        .from('unified_portfolio')
        .select('image_url')
        .eq('id', id)
        .single();

      if (getError) {
        console.error('Could not find image to delete from DB:', getError.message);
      }

      const { error: deleteError } = await supabase
        .from('unified_portfolio')
        .delete()
        .eq('id', id);
      
      if (deleteError) throw deleteError;

      if (imageToDelete?.image_url) {
        try {
          const imageUrl = new URL(imageToDelete.image_url);
          const pathSegments = imageUrl.pathname.split('/');
          const bucketName = pathSegments[5];
          const filePath = pathSegments.slice(6).join('/');
          
          if (bucketName && filePath) {
            const { error: storageError } = await supabase.storage
              .from(bucketName)
              .remove([filePath]);

            if (storageError) {
              console.warn(`DB record deleted, but failed to delete from storage.`, storageError);
            }
          }
        } catch(e) {
          console.error("Could not parse image_url to delete from storage", e);
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unified-portfolio'] });
      queryClient.invalidateQueries({ queryKey: ['portfolio-storage-images'] });
    },
  });
};

export const useUpdateUnifiedPortfolioImage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updateData }: Partial<UnifiedPortfolioImage> & { id: string }) => {
      const { data, error } = await supabase
        .from('unified_portfolio')
        .update({
          ...updateData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unified-portfolio'] });
    },
  });
};
