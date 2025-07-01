
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Star, Eye, GripVertical } from 'lucide-react';

interface Service {
  id: string;
  name: string;
  description: string;
  price?: string;
  image_path?: string;
  featured?: boolean;
}

interface FeaturedService {
  id: string;
  service_id: string;
  display_order: number;
}

const FeaturedServicesList: React.FC = () => {
  const [featuredServices, setFeaturedServices] = useState<(FeaturedService & { service: Service })[]>([]);
  const [availableServices, setAvailableServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchFeaturedServices();
    fetchAvailableServices();
  }, []);

  const fetchFeaturedServices = async () => {
    try {
      const { data, error } = await supabase
        .from('best_services_web')
        .select(`
          id,
          service_id,
          display_order,
          services (
            id,
            name,
            description,
            price,
            image_path,
            featured
          )
        `)
        .order('display_order', { ascending: true });

      if (error) throw error;

      const formattedData = data?.map(item => ({
        id: item.id,
        service_id: item.service_id,
        display_order: item.display_order,
        service: item.services as Service
      })) || [];

      setFeaturedServices(formattedData);
    } catch (error) {
      console.error('Error fetching featured services:', error);
      toast({
        title: "Virhe",
        description: "Suositeltujen palveluiden hakeminen epäonnistui.",
        variant: "destructive"
      });
    }
  };

  const fetchAvailableServices = async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('id, name, description, price, image_path, featured')
        .order('name');

      if (error) throw error;
      setAvailableServices(data || []);
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToFeatured = async (serviceId: string) => {
    try {
      const maxOrder = Math.max(...featuredServices.map(fs => fs.display_order), -1);
      
      const { error } = await supabase
        .from('best_services_web')
        .insert({
          service_id: serviceId,
          display_order: maxOrder + 1
        });

      if (error) throw error;

      toast({
        title: "Lisätty",
        description: "Palvelu lisätty etusivun suosituksiin."
      });

      fetchFeaturedServices();
    } catch (error) {
      console.error('Error adding to featured:', error);
      toast({
        title: "Virhe",
        description: "Palvelun lisääminen epäonnistui.",
        variant: "destructive"
      });
    }
  };

  const removeFromFeatured = async (featuredServiceId: string) => {
    try {
      const { error } = await supabase
        .from('best_services_web')
        .delete()
        .eq('id', featuredServiceId);

      if (error) throw error;

      toast({
        title: "Poistettu",
        description: "Palvelu poistettu etusivun suosituksista."
      });

      fetchFeaturedServices();
    } catch (error) {
      console.error('Error removing from featured:', error);
      toast({
        title: "Virhe",
        description: "Palvelun poistaminen epäonnistui.",
        variant: "destructive"
      });
    }
  };

  const updateOrder = async (featuredServiceId: string, newOrder: number) => {
    try {
      const { error } = await supabase
        .from('best_services_web')
        .update({ display_order: newOrder })
        .eq('id', featuredServiceId);

      if (error) throw error;
      fetchFeaturedServices();
    } catch (error) {
      console.error('Error updating order:', error);
    }
  };

  const moveService = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= featuredServices.length) return;

    const current = featuredServices[index];
    const target = featuredServices[newIndex];

    updateOrder(current.id, target.display_order);
    updateOrder(target.id, current.display_order);
  };

  const nonFeaturedServices = availableServices.filter(
    service => !featuredServices.some(fs => fs.service_id === service.id)
  );

  if (loading) {
    return <div className="text-center py-8">Ladataan...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Current Featured Services */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            Etusivun suositellut palvelut ({featuredServices.length}/8)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {featuredServices.length === 0 ? (
            <p className="text-gray-400 text-center py-4">
              Ei suositeltuja palveluita valittuna.
            </p>
          ) : (
            <div className="space-y-3">
              {featuredServices.map((item, index) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 p-3 bg-gray-700 rounded-lg"
                >
                  {/* Order Controls */}
                  <div className="flex flex-col gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => moveService(index, 'up')}
                      disabled={index === 0}
                      className="h-6 w-6 p-0"
                    >
                      ↑
                    </Button>
                    <span className="text-xs text-gray-400 text-center">{index + 1}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => moveService(index, 'down')}
                      disabled={index === featuredServices.length - 1}
                      className="h-6 w-6 p-0"
                    >
                      ↓
                    </Button>
                  </div>

                  {/* Service Image */}
                  {item.service.image_path && (
                    <img
                      src={item.service.image_path}
                      alt={item.service.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                  )}

                  {/* Service Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-white truncate">{item.service.name}</h4>
                    <p className="text-sm text-gray-400">{item.service.price}</p>
                  </div>

                  {/* Remove Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeFromFeatured(item.id)}
                    className="text-red-400 border-red-400 hover:bg-red-900/20"
                  >
                    Poista
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Available Services to Add */}
      {featuredServices.length < 8 && (
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Lisää suositeltuihin</CardTitle>
          </CardHeader>
          <CardContent>
            {nonFeaturedServices.length === 0 ? (
              <p className="text-gray-400 text-center py-4">
                Kaikki palvelut on jo lisätty suositeltuihin.
              </p>
            ) : (
              <div className="grid gap-3">
                {nonFeaturedServices.map((service) => (
                  <div
                    key={service.id}
                    className="flex items-center gap-4 p-3 bg-gray-700 rounded-lg"
                  >
                    {service.image_path && (
                      <img
                        src={service.image_path}
                        alt={service.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-white truncate">{service.name}</h4>
                      <p className="text-sm text-gray-400">{service.price}</p>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addToFeatured(service.id)}
                      className="text-blondify-blue border-blondify-blue hover:bg-blondify-blue hover:text-white"
                    >
                      Lisää
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Preview Button */}
      <div className="text-center">
        <Button
          variant="outline"
          className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
          onClick={() => window.open('/', '_blank')}
        >
          <Eye className="h-4 w-4 mr-2" />
          Esikatsele etusivulla
        </Button>
      </div>
    </div>
  );
};

export default FeaturedServicesList;
