
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "lucide-react";
import { Service } from '@/hooks/useServicesByType';
import OptimizedImage from './OptimizedImage';

interface ServiceCardProps {
  service: Service;
  priority?: boolean;
  showPrice?: boolean;
  context?: 'homepage' | 'services'; // New prop to determine navigation behavior
}

const ServiceCard: React.FC<ServiceCardProps> = ({ 
  service, 
  priority = false, 
  showPrice = true,
  context = 'homepage' // Default to homepage behavior
}) => {
  const [isHovered, setIsHovered] = useState(false);

  // Debug logging to see service data
  console.log('ServiceCard service data:', {
    name: service.name,
    slug: service.slug,
    has_landing_page: service.has_landing_page,
    id: service.id,
    context
  });

  // Determine link target based on context
  const getLinkTarget = () => {
    if (context === 'services') {
      // On services page: if has landing page -> go to subpage, otherwise -> booking
      return service.has_landing_page ? `/palvelut/${service.slug}` : '/varaa-aika';
    } else {
      // On homepage: if has landing page -> go to subpage, otherwise -> services page
      return service.has_landing_page ? `/palvelut/${service.slug}` : '/palvelut';
    }
  };

  const linkTarget = getLinkTarget();
  console.log('ServiceCard linkTarget:', linkTarget, 'context:', context);

  return (
    <Link to={linkTarget}>
      <Card 
        className={`
          bg-black border border-gray-800 overflow-hidden h-full flex flex-col
          transition-all duration-700 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]
          hover:border-blondify-blue hover:shadow-2xl hover:shadow-blondify-blue/30
          hover:scale-[1.02] transform-gpu
          relative group
        `}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Ultra-smooth luxury glow effect */}
        <div className="absolute inset-0 bg-gradient-to-t from-blondify-blue/0 to-blondify-blue/8 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]" />
        
        {/* Enhanced image container with loading state */}
        <div className="relative overflow-hidden bg-gray-900">
          <div className="w-full h-96 md:h-[28rem] flex items-center justify-center relative">
            {/* Loading state - visible until image loads */}
            <OptimizedImage
              src={service.image_path || '/placeholder.svg'}
              alt={service.name}
              width={600}
              height={800}
              priority={priority}
              className="w-full h-full object-cover object-center"
              placeholder="blur"
            />
            
            {/* Luxury gradient overlay */}
            <div className={`
              absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent
              transition-opacity duration-700 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]
              ${isHovered ? 'opacity-95' : 'opacity-60'}
            `} />
          </div>

          {/* Conditionally visible price */}
          {showPrice && service.price && (
            <div className="absolute bottom-4 right-4">
              <div className="bg-black/90 backdrop-blur-md text-blondify-blue font-bold px-4 py-2 rounded-full shadow-2xl text-sm transition-all duration-500 hover:bg-blondify-blue hover:text-white transform hover:scale-105">
                {service.price.startsWith('alk.') ? service.price : `alk. ${service.price}`}
              </div>
            </div>
          )}
        </div>

        <CardContent className="p-5 flex-grow flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-3 font-redhat text-white group-hover:text-blondify-blue transition-colors duration-700 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] line-clamp-2">
              {service.name}
            </h3>
            <p className="text-gray-400 mb-4 text-sm font-redhat line-clamp-2 group-hover:text-gray-300 transition-colors duration-700 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] leading-relaxed">
              {service.description}
            </p>
          </div>
          
          <div className="flex items-center text-blondify-blue font-medium font-redhat mt-auto text-sm group-hover:text-blue-300 transition-colors duration-700 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]">
            <span>
              {context === 'services' 
                ? (service.has_landing_page ? 'Lue lisää' : 'Varaa aika')
                : 'Lue lisää'
              }
            </span>
            <Calendar className={`ml-2 h-4 w-4 transition-all duration-500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] ${isHovered ? 'translate-x-1.5 scale-110' : ''}`} />
          </div>
        </CardContent>

        {/* Premium glow enhancement */}
        <div className={`
          absolute inset-0 rounded-lg pointer-events-none 
          transition-opacity duration-700 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]
          ${isHovered ? 'opacity-100' : 'opacity-0'}
          shadow-2xl shadow-blondify-blue/25
        `} />
      </Card>
    </Link>
  );
};

export default ServiceCard;
