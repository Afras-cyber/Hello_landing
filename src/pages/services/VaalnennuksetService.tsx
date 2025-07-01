import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import OptimizedImage from '@/components/OptimizedImage';
import { useImageOptimization } from '@/hooks/use-optimized-image';
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Card, CardContent } from "@/components/ui/card";
import ConsultationBanner from '@/components/ConsultationBanner';
import StatsBar from '@/components/StatsBar';
import { useServicesByType } from '@/hooks/useServicesByType';
import ServiceCard from '@/components/ServiceCard';
import { Loader2 } from 'lucide-react';

const VaalnennuksetService: React.FC = () => {
  const heroImageUrl = "https://faytlsrwiszkvakznkux.supabase.co/storage/v1/object/public/media/services_images/Vaalennus%20all%20inclusive-min.png";
  const { data: services, isLoading } = useServicesByType("vaalennus");

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero section with optimized image - reduced height */}
      <div className="relative h-[50vh]">
        <OptimizedImage 
          src={heroImageUrl}
          alt="Vaalennukset"
          className="w-full h-full object-cover"
          width={1800} 
          height={900}
          priority={true}
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="blondify-container">
            <h1 className="text-3xl md:text-5xl font-bold mb-3">Vaalennukset</h1>
            <p className="text-base md:text-lg text-gray-300 max-w-2xl">
              Kokopään vaalennukset, värinkorjaukset ja suuret muutostyöt. Teemme vaalennukset aina hiuksen kuntoa kunnioittaen.
            </p>
          </div>
        </div>
      </div>
      
      {/* Stats Bar */}
      <StatsBar />

      {/* Services list with improved card styling - smaller grid */}
      <section className="py-12">
        <div className="blondify-container">
          <h2 className="text-2xl font-bold mb-8">Vaalennuspalvelumme</h2>
          
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-blondify-blue" />
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {services && services.length > 0 ? (
                services.map(service => <ServiceCard key={service.id} service={service} />)
              ) : (
                Array.from({ length: 4 }).map((_, index) => (
                  <ServiceCard 
                    key={index} 
                    service={{
                      id: String(index),
                      name: index === 0 ? 'Vaalennus All-Inclusive' : index === 1 ? 'Vaalennuspaketti' : index === 2 ? 'Värinkorjaus' : 'Peroxide Treatment',
                      description: 'Täydellinen vaalennuspaketti sisältäen konsultaation, vaalennuskäsittelyn, leikkauksen ja viimeistelyn.',
                      image_path: `https://faytlsrwiszkvakznkux.supabase.co/storage/v1/object/public/media/services_images/Vaalennus%20all%20inclusive-min.png`,
                      price: index === 0 ? '255€' : index === 1 ? '195€' : index === 2 ? '295€' : '175€',
                      slug: index === 0 ? 'vaalennus-all-inclusive' : index === 1 ? 'vaalennuspaketti' : index === 2 ? 'varinkorjaus' : 'peroxide-treatment'
                    }} 
                  />
                ))
              )}
            </div>
          )}
        </div>
      </section>

      {/* Information section - more compact */}
      <section className="py-12 bg-gray-950">
        <div className="blondify-container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-2xl font-bold mb-4">Miksi valita vaalennuskäsittely Blondifylla?</h2>
              <div className="space-y-3">
                <p className="text-gray-300 text-sm">
                  Blondifylla toteutamme vaalennukset aina hiusten kuntoa kunnioittaen. Käytämme vain laadukkaimpia tuotteita ja huolehdimme hiustesi terveydestä jokaisessa prosessin vaiheessa.
                </p>
                <p className="text-gray-300 text-sm">
                  Vaalennuksen jälkeen hiuksesi säilyvät kiiltävinä ja terveinä. Oheistuotteina käytämme K18-hoitoa ja muita ammattilaistason hiustuotteita, jotka säilyttävät hiusten hyvän kunnon myös vaalennuksen jälkeen.
                </p>
                <p className="text-gray-300 text-sm">
                  Meille on tärkeää, että olet tyytyväinen lopputulokseen. Blondifyn palvelut ovat tunnettuja korkeasta laadustaan ja asiakastyytyväisyydestä.
                </p>
              </div>
            </div>
            <div className="relative h-full min-h-[300px] rounded-lg overflow-hidden">
              <AspectRatio ratio={3 / 4} className="w-full h-full">
                <OptimizedImage 
                  src="https://faytlsrwiszkvakznkux.supabase.co/storage/v1/object/public/media/services_images/k18-min.png" 
                  alt="Vaalennushoito" 
                  className="w-full h-full object-cover rounded-lg" 
                  width={450}
                  height={600}
                />
              </AspectRatio>
            </div>
          </div>
        </div>
      </section>

      {/* Book consultation banner */}
      <ConsultationBanner />
    </div>
  );
};

export default VaalnennuksetService;
