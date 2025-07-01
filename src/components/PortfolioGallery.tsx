
import React, { useState } from 'react';
import { useUnifiedPortfolio } from '@/hooks/useUnifiedPortfolio';
import { Loader2, X } from 'lucide-react';
import OptimizedImage from '@/components/OptimizedImage';

const PortfolioGallery: React.FC = () => {
  const { data: allImages = [], isLoading } = useUnifiedPortfolio();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Filter for portfolio images that are vertical (portrait orientation)
  const verticalImages = allImages.filter(img => {
    if (img.source_type !== 'portfolio') return false;
    return true;
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="animate-spin h-8 w-8 text-white" />
      </div>
    );
  }

  if (verticalImages.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-400 text-lg">Portfolio-kuvia ei ole vielä lisätty.</p>
      </div>
    );
  }

  return (
    <>
      {/* Display images in a responsive grid optimized for vertical images with faster loading */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        {verticalImages.map((image, index) => (
          <div
            key={image.id}
            className="overflow-hidden rounded-lg cursor-pointer hover:scale-105 transition-transform duration-300 bg-gray-800"
            onClick={() => setSelectedImage(image.image_url)}
          >
            <OptimizedImage
              src={image.image_url}
              alt={image.alt_text || `Portfolio kuva`}
              className="w-full h-auto object-cover aspect-[3/4]"
              width={280}
              height={373}
              priority={index < 15}
              placeholder="skeleton"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
            />
          </div>
        ))}
      </div>

      {/* Lightbox with optimized image loading */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button
            className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
            onClick={() => setSelectedImage(null)}
          >
            <X className="h-8 w-8" />
          </button>
          <OptimizedImage
            src={selectedImage}
            alt="Portfolio kuva"
            className="max-w-full max-h-full object-contain"
            width={800}
            height={1067}
            priority={true}
            placeholder="skeleton"
            sizes="100vw"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
};

export default PortfolioGallery;
