
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useArticleImages } from '@/hooks/useArticleImages';
import OptimizedImage from '@/components/OptimizedImage';

interface ArticleHeroProps {
  articleId: string;
  title: string;
  date: string;
  fallbackImageUrl?: string;
  onShare?: (platform: string) => void;
}

const ArticleHero: React.FC<ArticleHeroProps> = ({
  articleId,
  title,
  date,
  fallbackImageUrl,
  onShare
}) => {
  const { images } = useArticleImages(articleId);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  console.log('🖼️ ArticleHero:', { articleId, images, fallbackImageUrl });
  
  // Use article images if available, otherwise fallback to legacy image
  const displayImages = images.length > 0 ? images : 
    fallbackImageUrl ? [{ image_url: fallbackImageUrl, alt_text: title }] : [];
  
  const currentImage = displayImages[currentImageIndex];
  const hasMultipleImages = displayImages.length > 1;

  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === displayImages.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? displayImages.length - 1 : prev - 1
    );
  };

  // Always render the hero section, even without images
  return (
    <div className="relative h-[50vh] md:h-[60vh] lg:h-[70vh] overflow-hidden">
      {/* Image Background or Fallback */}
      <div className="absolute inset-0">
        {currentImage ? (
          <>
            <OptimizedImage
              src={currentImage.image_url}
              alt={currentImage.alt_text || title}
              className="w-full h-full object-cover"
              width={1920}
              height={1080}
              priority
            />
            
            {/* Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-transparent"></div>
          </>
        ) : (
          // Fallback gradient background
          <div className="w-full h-full bg-gradient-to-br from-gray-900 via-gray-800 to-black"></div>
        )}
      </div>

      {/* Navigation Arrows for Multiple Images */}
      {hasMultipleImages && (
        <>
          <button
            onClick={prevImage}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full backdrop-blur-sm transition-all"
            aria-label="Edellinen kuva"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          
          <button
            onClick={nextImage}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full backdrop-blur-sm transition-all"
            aria-label="Seuraava kuva"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </>
      )}

      {/* Image Indicators */}
      {hasMultipleImages && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-20 flex space-x-2">
          {displayImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentImageIndex 
                  ? 'bg-white scale-125' 
                  : 'bg-white/50 hover:bg-white/75'
              }`}
              aria-label={`Kuva ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Content */}
      <div className="relative h-full blondify-container flex flex-col justify-end pb-8 z-10">
        <Button 
          variant="ghost" 
          size="sm" 
          className="mb-4 self-start bg-black/50 border border-gray-600 text-white hover:bg-black/70 hover:text-white backdrop-blur-sm" 
          asChild
        >
          <Link to="/artikkelit" className="flex items-center">
            <ArrowLeft className="mr-2 h-4 w-4" /> Takaisin
          </Link>
        </Button>
        
        <h1 className="text-3xl md:text-4xl lg:text-6xl font-bold mb-4 font-redhat text-white leading-tight">
          {title}
        </h1>
        
        <div className="flex items-center justify-between text-gray-300">
          <span className="text-sm md:text-base">{date}</span>
          
          {hasMultipleImages && (
            <span className="text-sm bg-black/30 px-3 py-1 rounded-full backdrop-blur-sm">
              {currentImageIndex + 1} / {displayImages.length}
            </span>
          )}
          
          {onShare && (
            <div className="flex items-center space-x-2 ml-auto">
              <span className="text-sm mr-2">Jaa:</span>
              <button 
                onClick={() => onShare('facebook')}
                className="p-2 rounded-full hover:bg-gray-800 transition-colors"
                aria-label="Jaa Facebookissa"
              >
                📘
              </button>
              <button 
                onClick={() => onShare('twitter')}
                className="p-2 rounded-full hover:bg-gray-800 transition-colors"
                aria-label="Jaa Twitterissä"
              >
                🐦
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ArticleHero;
