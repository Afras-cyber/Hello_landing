
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import { ArrowRight } from "lucide-react";
import { isMobileDevice } from '@/utils/image/deviceDetection';
import { useUnifiedPortfolio } from '@/hooks/useUnifiedPortfolio';
import OptimizedImage from './OptimizedImage';

interface MappedImage {
  id: string;
  imageUrl: string;
  description?: string;
}

const ClientsShowcase: React.FC = () => {
  const { data: allImages = [], isLoading: loading } = useUnifiedPortfolio();
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());
  const isMobile = isMobileDevice();

  const portfolioImages: MappedImage[] = allImages
    .filter(img => img.source_type === 'client_showcase')
    .map(img => ({
      id: img.id,
      imageUrl: img.image_url,
      description: img.alt_text || ''
    }));

  const handleImageError = (imageId: string) => {
    setFailedImages(prev => new Set(prev).add(imageId));
  };

  const visibleImages = portfolioImages.filter(img => !failedImages.has(img.id));
  const infiniteImages = visibleImages.length > 0 ? 
    [...visibleImages, ...visibleImages.slice(0, 4)] : [];

  // Mobile-optimized dimensions
  const imageWidth = isMobile ? 140 : 200;
  const imageHeight = isMobile ? 210 : 300;

  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-black via-gray-950 to-black relative overflow-hidden">
      {/* Background effects - hidden on mobile for performance */}
      <div className="hidden md:block absolute inset-0 bg-gradient-to-r from-blondify-blue/5 to-transparent opacity-30"></div>
      <div className="hidden md:block absolute top-20 right-10 w-64 h-64 bg-blondify-blue/10 rounded-full blur-3xl"></div>
      <div className="hidden md:block absolute bottom-20 left-10 w-96 h-96 bg-blondify-blue/5 rounded-full blur-3xl"></div>
      
      {/* Header */}
      <div className="blondify-container relative z-10 text-center mb-12 md:mb-16">
        <h2 className="text-3xl md:text-5xl font-bold mb-4 md:mb-6 font-redhat text-white">
          Portfolio
        </h2>
        <p className="text-lg md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed font-redhat">
          Tutustu aiempiin töihimme ja inspiroidu upeista muutoksista
        </p>
      </div>
      
      {/* Portfolio carousel */}
      <div className="w-full relative z-10">
        {loading ? (
          <div className="text-center py-8 md:py-12">
            <div className="animate-spin rounded-full h-6 w-6 md:h-8 md:w-8 border-b-2 border-blondify-blue mx-auto"></div>
            <p className="text-gray-400 text-sm md:text-lg font-redhat mt-4">Portfoliokuvia ladataan...</p>
          </div>
        ) : visibleImages.length > 0 ? (
          <div className="mb-8 md:mb-12 overflow-hidden bg-black">
            <div className="flex animate-portfolio-scroll gap-2 md:gap-3">
              {infiniteImages.map((item, index) => (
                <div 
                  key={`${item.id}-${Math.floor(index / Math.min(visibleImages.length, 4))}-${index}`} 
                  className="flex-shrink-0 relative bg-gray-900"
                  style={{ width: `${imageWidth}px` }}
                >
                  <div className="aspect-[3/4] rounded-lg md:rounded-xl overflow-hidden bg-gray-900 group hover:scale-105 transition-all duration-500 shadow-lg hover:shadow-2xl hover:shadow-blondify-blue/20">
                    <OptimizedImage
                      src={item.imageUrl}
                      alt={item.description || "Portfolio kuva"}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      width={imageWidth}
                      height={imageHeight}
                      priority={index < 8}
                      placeholder="skeleton"
                      sizes={`${imageWidth}px`}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-8 md:py-12">
            <p className="text-gray-400 text-sm md:text-lg font-redhat">Ei Client Showcase -kuvia saatavilla.</p>
          </div>
        )}

        {/* Call to action */}
        <div className="text-center px-4">
          <Button 
            asChild 
            size={isMobile ? "default" : "lg"}
            className="bg-gradient-to-r from-blondify-blue to-blondify-blue/80 hover:from-blondify-blue/90 hover:to-blondify-blue/70 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Link to="/portfolio" className="inline-flex items-center">
              <span className={`font-medium ${isMobile ? 'text-base' : 'text-lg'}`}>Katso kaikki työt</span>
              <ArrowRight className={`ml-3 ${isMobile ? 'h-4 w-4' : 'h-5 w-5'}`} />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ClientsShowcase;
