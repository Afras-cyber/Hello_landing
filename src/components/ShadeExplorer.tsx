
import React, { useState, useCallback, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import { useHairShades, HairShade } from '@/hooks/useHairShades';
import { usePageContent, getPageContent } from '@/hooks/usePageContent';
import { Skeleton } from '@/components/ui/skeleton';

interface ShadeCardProps {
  shade: HairShade;
  index: number;
}

const ShadeExplorer: React.FC = () => {
  const { data: shades, isLoading, error } = useHairShades();
  const { data: pageContent = {} } = usePageContent('savyt');
  const [imageLoadErrors, setImageLoadErrors] = useState<Set<string>>(new Set());
  
  // Get content with fallbacks
  const title = getPageContent(pageContent, 'hero_title', 'Tutki sävyjä');
  const description = getPageContent(pageContent, 'hero_description', 'Löydä itsellesi täydellinen uusi sävy!');
  
  // Memoize the first 5 shades to prevent unnecessary re-renders
  const displayShades = useMemo(() => {
    if (!shades || shades.length === 0) return [];
    console.log('🏠 ShadeExplorer - Processing shades for display');
    return shades.slice(0, 5);
  }, [shades]);

  const handleImageError = useCallback((shadeId: string) => {
    setImageLoadErrors(prev => new Set([...prev, shadeId]));
  }, []);

  if (isLoading) {
    return (
      <section className="py-16 bg-black">
        <div className="blondify-container">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center font-redhat">{title.text}</h2>
          <p className="text-center text-gray-400 mb-12 max-w-2xl mx-auto font-redhat">
            {description.text}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {Array(5).fill(0).map((_, i) => (
              <div key={i} className="h-44 sm:h-60 overflow-hidden rounded-lg">
                <Skeleton className="h-full w-full" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 bg-black">
        <div className="blondify-container">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center font-redhat">{title.text}</h2>
          <p className="text-center text-red-500 font-redhat">
            Virhe ladattaessa sävyjä. Yritä myöhemmin uudelleen.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-black">
      <div className="blondify-container">
        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center font-redhat">{title.text}</h2>
        <p className="text-center text-gray-400 mb-12 max-w-2xl mx-auto font-redhat">
          {description.text}
        </p>
        
        {displayShades.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {displayShades.map((shade, index) => (
              <ShadeCard 
                key={shade.id} 
                shade={shade} 
                index={index}
              />
            ))}
          </div>
        )}
        
        <div className="mt-12 text-center">
          <Button 
            asChild 
            className="bg-blondify-blue hover:bg-blue-400 text-white font-redhat"
            data-gtm-element="shade_explorer_button"
          >
            <Link to="/savyt">Kokeile ja vertaile sävyjä</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

const ShadeCard: React.FC<ShadeCardProps> = React.memo(({ shade, index }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  // Always use the first image from the images array (main image)
  const firstImage = shade.images && shade.images.length > 0 ? shade.images[0] : null;
  
  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
  }, []);

  const handleImageError = useCallback(() => {
    console.warn(`Failed to load image for shade: ${shade.name}`);
    setImageError(true);
    setImageLoaded(true);
  }, [shade.name]);

  return (
    <div 
      className="relative group cursor-pointer" 
      data-gtm-element="shade_card"
      data-gtm-shade-id={shade.id}
      data-gtm-shade-name={shade.name}
    >
      <div className="h-44 sm:h-60 overflow-hidden rounded-lg bg-gray-800">
        {!imageLoaded && !imageError && (
          <div className="w-full h-full bg-gray-800 animate-pulse" />
        )}
        {imageError && (
          <div className="w-full h-full bg-gray-800 flex items-center justify-center">
            <span className="text-gray-400 text-sm text-center p-4">{shade.name}</span>
          </div>
        )}
        {firstImage?.url && !imageError && (
          <img 
            src={firstImage.url} 
            alt={firstImage.alt || shade.name} 
            className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-110 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={handleImageLoad}
            onError={handleImageError}
            loading={index < 2 ? "eager" : "lazy"}
            width="300"
            height="400"
          />
        )}
      </div>
    </div>
  );
});

ShadeCard.displayName = 'ShadeCard';

export default ShadeExplorer;
