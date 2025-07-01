import React, { useState, useRef, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Skeleton } from "@/components/ui/skeleton";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { useHairShades } from '@/hooks/useHairShades';
import { Sparkles, ChevronLeft, ChevronRight } from "lucide-react";

// Responsive hook
function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = React.useState(window.innerWidth < breakpoint);
  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < breakpoint);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [breakpoint]);
  return isMobile;
}

const ShadesTester: React.FC = () => {
  const {
    data: databaseShades,
    isLoading,
    error
  } = useHairShades();
  const [imagesLoaded, setImagesLoaded] = useState<Record<number, boolean>>({});
  const carouselRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  // Memoize displayShades for performance
  const displayShades = useMemo(() => databaseShades?.slice(0, 10) || [], [databaseShades]);

  const handleImageLoaded = (index: number) => {
    setImagesLoaded(prev => (prev[index] ? prev : { ...prev, [index]: true }));
  };

  const handleImageError = (index: number, imageUrl: string) => {
    // Optionally log or handle error
  };

  if (isLoading) {
    return (
      <section className="relative py-24 bg-cool-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blondify-blue/5 via-transparent to-blondify-blue/5 opacity-40"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blondify-blue/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-blondify-blue/15 rounded-full blur-3xl animate-pulse" style={{
          animationDelay: '2s'
        }}></div>
        <div className="blondify-container relative z-10">
          <div className="text-center">
            <h2 className="text-3xl md:text-5xl font-bold font-redhat text-black mb-8">Kokeile sävyjä</h2>
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blondify-blue"></div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="relative py-24 bg-cool-white overflow-hidden">
        <div className="blondify-container relative z-10">
          <div className="text-center">
            <h2 className="text-3xl md:text-5xl font-bold font-redhat text-black mb-8">Kokeile sävyjä</h2>
            <p className="text-red-500 font-redhat text-lg">Virhe ladattaessa sävyjä. Yritä myöhemmin uudelleen.</p>
            <p className="text-gray-600 text-sm mt-2">Virhe: {error.message}</p>
          </div>
        </div>
      </section>
    );
  }

  if (!displayShades || displayShades.length === 0) {
    return (
      <section className="relative py-24 bg-cool-white overflow-hidden">
        <div className="blondify-container relative z-10">
          <div className="text-center">
            <h2 className="text-3xl md:text-5xl font-bold font-redhat text-black mb-8">Kokeile sävyjä</h2>
            <p className="text-gray-600 font-redhat text-lg">Ei sävyjä saatavilla tällä hetkellä.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative py-24 bg-cool-white overflow-hidden">
      {/* Luxury background elements adapted for light background */}
      <div className="absolute inset-0 bg-gradient-to-r from-blondify-blue/5 via-transparent to-blondify-blue/5 opacity-60"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blondify-blue/8 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-blondify-blue/12 rounded-full blur-3xl animate-pulse" style={{
        animationDelay: '2s'
      }}></div>
      
      {/* Left-aligned section header */}
      <div className="relative z-10 text-left mb-16 px-4">
        <div className="blondify-container">
          <h2 className="text-3xl md:text-5xl font-bold mb-6 font-redhat">
            <span className="bg-gradient-to-r from-black via-gray-800 to-black bg-clip-text text-slate-50">
              Kokeile sävyjä
            </span>
          </h2>
          <p className="text-xl md:text-2xl max-w-3xl leading-relaxed font-redhat text-slate-50">
            Löydä täydellinen sävy hiuksillesi ammattilaisten opastuksella
          </p>
        </div>
      </div>
      
      {/* Enhanced carousel showcase - hidden labels that appear on hover */}
      <div className="blondify-container relative z-10">
        <div className="mb-12 relative" ref={carouselRef}>
          <Carousel
            opts={{
              align: "start",
              loop: false,
              containScroll: "trimSnaps",
              skipSnaps: false,
              slidesToScroll: 1,
              duration: 20,
              watchDrag: true,
              dragFree: false,
              inViewThreshold: 0.8
            }}
            className="w-full"
          >
            <CarouselContent className={isMobile ? "-ml-2" : "-ml-3"}>
              {displayShades.map((shade, index) => {
                const imageUrl = shade.images && shade.images.length > 0 ? shade.images[0].url : '';
                return (
                  <CarouselItem
                    key={`shade-${shade.id}`}
                    className={`
                      transition-all duration-300 ease-out
                      ${isMobile ? 'pl-2 basis-[48%]' : 'pl-3 basis-[19%]'}
                    `}
                  >
                    <Link to="/savyt" className="block relative w-full overflow-hidden rounded-2xl group h-full">
                      <div className="relative aspect-[2/3] w-full overflow-hidden rounded-2xl">
                        {!imagesLoaded[index] && (
                          <Skeleton className="w-full h-full bg-gray-200 absolute inset-0" />
                        )}
                        {imageUrl && (
                          <img 
                            src={imageUrl} 
                            alt={shade.name} 
                            className="w-full h-full object-cover object-center transition-all duration-300 group-hover:scale-105" 
                            onLoad={() => handleImageLoaded(index)} 
                            onError={() => handleImageError(index, imageUrl)} 
                            style={{
                              opacity: imagesLoaded[index] ? 1 : 0
                            }}
                            loading={index === 0 ? "eager" : "lazy"} 
                            decoding={index === 0 ? "sync" : "async"}
                            fetchPriority={index === 0 ? "high" : "auto"}
                          />
                        )}
                        <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-sm py-2 px-3 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <p className="text-black font-redhat font-medium text-xs text-center">
                            {shade.name}
                          </p>
                        </div>
                      </div>
                    </Link>
                  </CarouselItem>
                );
              })}
            </CarouselContent>
            
            {/* Enhanced Arrow Navigation */}
            {displayShades.length > (isMobile ? 2 : 4) && (
              <>
                <div className="absolute left-2 top-1/2 -translate-y-1/2 z-20">
                  <CarouselPrevious className={`
                    bg-white/90 border-blondify-blue/60 text-blondify-blue backdrop-blur-md
                    hover:bg-blondify-blue hover:text-white hover:border-blondify-blue
                    transition-all duration-300 shadow-xl
                    hover:scale-105 hover:shadow-blondify-blue/40
                    ${isMobile ? 'h-11 w-11' : 'h-14 w-14'}
                    border-2
                  `} data-carousel-prev>
                    <ChevronLeft className={`${isMobile ? 'h-5 w-5' : 'h-7 w-7'}`} />
                  </CarouselPrevious>
                </div>
                
                <div className="absolute right-2 top-1/2 -translate-y-1/2 z-20">
                  <CarouselNext className={`
                    bg-white/90 border-blondify-blue/60 text-blondify-blue backdrop-blur-md
                    hover:bg-blondify-blue hover:text-white hover:border-blondify-blue
                    transition-all duration-300 shadow-xl
                    hover:scale-105 hover:shadow-blondify-blue/40
                    ${isMobile ? 'h-11 w-11' : 'h-14 w-14'}
                    border-2
                  `} data-carousel-next>
                    <ChevronRight className={`${isMobile ? 'h-5 w-5' : 'h-7 w-7'}`} />
                  </CarouselNext>
                </div>
              </>
            )}

            {/* Mobile swipe indicators */}
            {isMobile && displayShades.length > 2 && (
              <div className="flex justify-center mt-8 gap-2">
                {Array.from({ length: Math.ceil(displayShades.length / 2) }).map((_, index) => (
                  <div
                    key={index}
                    className="w-2 h-2 rounded-full bg-gray-400 transition-all duration-300 hover:bg-blondify-blue"
                  />
                ))}
              </div>
            )}
          </Carousel>
        </div>
      </div>

      {/* Premium call-to-action - centered */}
      <div className="relative z-10 text-center mt-20 px-4">
        <div className="blondify-container">
          <Button asChild size="lg" className="bg-blondify-blue hover:bg-blondify-blue/90 text-white">
            <Link to="/savyt" className="group">
              <span className="font-medium text-lg">Katso kaikki sävyt</span>
              <Sparkles className="ml-3 h-5 w-5 transform group-hover:rotate-12 transition-transform duration-300" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default React.memo(ShadesTester);