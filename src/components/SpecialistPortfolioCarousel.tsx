
import React from 'react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useSpecialistPortfolio } from '@/hooks/useSpecialistPortfolio';

interface SpecialistPortfolioCarouselProps {
  specialistId: string;
}

const SpecialistPortfolioCarousel: React.FC<SpecialistPortfolioCarouselProps> = ({ 
  specialistId 
}) => {
  const { portfolioImages, isLoading } = useSpecialistPortfolio(specialistId);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blondify-blue"></div>
      </div>
    );
  }

  if (!portfolioImages || portfolioImages.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400 font-redhat">Portfolio tulossa pian</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-2 md:-ml-4">
          {portfolioImages.map((image, index) => (
            <CarouselItem key={image.id} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3">
              <div className="p-1">
                <div className="aspect-square rounded-lg overflow-hidden bg-gray-800 shadow-lg hover:shadow-blondify-blue/20 transition-all duration-300">
                  <img
                    src={image.image_url}
                    alt={image.alt_text || `Portfolio kuva ${index + 1}`}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                </div>
                {image.description && (
                  <p className="text-sm text-gray-300 mt-2 px-2 font-redhat text-center">
                    {image.description}
                  </p>
                )}
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="hidden md:flex" />
        <CarouselNext className="hidden md:flex" />
      </Carousel>
    </div>
  );
};

export default SpecialistPortfolioCarousel;
