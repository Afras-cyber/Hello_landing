
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface BestService {
  id: string;
  name: string;
  description: string;
  image_path: string;
  price?: string;
  slug?: string;
  featured?: boolean;
}

export function useBestServices() {
  const { toast } = useToast();

  const fetchBestServices = async (): Promise<BestService[]> => {
    try {
      console.log('Fetching best services from best_services_web table');
      
      // Step 1: First fetch the best services IDs from the best_services_web table
      const { data: bestServiceIds, error: bestServiceError } = await supabase
        .from('best_services_web')
        .select('service_id, display_order')
        .order('display_order', { ascending: true });
      
      if (bestServiceError) {
        console.error('Error fetching best service IDs:', bestServiceError);
        toast({
          title: 'Virhe',
          description: 'Parhaiden palveluiden hakeminen epäonnistui.',
          variant: 'destructive',
        });
        throw new Error(bestServiceError.message);
      }
      
      if (!bestServiceIds || bestServiceIds.length === 0) {
        console.log('No best services configured in the database');
        return [];
      }
      
      // Step 2: Extract service IDs
      const serviceIds = bestServiceIds
        .filter(item => item.service_id)
        .map(item => item.service_id);
      
      console.log('Service IDs from best_services_web:', serviceIds);
      
      if (serviceIds.length === 0) {
        return [];
      }
      
      // Step 3: Fetch the actual service details using the IDs
      const { data: services, error: servicesError } = await supabase
        .from('services')
        .select('id, name, description, image_path, price, slug, featured')
        .in('id', serviceIds);
      
      if (servicesError) {
        console.error('Error fetching service details:', servicesError);
        toast({
          title: 'Virhe',
          description: 'Palveluiden tietojen hakeminen epäonnistui.',
          variant: 'destructive',
        });
        throw new Error(servicesError.message);
      }
      
      if (!services || services.length === 0) {
        console.log('No services found with the given IDs');
        return [];
      }
      
      console.log('Retrieved services data:', services);
      
      // Step 4: Map the services to our expected format and sort them based on the display_order
      const bestServices = serviceIds.map(serviceId => {
        // Find the service with this ID
        const service = services.find(s => s.id === serviceId);
        
        // Find the display order of this service
        const orderItem = bestServiceIds.find(item => item.service_id === serviceId);
        const displayOrder = orderItem ? orderItem.display_order : 999;
        
        if (service) {
          return {
            id: service.id || '',
            name: service.name || '',
            description: service.description || '',
            image_path: service.image_path || '/placeholder.svg',
            price: service.price,
            slug: service.slug,
            featured: service.featured || false,
            displayOrder
          };
        }
        
        // Return a placeholder if the service wasn't found
        return null;
      })
      .filter(Boolean) // Remove any null values
      .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)); // Sort by display_order
      
      console.log('Processed and sorted best services:', bestServices);
      return bestServices;
    } catch (err) {
      console.error('Error fetching best services:', err);
      toast({
        title: 'Virhe',
        description: 'Palveluiden hakeminen epäonnistui.',
        variant: 'destructive',
      });
      throw err;
    }
  };

  return useQuery({
    queryKey: ['bestServices'],
    queryFn: fetchBestServices,
  });
}
