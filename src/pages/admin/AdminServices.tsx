import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Plus, Loader2 } from 'lucide-react';
import DeleteConfirmation from '@/components/admin/DeleteConfirmation';
import ServiceForm from '@/components/admin/ServiceForm';
import ServiceCard from '@/components/admin/ServiceCard';
import ServiceFilters from '@/components/admin/ServiceFilters';
import FeaturedServicesList from '@/components/admin/FeaturedServicesList';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';

interface Service {
  id: string;
  name: string;
  description: string;
  price?: string;
  image_path?: string;
  service_type?: string;
  category_id?: string;
  featured?: boolean;
  slug?: string;
  has_landing_page?: boolean;
}

interface ServiceCategory {
  id: string;
  name: string;
}

const AdminServices: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [featuredFilter, setFeaturedFilter] = useState('all');
  
  const { toast } = useToast();
  const [deletingService, setDeletingService] = useState<Service | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  useEffect(() => {
    checkAdminStatus();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [services, searchTerm, selectedCategory, featuredFilter]);

  const applyFilters = () => {
    let filtered = [...services];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(service =>
        service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(service => service.category_id === selectedCategory);
    }

    // Featured filter
    if (featuredFilter === 'featured') {
      filtered = filtered.filter(service => service.featured);
    } else if (featuredFilter === 'not-featured') {
      filtered = filtered.filter(service => !service.featured);
    }

    setFilteredServices(filtered);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setFeaturedFilter('all');
  };

  const hasActiveFilters = Boolean(searchTerm || selectedCategory !== 'all' || featuredFilter !== 'all');

  const checkAdminStatus = async () => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (!sessionData.session) {
        console.log('No active session found');
        setIsAdmin(false);
        navigate('/admin/login');
        return;
      }
      
      const { data: adminData, error } = await supabase.rpc('is_admin');
      
      if (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
        navigate('/admin/login');
        return;
      }
      
      setIsAdmin(adminData);
      
      if (adminData) {
        fetchData();
      } else {
        console.log('User is not an admin');
        navigate('/admin/login');
      }
    } catch (error) {
      console.error('Error checking authentication:', error);
      setIsAdmin(false);
      navigate('/admin/login');
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      console.log('Fetching services and categories as admin...');
      
      const [servicesResponse, categoriesResponse] = await Promise.all([
        supabase
          .from('services')
          .select('*')
          .order('created_at', { ascending: false }),
        supabase
          .from('service_categories')
          .select('id, name')
      ]);
      
      if (servicesResponse.error) {
        console.error('Error fetching services:', servicesResponse.error);
        toast({
          title: "Virhe",
          description: "Palveluiden hakeminen epäonnistui.",
          variant: "destructive"
        });
        throw servicesResponse.error;
      }

      if (categoriesResponse.error) {
        console.error('Error fetching categories:', categoriesResponse.error);
        toast({
          title: "Virhe",
          description: "Kategorioiden hakeminen epäonnistui.",
          variant: "destructive"
        });
        throw categoriesResponse.error;
      }
      
      console.log('Services fetched successfully:', servicesResponse.data?.length || 0);
      console.log('Categories fetched successfully:', categoriesResponse.data?.length || 0);
      
      setServices(servicesResponse.data || []);
      setCategories(categoriesResponse.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Virhe",
        description: "Tietojen hakeminen epäonnistui.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category?.name || 'Ei kategoriaa';
  };

  const handleEditClick = (service: Service) => {
    navigate(`/admin/services/${service.id}`);
  };

  const handleAddClick = () => {
    navigate('/admin/services/new');
  };

  const handleDeleteClick = (service: Service) => {
    setDeletingService(service);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingService) return;
    
    setIsDeleting(true);
    try {
      console.log('Deleting service:', deletingService.id);
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', deletingService.id);
        
      if (error) {
        console.error('Error deleting service:', error);
        throw error;
      }
      
      setServices(services.filter(s => s.id !== deletingService.id));
      
      toast({
        title: "Poistettu",
        description: "Palvelu poistettu onnistuneesti."
      });
    } catch (error) {
      console.error('Error deleting service:', error);
      toast({
        title: "Virhe",
        description: "Palvelun poistaminen epäonnistui.",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
      setDeletingService(null);
    }
  };

  const handleFormSuccess = () => {
    setShowServiceForm(false);
    setEditingService(null);
    fetchData();
  };

  const handleFormClose = () => {
    setShowServiceForm(false);
    setEditingService(null);
  };

  if (isAdmin === null) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin h-8 w-8 text-blondify-blue" />
      </div>
    );
  }

  if (isAdmin === false) {
    return null;
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header - fixed */}
      <div className="flex justify-between items-center mb-6 flex-shrink-0">
        <h1 className="text-2xl font-bold font-redhat">Palvelut</h1>
        <Button 
          variant="default" 
          className="bg-blondify-blue hover:bg-blue-600"
          onClick={handleAddClick}
        >
          <Plus className="mr-2 h-4 w-4" />
          {!isMobile && "Lisää uusi palvelu"}
          {isMobile && "Lisää"}
        </Button>
      </div>

      {/* Tabs - scrollable content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Tabs defaultValue="services" className="w-full flex flex-col h-full">
          <TabsList className="grid w-full grid-cols-2 bg-gray-800 flex-shrink-0">
            <TabsTrigger value="services" className="text-white data-[state=active]:bg-blondify-blue">
              Kaikki palvelut
            </TabsTrigger>
            <TabsTrigger value="featured" className="text-white data-[state=active]:bg-blondify-blue">
              Etusivun suositukset
            </TabsTrigger>
          </TabsList>

          <TabsContent value="services" className="mt-6 flex-1 flex flex-col overflow-hidden">
            <div className="flex-shrink-0">
              <ServiceFilters
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
                featuredFilter={featuredFilter}
                onFeaturedFilterChange={setFeaturedFilter}
                categories={categories}
                onClearFilters={clearFilters}
                hasActiveFilters={hasActiveFilters}
              />
            </div>

            {loading ? (
              <div className="flex items-center justify-center flex-1">
                <Loader2 className="animate-spin h-8 w-8 text-blondify-blue" />
              </div>
            ) : (
              <div className="flex-1 overflow-auto">
                {filteredServices.length > 0 ? (
                  <div className="space-y-4 pb-6">
                    <div className="text-sm text-gray-400 mb-4">
                      Näytetään {filteredServices.length} / {services.length} palvelua
                    </div>
                    {filteredServices.map((service) => (
                      <ServiceCard
                        key={service.id}
                        service={service}
                        categoryName={getCategoryName(service.category_id || '')}
                        onEdit={handleEditClick}
                        onDelete={handleDeleteClick}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 text-gray-400">
                    {hasActiveFilters 
                      ? "Ei palveluita löytynyt hakuehdoilla."
                      : "Ei palveluita. Lisää uusi palvelu aloittaaksesi."
                    }
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="featured" className="mt-6 flex-1 overflow-auto">
            <FeaturedServicesList />
          </TabsContent>
        </Tabs>
      </div>
      
      {deletingService && (
        <DeleteConfirmation 
          title="Poista palvelu"
          message={`Haluatko varmasti poistaa palvelun "${deletingService.name}"? Tätä toimintoa ei voi perua.`}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeletingService(null)}
          isDeleting={isDeleting}
        />
      )}

      {showServiceForm && (
        <ServiceForm
          onClose={handleFormClose}
          onSuccess={handleFormSuccess}
          editingService={editingService}
          isInline={false}
        />
      )}
    </div>
  );
};

export default AdminServices;
