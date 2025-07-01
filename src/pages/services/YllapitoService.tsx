import React from 'react';
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import OptimizedImage from '@/components/OptimizedImage';
import { useImageOptimization } from '@/hooks/use-optimized-image';

const services = [
  {
    id: 'blondify-refresh',
    title: 'Blondify Refresh',
    description: 'Kokonaisvaltainen ylläpitohoito vaaleiden hiusten sävyn ja kunnon ylläpitämiseksi.',
    price: '145€',
    duration: '1-2h'
  },
  {
    id: 'tehohoito',
    title: 'Tehohoito',
    description: 'Erityinen proteiinikäsittely vaurioituneille hiuksille.',
    price: '85€',
    duration: '45min'
  },
  {
    id: 'savyhoito',
    title: 'Sävyhoito',
    description: 'Ylläpitävä sävyhoito vaaleiden hiusten keltaisuuden neutraloimiseksi.',
    price: '65€',
    duration: '30min'
  }
];

const YllapitoService: React.FC = () => {
  const heroImageUrl = "https://faytlsrwiszkvakznkux.supabase.co/storage/v1/object/public/media/services_images/Blondify%20Refresh-min.png";
  const { isMobile } = useImageOptimization();

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero section with optimized image */}
      <div className="relative h-[50vh]">
        <OptimizedImage 
          src={heroImageUrl}
          alt="Vaaleiden hiusten ylläpito"
          className="w-full h-full object-cover"
          width={1920}
          height={960}
          priority={true}
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="blondify-container">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">Vaaleiden hiusten ylläpito</h1>
            <p className="text-lg md:text-xl text-gray-300 max-w-2xl">
              Tehohoidot, sävyn ylläpito ja hiustenhoitotuotteet. Pidä vaaleat hiuksesi kauniina!
            </p>
          </div>
        </div>
      </div>

      {/* Services list with improved cards */}
      <section className="py-16">
        <div className="blondify-container">
          <h2 className="text-3xl font-bold mb-12">Ylläpitopalvelumme</h2>
          
          <div className="grid gap-8">
            {services.map(service => (
              <div 
                key={service.id} 
                className="border border-gray-800 rounded-lg p-6 bg-gradient-to-b from-gray-900 to-black hover:border-blondify-blue transition-all shadow-lg hover:shadow-blondify-blue/20"
              >
                <div className="flex flex-col md:flex-row justify-between">
                  <div>
                    <h3 className="text-2xl font-bold mb-2">{service.title}</h3>
                    <p className="text-gray-300 mb-4">{service.description}</p>
                    <div className="flex items-center text-gray-400 text-sm mb-6">
                      <span className="mr-4">Kesto: {service.duration}</span>
                    </div>
                  </div>
                  <div className="mt-4 md:mt-0 md:ml-6 flex flex-col items-start md:items-end">
                    <p className="text-2xl font-bold text-blondify-blue mb-4">
                      {service.price}
                    </p>
                    <Button asChild className="bg-blondify-blue hover:bg-blue-600 shadow-md hover:shadow-lg transition-all">
                      <Link to="/varaa-aika">Varaa aika</Link>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default YllapitoService;
