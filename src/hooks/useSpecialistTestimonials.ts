
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface SpecialistTestimonial {
  id: string;
  specialist_id: string;
  customer_name: string;
  customer_age?: number;
  testimonial_text: string;
  image_url?: string;
  is_featured: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export const useSpecialistTestimonials = (specialistId: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    data: testimonials = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['specialist-testimonials', specialistId],
    queryFn: async (): Promise<SpecialistTestimonial[]> => {
      const { data, error } = await supabase
        .from('specialist_testimonials')
        .select('*')
        .eq('specialist_id', specialistId)
        .order('display_order', { ascending: true });

      if (error) {
        console.error('Error fetching specialist testimonials:', error);
        throw error;
      }

      return data || [];
    },
    enabled: !!specialistId,
  });

  const addTestimonialMutation = useMutation({
    mutationFn: async (testimonialData: {
      customer_name: string;
      customer_age?: number;
      testimonial_text: string;
      image_url?: string;
      is_featured?: boolean;
    }) => {
      const maxOrder = testimonials.length > 0 
        ? Math.max(...testimonials.map(t => t.display_order)) 
        : 0;

      const { data, error } = await supabase
        .from('specialist_testimonials')
        .insert({
          specialist_id: specialistId,
          customer_name: testimonialData.customer_name,
          customer_age: testimonialData.customer_age,
          testimonial_text: testimonialData.testimonial_text,
          image_url: testimonialData.image_url,
          is_featured: testimonialData.is_featured || false,
          display_order: maxOrder + 1,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['specialist-testimonials', specialistId] });
      toast({
        title: 'Asiakaspalaute lisätty',
        description: 'Asiakaspalaute lisätty onnistuneesti.',
      });
    },
    onError: (error) => {
      console.error('Error adding testimonial:', error);
      toast({
        title: 'Virhe',
        description: 'Asiakaspalautteen lisääminen epäonnistui.',
        variant: 'destructive',
      });
    },
  });

  const deleteTestimonialMutation = useMutation({
    mutationFn: async (testimonialId: string) => {
      const { error } = await supabase
        .from('specialist_testimonials')
        .delete()
        .eq('id', testimonialId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['specialist-testimonials', specialistId] });
      toast({
        title: 'Asiakaspalaute poistettu',
        description: 'Asiakaspalaute poistettu onnistuneesti.',
      });
    },
    onError: (error) => {
      console.error('Error deleting testimonial:', error);
      toast({
        title: 'Virhe',
        description: 'Asiakaspalautteen poistaminen epäonnistui.',
        variant: 'destructive',
      });
    },
  });

  const updateTestimonialMutation = useMutation({
    mutationFn: async ({ testimonialId, updates }: { 
      testimonialId: string; 
      updates: Partial<SpecialistTestimonial> 
    }) => {
      const { data, error } = await supabase
        .from('specialist_testimonials')
        .update(updates)
        .eq('id', testimonialId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['specialist-testimonials', specialistId] });
      toast({
        title: 'Asiakaspalaute päivitetty',
        description: 'Asiakaspalaute päivitetty onnistuneesti.',
      });
    },
    onError: (error) => {
      console.error('Error updating testimonial:', error);
      toast({
        title: 'Virhe',
        description: 'Asiakaspalautteen päivittäminen epäonnistui.',
        variant: 'destructive',
      });
    },
  });

  return {
    testimonials,
    isLoading,
    error,
    addTestimonial: addTestimonialMutation.mutate,
    deleteTestimonial: deleteTestimonialMutation.mutate,
    updateTestimonial: updateTestimonialMutation.mutate,
    isAdding: addTestimonialMutation.isPending,
    isDeleting: deleteTestimonialMutation.isPending,
    isUpdating: updateTestimonialMutation.isPending,
  };
};
