
import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import ServiceCard from './ServiceCard';
import { Service } from '@/hooks/useServicesByType';

interface CategoryTab {
  id: string;
  label: string;
  value: string;
}

interface ServiceCategoryTabsProps {
  services: Service[];
}

const ServiceCategoryTabs: React.FC<ServiceCategoryTabsProps> = ({ services }) => {
  const categories: CategoryTab[] = [
    { id: 'all', label: 'Kaikki palvelut', value: 'all' },
    { id: 'konsultaatio', label: 'Ilmainen 15 min konsultaatio', value: 'konsultaatio' },
    { id: 'vaalennukset', label: 'Vaalennukset', value: 'vaalennukset' },
    { id: 'raidoitus', label: 'Raidoitus -palvelut', value: 'raidoitus' },
    { id: 'yllapito', label: 'Vaaleiden hiusten ylläpito', value: 'yllapito' },
    { id: 'perinteiset', label: 'Perinteiset-palvelut', value: 'perinteiset' },
    { id: 'muut', label: 'Muut palvelut', value: 'muut' }
  ];

  const getFilteredServices = (categoryValue: string) => {
    if (categoryValue === 'all') {
      return services;
    }
    return services.filter(service => service.service_type === categoryValue);
  };

  return (
    <div className="w-full">
      {/* Updated title */}
      <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center font-redhat">
        Selaa palveluitamme kategorioittain
      </h2>
      
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="w-full flex flex-wrap justify-start mb-6 bg-transparent gap-1">
          {categories.map((category) => (
            <TabsTrigger 
              key={category.id}
              value={category.value}
              className="font-redhat text-xs py-1 px-2 data-[state=active]:bg-blondify-blue data-[state=active]:text-white bg-transparent border border-gray-700 hover:border-blondify-blue transition-all duration-300"
            >
              {category.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {categories.map((category) => (
          <TabsContent key={category.id} value={category.value} className="mt-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {getFilteredServices(category.value).map((service, index) => (
                <ServiceCard 
                  key={service.id} 
                  service={service} 
                  priority={index < 6} // First 6 cards get priority loading
                />
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default ServiceCategoryTabs;
