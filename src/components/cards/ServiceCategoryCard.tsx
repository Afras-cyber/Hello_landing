
import React, { useRef, useState, useEffect, memo } from 'react';
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Clock } from "lucide-react";
import { useIntersectionObserver } from "@/hooks/use-intersection-observer";
import { normalizeImagePath, getOptimizedImageUrl, isMobileDevice, isLowEndDevice } from '@/hooks/use-optimized-image';

interface ServiceCategoryCardProps {
  title: string;
  description: string;
  imageUrl: string;
  linkUrl: string;
  price?: string;
  isFeatured?: boolean;
  priority?: boolean;
}

const ServiceCategoryCard: React.FC<ServiceCategoryCardProps> = ({
  title,
  description,
  imageUrl,
  linkUrl,
  price,
  isFeatured = false,
  priority = false
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(priority);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isLowEnd, setIsLowEnd] = useState(false);
  
  const entry = useIntersectionObserver(cardRef, {
    threshold: 0.01,
    rootMargin: "200px", // Reduced from 400px
    once: true
  });
  
  // Check device capabilities once
  useEffect(() => {
    const mobile = isMobileDevice();
    const lowEnd = isLowEndDevice();
    
    setIsMobile(mobile);
    setIsLowEnd(lowEnd);
  }, []);
  
  useEffect(() => {
    if (priority) {
      setIsVisible(true);
      return;
    }
    
    if (entry?.isIntersecting) {
      if (!isLowEnd) {
        setIsVisible(true);
      } else {
        // Shorter delay for low-end devices
        const timer = setTimeout(() => {
          setIsVisible(true);
        }, Math.random() * 50); // Reduced from 100ms
        
        return () => clearTimeout(timer);
      }
    }
  }, [entry?.isIntersecting, isLowEnd, priority]);
  
  // More aggressive image optimization
  const getOptimizedImageSrc = () => {
    try {
      const normalizedPath = normalizeImagePath(imageUrl);
      
      // Smaller sizes for better performance
      const width = isMobile ? 250 : 350; // Reduced from 300/400
      const quality = isLowEnd || isMobile ? 50 : 60; // Much lower quality
      
      return getOptimizedImageUrl(normalizedPath, {
        width,
        quality,
        format: 'webp',
        priority
      });
    } catch (error) {
      console.error('Error getting optimized image source:', error);
      return '/placeholder.svg';
    }
  };
  
  // Simplified srcset with fewer sizes
  const generateSrcset = () => {
    try {
      const normalizedPath = normalizeImagePath(imageUrl);
      const sizes = [250, 350]; // Fixed sizes for better caching
        
      return sizes.map(size => 
        `${getOptimizedImageUrl(normalizedPath, {
          width: size,
          quality: isLowEnd || isMobile ? 50 : 60,
          format: 'webp'
        })} ${size}w`
      ).join(', ');
    } catch (error) {
      console.error('Error generating srcset:', error);
      return '';
    }
  };
  
  return (
    <Card 
      ref={cardRef} 
      className="service-card flex flex-col h-full bg-black border border-gray-800 rounded-lg overflow-hidden hover:border-gray-700 transition-colors duration-200"
    >
      <Link to={linkUrl} className="flex flex-col h-full no-underline">
        <div className="relative">
          <AspectRatio ratio={2/3}>
            {isVisible ? (
              <>
                <img 
                  src={getOptimizedImageSrc()}
                  srcSet={generateSrcset()}
                  sizes="(max-width: 768px) 250px, 350px"
                  alt={title} 
                  className={`w-full h-full object-cover transition-opacity duration-200 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                  loading={priority ? "eager" : "lazy"}
                  fetchPriority={priority ? "high" : "auto"}
                  decoding={priority ? "sync" : "async"}
                  onLoad={() => setImageLoaded(true)}
                  onError={(e) => {
                    console.error('Image load error:', e);
                    (e.target as HTMLImageElement).src = '/placeholder.svg';
                    setImageLoaded(true);
                  }}
                  width={isMobile ? 250 : 350}
                  height={isMobile ? 375 : 525}
                />
                {!imageLoaded && (
                  <div className="absolute inset-0 bg-gray-800 animate-pulse"></div>
                )}
              </>
            ) : (
              <div className="w-full h-full bg-gray-800"></div>
            )}
          </AspectRatio>
          
          {isFeatured && (
            <div className="absolute top-3 right-3">
              <Badge className="bg-blondify-blue text-white font-semibold px-3 py-1">
                Suosituin
              </Badge>
            </div>
          )}
        </div>
        
        <CardContent className="p-4 flex-grow bg-black">
          <h3 className="text-lg font-bold mb-2 text-blondify-blue line-clamp-2">{title}</h3>
          <p className="text-gray-200 text-xs mb-3 leading-relaxed line-clamp-4">{description}</p>
        </CardContent>
        
        <CardFooter className="p-4 pt-0 bg-black flex flex-col items-stretch gap-2">
          {price && (
            <div className="flex justify-between items-center w-full">
              <div className="flex items-center text-gray-300 text-sm">
                <Clock className="mr-1 h-4 w-4 text-blondify-blue" />
                <span>Alk. {price}</span>
              </div>
              <Button
                size="sm"
                className="bg-blondify-blue text-white hover:bg-blue-400 transition-colors duration-200"
              >
                Varaa
              </Button>
            </div>
          )}
          {!price && (
            <Button
              size="sm"
              className="bg-blondify-blue text-white hover:bg-blue-400 transition-colors duration-200 w-full"
            >
              Varaa
            </Button>
          )}
        </CardFooter>
      </Link>
    </Card>
  );
};

export default memo(ServiceCategoryCard);
