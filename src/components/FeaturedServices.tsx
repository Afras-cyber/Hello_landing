import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useBestServices } from '@/hooks/useBestServices';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import ServiceCard from './ServiceCard';

// Responsive hook
function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(window.innerWidth < breakpoint);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < breakpoint);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [breakpoint]);
  return isMobile;
}

const FeaturedServices: React.FC = () => {
  const { data: services, isLoading, isError } = useBestServices();
  const carouselRef = useRef<HTMLDivElement>(null);
  const autoScrollIntervalRef = useRef<number | null>(null);
  const isMobile = useIsMobile();
  const [isAtEnd, setIsAtEnd] = useState(false);

  // Memoize limited services
  const limitedServices = useMemo(() => services?.slice(0, 8) || [], [services]);

  // Auto scroll functionality - only on desktop and stop when reaching the end
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

  if (isError) {
    console.error('Error loading best services');
    return (
      <section className="py-16 bg-black">
        <div className="blondify-container">
          <h2 className="text-3xl md:text-5xl font-bold mb-8 font-redhat text-left">
            <span className="text-white">Blondifyn </span>
            <span className="text-blondify-blue">palvelut</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 px-4">
            <div className="text-left p-4 text-white font-redhat">
              <p>Palveluita ladataan...</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-black">
      <div className="blondify-container">
        <h2 className="text-3xl md:text-5xl font-bold mb-8 font-redhat text-left">
          <span className="text-white">Blondifyn </span>
          <span className="text-blondify-blue">suosituimmat palvelut</span>
        </h2>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-[400px] w-full rounded-lg bg-gray-800 animate-pulse" />
                <Skeleton className="h-4 w-3/4 bg-gray-800" />
                <Skeleton className="h-4 w-1/2 bg-gray-800" />
              </div>
            ))}
          </div>
        ) : limitedServices.length === 0 ? (
          <div className="text-left p-4 text-white font-redhat">
            <p>Ei näytettäviä palveluita tällä hetkellä.</p>
          </div>
        ) : (
          <div className="mb-12 relative bg-black" ref={carouselRef}>
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
              <CarouselContent className={isMobile ? "-ml-2" : "-ml-3"}>
                {limitedServices.map((service, index) => (
                  <CarouselItem
                    key={service.id}
                    className={`
                      transition-all duration-700 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]
                      ${isMobile
                        ? 'pl-2 basis-[52%]'
                        : 'pl-3 basis-[22%]'
                      }
                    `}
                  >
                    <div className="h-full bg-black">
                      <ServiceCard
                        service={service}
                        priority={index === 0} // Only the first image is priority
                        showPrice={false}
                        context="homepage"
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>

              {limitedServices.length > (isMobile ? 2 : 4) && (
                <>
                  <div className="absolute left-2 top-1/2 -translate-y-1/2 z-20">
                    <CarouselPrevious
                      className={`
                        bg-black/90 border-blondify-blue/60 text-blondify-blue backdrop-blur-md
                        hover:bg-blondify-blue hover:text-white hover:border-blondify-blue
                        transition-all duration-500 ease-out shadow-2xl
                        hover:scale-110 active:scale-95 hover:shadow-blondify-blue/40
                        ${isMobile ? 'h-11 w-11' : 'h-14 w-14'}
                        border-2 disabled:opacity-50 disabled:cursor-not-allowed
                      `}
                    >
                      <ChevronLeft className={`${isMobile ? 'h-5 w-5' : 'h-7 w-7'}`} />
                    </CarouselPrevious>
                  </div>

                  <div className="absolute right-2 top-1/2 -translate-y-1/2 z-20">
                    <CarouselNext
                      className={`
                        bg-black/90 border-blondify-blue/60 text-blondify-blue backdrop-blur-md
                        hover:bg-blondify-blue hover:text-white hover:border-blondify-blue
                        transition-all duration-500 ease-out shadow-2xl
                        hover:scale-110 active:scale-95 hover:shadow-blondify-blue/40
                        ${isMobile ? 'h-11 w-11' : 'h-14 w-14'}
                        border-2 disabled:opacity-50 disabled:cursor-not-allowed
                      `}
                    >
                      <ChevronRight className={`${isMobile ? 'h-5 w-5' : 'h-7 w-7'}`} />
                    </CarouselNext>
                  </div>
                </>
              )}

              {isMobile && limitedServices.length > 2 && (
                <div className="flex justify-start mt-8 gap-2">
                  {Array.from({ length: Math.ceil(limitedServices.length / 2) }).map((_, index) => (
                    <div
                      key={index}
                      className="w-2 h-2 rounded-full bg-gray-600 transition-all duration-500 ease-out hover:bg-blondify-blue"
                    />
                  ))}
                </div>
              )}
            </Carousel>
          </div>
        )}

        <div className="text-center mt-12">
          <Button asChild size="lg" className="bg-gradient-to-r from-blondify-blue to-blondify-blue/80 hover:from-blondify-blue/90 hover:to-blondify-blue/70 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <Link to="/palvelut" className="inline-flex items-center">
              <span className="font-medium text-lg">Varaa aika</span>
              <Calendar className="ml-3 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default React.memo(FeaturedServices);