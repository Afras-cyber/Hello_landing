
import React from 'react';
import { Link } from 'react-router-dom';
import { useServicesByType } from '@/hooks/useServicesByType';
import { usePageContent, getPageContent } from '@/hooks/usePageContent';
import OnlineBooking from '@/components/OnlineBooking';
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import ServiceCard from '@/components/ServiceCard';
import { Skeleton } from '@/components/ui/skeleton';

interface ServiceCategory {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  link: string;
}

const serviceCategories: ServiceCategory[] = [
  {
    id: 'vaalennukset',
    title: 'Vaalennukset',
    description: 'Kokopään vaalennukset, värinkorjaukset, suuret muutostyöt. Erikoisosaamisemme on juuri vaalennuksissa, jotka teemme aina hiuksia kunnioittaen.',
    imageUrl: '',
    link: '/palvelut/vaalennukset'
  },
  {
    id: 'raidoitus',
    title: 'Raidoitus -palvelut',
    description: 'Blondify Special Highlights- erikoisraidoitukset, klassiset raidat, balayage. Monip- menetelmät tuovat hiuksiin eloa ja ulottuvuutta.',
    imageUrl: '',
    link: '/palvelut/raidoitus'
  },
  {
    id: 'yllapito',
    title: 'Vaaleiden hiusten ylläpito',
    description: 'Tehohoidot, sävyn ylläpito ja hiustenhoitotuotteet. Vaaleat hiukset tarvitsevat erityistä huolenpitoa säilyttääkseen kiiltonsa ja terveytensä.',
    imageUrl: '',
    link: '/palvelut/yllapito'
  },
  {
    id: 'perinteiset',
    title: 'Perinteiset palvelut',
    description: 'Jos etsit tuttua, turvallista, mutta laadukasta palvelua, niin nämä ovat ehdottomasti sinulle.',
    imageUrl: '',
    link: '/palvelut/perinteiset'
  },
  {
    id: 'muut',
    title: 'Muut palvelut',
    description: 'Muut Blondifyn monipuoliset palvelut hiustesi kauneuteen ja hyvinvointiin.',
    imageUrl: '',
    link: '/palvelut/muut'
  }
];

export default function Services() {
  const { data: services, isLoading, isError } = useServicesByType();
  const { data: pageContent = {}, isLoading: contentLoading } = usePageContent('palvelut');

  // Get content with fallbacks
  const heroTitle = getPageContent(pageContent, 'hero_title', 'Palvelut');
  const heroDescription = getPageContent(pageContent, 'hero_description', 'Erikoistumme vaaleisiin hiuksiin ja tarjoamme laajan valikoiman vaalennuspalveluita.');
  const servicesSectionTitle = getPageContent(pageContent, 'services_section_title', 'Selaa palveluitamme kategorioittain');
  const finalCtaTitle = getPageContent(pageContent, 'final_cta_title', 'Valmis muutokseen?');
  const finalCtaDescription = getPageContent(pageContent, 'final_cta_description', 'Ota yhteyttä ammattilaiseen ja löydä täydellinen palvelu sinun hiuksillesi.');

  return (
    <div className="min-h-screen bg-black text-white navbar-offset">
      {/* Hero section */}
      <div className="relative h-[40vh] bg-black pt-20">
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center px-4">
            <h1 className="text-3xl md:text-5xl font-bold mb-2">{heroTitle.text}</h1>
            <p className="text-base md:text-lg text-gray-300 max-w-2xl mx-auto mb-6">
              {heroDescription.text}
            </p>
            <Button asChild size="lg" className="mt-4">
              <Link to="/varaa-aika" className="flex items-center justify-center gap-2">
                <Calendar className="h-5 w-5" />
                <span>Varaa aika</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Service Categories with carousels without arrows */}
      <section className="py-16 md:py-20 bg-black overflow-x-hidden">
        <div className="blondify-container px-4">
          <h2 className="text-2xl font-bold mb-8">{servicesSectionTitle.text}</h2>
          
          <div className="space-y-8">
            {serviceCategories.map((category, index) => (
              <React.Fragment key={category.id}>
                <div className="mb-6">
                  <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <h3 className="text-lg sm:text-xl font-bold text-blondify-blue">{category.title}</h3>
                    <Button asChild variant="transparent-light" size="sm">
                      <Link to="/varaa-aika" className="flex items-center gap-2 w-fit">
                        <Calendar className="h-4 w-4" />
                        <span>Varaa aika</span>
                      </Link>
                    </Button>
                  </div>
                  
                  <div className="relative -mx-4 px-4">
                    <Carousel
                      opts={{
                        align: "start",
                        loop: false,
                        containScroll: "trimSnaps",
                      }}
                      className="w-full"
                    >
                      <CarouselContent className="-ml-2">
                        {isLoading ? (
                          Array.from({ length: 5 }).map((_, index) => (
                            <CarouselItem key={index} className="basis-[85%] sm:basis-1/2 md:basis-1/3 lg:basis-1/4 pl-2">
                              <Skeleton className="h-[380px] w-full rounded-lg bg-gray-800" />
                            </CarouselItem>
                          ))
                        ) : (
                          services
                            ?.filter(service => service.service_type === category.id)
                            .map((service) => (
                              <CarouselItem key={service.id} className="basis-[85%] sm:basis-1/2 md:basis-1/3 lg:basis-1/4 pl-2">
                                <div className="h-full">
                                  <ServiceCard 
                                    service={service} 
                                    priority={true} 
                                    showPrice={true} 
                                    context="services"
                                  />
                                </div>
                              </CarouselItem>
                            ))
                        )}
                      </CarouselContent>
                    </Carousel>
                  </div>
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* Final Call-to-Action before booking */}
      <section className="py-12 bg-black">
        <div className="blondify-container text-center px-4">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-white">{finalCtaTitle.text}</h2>
          <p className="text-base sm:text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
            {finalCtaDescription.text}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button asChild size="lg">
              <Link to="/varaa-aika" className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                <span>Varaa aika</span>
              </Link>
            </Button>
            <Button asChild size="lg" variant="transparent-light">
              <Link to="/varaa-aika" className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                <span>Ilmainen Konsultaatio</span>
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Online Booking Section */}
      <OnlineBooking />
    </div>
  );
}
