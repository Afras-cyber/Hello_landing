import React, { useEffect, useRef, useState } from 'react';
import { useBestServices } from '@/hooks/useBestServices';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import ServiceCard from '@/components/ServiceCard';
import { isMobileDevice } from '@/utils/image/deviceDetection';

const CampaignServicesCarousel: React.FC = () => {
  const { data: services, isLoading, isError } = useBestServices();
  const carouselRef = useRef<HTMLDivElement>(null);
  const autoScrollIntervalRef = useRef<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isAtEnd, setIsAtEnd] = useState(false);
  
  useEffect(() => {
    setIsMobile(isMobileDevice());
  }, []);
  
  useEffect(() => {
    if (isMobile || isAtEnd) return;
    
    const startAutoScroll = () => {
      if (autoScrollIntervalRef.current) {
        clearInterval(autoScrollIntervalRef.current);
      }
      
      autoScrollIntervalRef.current = window.setInterval(() => {
        if (carouselRef.current && !isAtEnd) {
          const nextButton = carouselRef.current.querySelector('[data-carousel-next]');
          if (nextButton instanceof HTMLButtonElement && !nextButton.disabled) {
            nextButton.click();
          } else {
            if (autoScrollIntervalRef.current) {
              clearInterval(autoScrollIntervalRef.current);
            }
          }
        }
      }, 6000);
    };
    
    startAutoScroll();
    
    return () => {
      if (autoScrollIntervalRef.current) {
        clearInterval(autoScrollIntervalRef.current);
      }
    };
  }, [isMobile, isAtEnd]);

  const limitedServices = services?.slice(0, 8);

  if (isError) {
    console.error('Error loading campaign services');
    return (
      <section className="py-20 bg-black">
        <div className="blondify-container">
          <h2 className="text-3xl md:text-5xl font-bold mb-8 font-redhat text-center text-white">
            Suosituimmat palvelut
          </h2>
          <div className="text-center text-white font-redhat">
            <p className="text-lg">Palveluita ladataan...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-black relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-32 h-32 bg-blondify-blue/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-48 h-48 bg-purple-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="blondify-container relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-6 font-redhat text-white">
            ✨ Suosituimmat palvelut
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Tutustu suosituimpiin palveluihimme ja löydä täydellinen ratkaisu hiuksillesi
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-blondify-blue to-purple-600 mx-auto mt-6 rounded-full"></div>
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="h-[400px] w-full rounded-2xl bg-gray-800 animate-pulse" />
                <Skeleton className="h-6 w-3/4 bg-gray-800 rounded" />
                <Skeleton className="h-4 w-1/2 bg-gray-800 rounded" />
              </div>
            ))}
          </div>
        ) : services && services.length === 0 ? (
          <div className="text-center p-8 text-white font-redhat">
            <p className="text-lg">Ei näytettäviä palveluita tällä hetkellä.</p>
          </div>
        ) : (
          <div className="mb-16 relative bg-black" ref={carouselRef}>
            <Carousel 
              opts={{
                align: "start",
                loop: false,
                containScroll: "trimSnaps",
                skipSnaps: false,
                slidesToScroll: 1,
                duration: 35,
                watchDrag: true,
                dragFree: false,
                inViewThreshold: 0.8,
              }}
              className="w-full"
              setApi={(api) => {
                if (api) {
                  api.on('select', () => {
                    setIsAtEnd(!api.canScrollNext());
                  });
                }
              }}
            >
              <CarouselContent className={isMobile ? "-ml-2" : "-ml-4"}>
                {limitedServices?.map((service, index) => (
                  <CarouselItem 
                    key={service.id} 
                    className={`
                      transition-all duration-700 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]
                      ${isMobile 
                        ? 'pl-2 basis-[85%] sm:basis-[60%]'
                        : 'pl-4 basis-[90%] sm:basis-[45%] md:basis-[30%] lg:basis-[22%]'
                      }
                    `}
                  >
                    <div className="h-full bg-black p-2">
                      <div className="transform hover:scale-105 transition-transform duration-300">
                        <ServiceCard
                          service={service}
                          priority={index < 4}
                          showPrice={false}
                          context="homepage" // This is also used on homepage/campaign context
                        />
                      </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              
              {limitedServices && limitedServices.length > (isMobile ? 1 : 4) && (
                <>
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 z-20">
                    <CarouselPrevious 
                      className={`
                        bg-black/90 border-2 border-blondify-blue/60 text-blondify-blue backdrop-blur-lg
                        hover:bg-blondify-blue hover:text-white hover:border-blondify-blue
                        transition-all duration-300 ease-out shadow-2xl
                        hover:scale-110 active:scale-95 hover:shadow-blondify-blue/40
                        ${isMobile ? 'h-12 w-12' : 'h-16 w-16'}
                        disabled:opacity-30 disabled:cursor-not-allowed
                      `}
                    >
                      <ChevronLeft className={`${isMobile ? 'h-6 w-6' : 'h-8 w-8'}`} />
                    </CarouselPrevious>
                  </div>
                  
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 z-20">
                    <CarouselNext 
                      className={`
                        bg-black/90 border-2 border-blondify-blue/60 text-blondify-blue backdrop-blur-lg
                        hover:bg-blondify-blue hover:text-white hover:border-blondify-blue
                        transition-all duration-300 ease-out shadow-2xl
                        hover:scale-110 active:scale-95 hover:shadow-blondify-blue/40
                        ${isMobile ? 'h-12 w-12' : 'h-16 w-16'}
                        disabled:opacity-30 disabled:cursor-not-allowed
                      `}
                    >
                      <ChevronRight className={`${isMobile ? 'h-6 w-6' : 'h-8 w-8'}`} />
                    </CarouselNext>
                  </div>
                </>
              )}
            </Carousel>
          </div>
        )}

        <div className="text-center">
          <Button 
            asChild 
            size="lg" 
            className="bg-gradient-to-r from-blondify-blue to-purple-600 hover:from-purple-600 hover:to-blondify-blue text-white border-0 shadow-2xl hover:shadow-3xl transition-all duration-300 px-8 py-4 text-lg rounded-full transform hover:scale-105"
          >
            <Link to="/palvelut" className="inline-flex items-center">
              <span className="font-medium">Katso kaikki palvelut</span>
              <ArrowRight className="ml-3 h-6 w-6" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CampaignServicesCarousel;
