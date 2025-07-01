
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Phone, Clock, Mail } from "lucide-react";
import { usePageContent, getPageContent } from '@/hooks/usePageContent';
import { useSalonLocations } from '@/hooks/useSalonLocations';
import { Loader2 } from 'lucide-react';

const SalonsPage: React.FC = () => {
  const { data: pageContent = {} } = usePageContent('kampaamot');
  const { data: salons = [], isLoading } = useSalonLocations();

  // Get content with fallbacks  
  const heroTitle = getPageContent(pageContent, 'hero_title', 'Kampaamomme');
  const heroDescription = getPageContent(pageContent, 'hero_description', 'Löydä lähin Blondify-kampaamo ja varaa aikasi huippuasiantuntijoillemme');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8 text-white" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section - Updated to 60vh and consistent style */}
      <div className="relative h-[60vh] bg-black">
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center px-4">
            <h1 className="text-4xl md:text-6xl font-bold mb-4 font-redhat">{heroTitle.text}</h1>
            <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto font-redhat">
              {heroDescription.text}
            </p>
          </div>
        </div>
      </div>

      {/* Salons Section */}
      <div className="blondify-container py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {salons.map(salon => (
            <Card key={salon.id} className="bg-gray-900 border-gray-800 overflow-hidden">
              {/* Salon Image */}
              {salon.image_url && (
                <div className="w-full h-64 overflow-hidden">
                  <img 
                    src={salon.image_url} 
                    alt={salon.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-4 font-redhat text-white">{salon.name}</h3>
                
                {/* Description */}
                {salon.description && (
                  <div className="mb-4">
                    <p className="text-gray-300 text-sm font-redhat leading-relaxed">
                      {salon.description}
                    </p>
                  </div>
                )}
                
                <div className="space-y-3 mb-6">
                  <div className="flex items-start">
                    <MapPin className="h-5 w-5 text-blondify-blue mr-3 mt-0.5 flex-shrink-0" />
                    <div className="font-redhat text-gray-300">
                      <p>{salon.address}</p>
                      <p>{salon.city} {salon.postal_code}</p>
                    </div>
                  </div>
                  
                  {salon.phone && (
                    <div className="flex items-center">
                      <Phone className="h-5 w-5 text-blondify-blue mr-3 flex-shrink-0" />
                      <p className="font-redhat text-gray-300">{salon.phone}</p>
                    </div>
                  )}

                  {salon.email && (
                    <div className="flex items-center">
                      <Mail className="h-5 w-5 text-blondify-blue mr-3 flex-shrink-0" />
                      <a href={`mailto:${salon.email}`} className="font-redhat text-gray-300 hover:text-blondify-blue transition-colors">{salon.email}</a>
                    </div>
                  )}
                  
                  {salon.opening_hours && (
                    <div className="flex items-start">
                      <Clock className="h-5 w-5 text-blondify-blue mr-3 mt-0.5 flex-shrink-0" />
                      <div className="font-redhat text-gray-300">
                        {salon.opening_hours.mon_fri && (
                          <p>Ma-Pe: {salon.opening_hours.mon_fri}</p>
                        )}
                        {salon.opening_hours.sat && (
                          <p>La: {salon.opening_hours.sat}</p>
                        )}
                        {salon.opening_hours.sun && (
                          <p>Su: {salon.opening_hours.sun}</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                
                <a 
                  href="/varaa-aika" 
                  className="inline-block w-full text-center px-6 py-3 bg-blondify-blue text-white rounded hover:bg-blue-600 transition-colors font-redhat"
                >
                  Varaa aika
                </a>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Contact Section */}
      <div className="bg-black py-16">
        <div className="blondify-container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="bg-gray-900 p-8 rounded-lg">
              <h3 className="text-xl font-bold mb-4 font-redhat text-white">Varaa aika</h3>
              <p className="text-gray-300 mb-6 font-redhat">
                Varaa aika helposti verkossa tai soita suoraan haluamaasi toimipisteeseen.
              </p>
              <a 
                href="/varaa-aika" 
                className="inline-block px-6 py-3 bg-blondify-blue text-white rounded hover:bg-blue-600 transition-colors font-redhat"
              >
                Varaa nyt
              </a>
            </div>
            
            <div className="bg-gray-900 p-8 rounded-lg">
              <h3 className="text-xl font-bold mb-4 font-redhat text-white">Asiakaspalvelu</h3>
              <p className="text-gray-300 mb-4 font-redhat">
                Kysymyksiä tai palautetta? Ota yhteyttä asiakaspalveluumme.
              </p>
              <p className="font-redhat">
                <span className="block text-blondify-blue">info@blondify.fi</span>
                <span className="block text-blondify-blue">040 526 0124</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalonsPage;
