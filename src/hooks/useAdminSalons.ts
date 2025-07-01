
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SalonLocation {
  id: string;
  name: string;
  address: string;
  city: string;
  postal_code?: string;
  latitude: number;
  longitude: number;
  phone?: string;
  email?: string;
  opening_hours: object;
  description?: string;
  is_active: boolean;
  display_order: number;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

export const useAdminSalons = () => {
  return useQuery({
    queryKey: ['admin-salons'],
    queryFn: async (): Promise<SalonLocation[]> => {
      const { data, error } = await supabase
        .from('salon_locations')
        .select('*')
        .order('display_order');

      if (error) throw error;
      return data?.map(salon => ({
        ...salon,
        opening_hours: salon.opening_hours as any || {}
      })) || [];
    },
  });
};

export const useCreateSalon = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (salon: Omit<SalonLocation, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('salon_locations')
        .insert({
          name: salon.name,
          address: salon.address,
          city: salon.city,
          postal_code: salon.postal_code,
          latitude: salon.latitude,
          longitude: salon.longitude,
          phone: salon.phone,
          email: salon.email,
          opening_hours: salon.opening_hours as any,
          description: salon.description,
          is_active: salon.is_active,
          display_order: salon.display_order,
          image_url: salon.image_url
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-salons'] });
      queryClient.invalidateQueries({ queryKey: ['salon-locations'] });
      toast({
        title: 'Kampaamo lisätty',
        description: 'Uusi kampaamo on lisätty onnistuneesti.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Virhe',
        description: `Kampaamon lisääminen epäonnistui: ${error.message}`,
        variant: 'destructive',
      });
    },
  });
};

export const useUpdateSalon = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<SalonLocation> & { id: string }) => {
      const updateData: any = {};
      
      if (updates.name !== undefined) updateData.name = updates.name;
      if (updates.address !== undefined) updateData.address = updates.address;
      if (updates.city !== undefined) updateData.city = updates.city;
      if (updates.postal_code !== undefined) updateData.postal_code = updates.postal_code;
      if (updates.latitude !== undefined) updateData.latitude = updates.latitude;
      if (updates.longitude !== undefined) updateData.longitude = updates.longitude;
      if (updates.phone !== undefined) updateData.phone = updates.phone;
      if (updates.email !== undefined) updateData.email = updates.email;
      if (updates.opening_hours !== undefined) updateData.opening_hours = updates.opening_hours;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.is_active !== undefined) updateData.is_active = updates.is_active;
      if (updates.display_order !== undefined) updateData.display_order = updates.display_order;
      if (updates.image_url !== undefined) updateData.image_url = updates.image_url;

      const { data, error } = await supabase
        .from('salon_locations')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-salons'] });
      queryClient.invalidateQueries({ queryKey: ['salon-locations'] });
      toast({
        title: 'Kampaamo päivitetty',
        description: 'Kampaamon tiedot on päivitetty onnistuneesti.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Virhe',
        description: `Kampaamon päivittäminen epäonnistui: ${error.message}`,
        variant: 'destructive',
      });
    },
  });
};

export const useDeleteSalon = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('salon_locations')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-salons'] });
      queryClient.invalidateQueries({ queryKey: ['salon-locations'] });
      toast({
        title: 'Kampaamo poistettu',
        description: 'Kampaamo on poistettu onnistuneesti.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Virhe',
        description: `Kampaamon poistaminen epäonnistui: ${error.message}`,
        variant: 'destructive',
      });
    },
  });
};
