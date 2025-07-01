
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface SpecialistPortfolioImage {
  id: string;
  specialist_id: string;
  image_url: string;
  alt_text?: string;
  description?: string;
  display_order: number;
  created_at: string;
}

export const useSpecialistPortfolio = (specialistId: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    data: portfolioImages = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['specialist-portfolio', specialistId],
    queryFn: async (): Promise<SpecialistPortfolioImage[]> => {
      console.log('Fetching portfolio for specialist:', specialistId);
      
      const { data, error } = await supabase
        .from('portfolio_images')
        .select('id, specialist_id, image_url, description, display_order, created_at')
        .eq('specialist_id', specialistId)
        .order('display_order', { ascending: true });

      if (error) {
        console.error('Error fetching portfolio images:', error);
        throw error;
      }

      // Transform the data to match our interface
      const transformedData: SpecialistPortfolioImage[] = (data || []).map((item) => ({
        id: item.id,
        specialist_id: item.specialist_id,
        image_url: item.image_url,
        alt_text: undefined, // Table doesn't have this column
        description: item.description,
        display_order: item.display_order,
        created_at: item.created_at
      }));

      return transformedData;
    },
    enabled: !!specialistId,
  });

  const addImageMutation = useMutation({
    mutationFn: async (imageData: {
      image_url: string;
      alt_text?: string;
      description?: string;
      display_order?: number;
    }) => {
      console.log('Adding image for specialist:', specialistId, imageData);
      
      const maxOrder = portfolioImages.length > 0 
        ? Math.max(...portfolioImages.map(img => img.display_order)) 
        : 0;

      // Insert with the required specialist_id field
      const { data, error } = await supabase
        .from('portfolio_images')
        .insert({
          specialist_id: specialistId,
          image_url: imageData.image_url,
          description: imageData.description,
          display_order: imageData.display_order ?? maxOrder + 1,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['specialist-portfolio', specialistId] });
      toast({
        title: 'Kuva lisätty',
        description: 'Portfolio kuva lisätty onnistuneesti.',
      });
    },
    onError: (error) => {
      console.error('Error adding portfolio image:', error);
      toast({
        title: 'Virhe',
        description: 'Portfolio kuvan lisääminen epäonnistui.',
        variant: 'destructive',
      });
    },
  });

  const deleteImageMutation = useMutation({
    mutationFn: async (imageId: string) => {
      const { error } = await supabase
        .from('portfolio_images')
        .delete()
        .eq('id', imageId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['specialist-portfolio', specialistId] });
      toast({
        title: 'Kuva poistettu',
        description: 'Portfolio kuva poistettu onnistuneesti.',
      });
    },
    onError: (error) => {
      console.error('Error deleting portfolio image:', error);
      toast({
        title: 'Virhe',
        description: 'Portfolio kuvan poistaminen epäonnistui.',
        variant: 'destructive',
      });
    },
  });

  const updateImageMutation = useMutation({
    mutationFn: async ({ imageId, updates }: { 
      imageId: string; 
      updates: Partial<SpecialistPortfolioImage> 
    }) => {
      // Only update fields that exist in the table
      const tableUpdates: any = {};
      if (updates.image_url) tableUpdates.image_url = updates.image_url;
      if (updates.description !== undefined) tableUpdates.description = updates.description;
      if (updates.display_order !== undefined) tableUpdates.display_order = updates.display_order;

      const { data, error } = await supabase
        .from('portfolio_images')
        .update(tableUpdates)
        .eq('id', imageId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['specialist-portfolio', specialistId] });
      toast({
        title: 'Kuva päivitetty',
        description: 'Portfolio kuva päivitetty onnistuneesti.',
      });
    },
    onError: (error) => {
      console.error('Error updating portfolio image:', error);
      toast({
        title: 'Virhe',
        description: 'Portfolio kuvan päivittäminen epäonnistui.',
        variant: 'destructive',
      });
    },
  });

  return {
    portfolioImages,
    isLoading,
    error,
    addImage: addImageMutation.mutate,
    deleteImage: deleteImageMutation.mutate,
    updateImage: updateImageMutation.mutate,
    isAdding: addImageMutation.isPending,
    isDeleting: deleteImageMutation.isPending,
    isUpdating: updateImageMutation.isPending,
  };
};
