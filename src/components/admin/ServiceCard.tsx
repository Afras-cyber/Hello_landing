import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, Star, GripVertical, FileText } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface Service {
  id: string;
  name: string;
  description: string;
  price?: string;
  image_path?: string;
  service_type?: string;
  category_id?: string;
  featured?: boolean;
  slug?: string;
  has_landing_page?: boolean;
}

interface ServiceCardProps {
  service: Service;
  categoryName: string;
  onEdit: (service: Service) => void;
  onDelete: (service: Service) => void;
  isDragging?: boolean;
}

const ServiceCard: React.FC<ServiceCardProps> = ({
  service,
  categoryName,
  onEdit,
  onDelete,
  isDragging = false
}) => {
  const isMobile = useIsMobile();

  return (
    <Card 
      className={`
        bg-gray-800 border border-gray-700 hover:border-blondify-blue transition-all duration-200
        ${isDragging ? 'opacity-50 transform rotate-2' : ''}
      `}
    >
      <CardContent className="p-4">
        <div className="flex gap-4">
          {/* Drag Handle */}
          <div className="flex items-start pt-2">
            <GripVertical className="h-5 w-5 text-gray-500 cursor-grab active:cursor-grabbing" />
          </div>

          {/* Service Image */}
          {service.image_path && (
            <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-700 flex-shrink-0">
              <img 
                src={service.image_path} 
                alt={service.name} 
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Service Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="text-lg font-bold text-white truncate">{service.name}</h3>
              <div className="flex items-center gap-2 flex-shrink-0">
                {service.has_landing_page && (
                  <Badge variant="outline" className="border-green-500 bg-green-900/30 text-green-400 font-normal">
                    <FileText className="h-3 w-3 mr-1.5" />
                    Alasivu aktiivinen
                  </Badge>
                )}
                {service.featured && (
                  <Badge className="bg-yellow-500 text-black font-semibold px-2 py-1 flex items-center gap-1 flex-shrink-0">
                    <Star className="h-3 w-3" />
                    Suositeltu
                  </Badge>
                )}
              </div>
            </div>
            
            <p className="text-sm text-gray-400 mb-2">{categoryName}</p>
            
            {service.price && (
              <p className="text-sm text-blondify-blue font-medium mb-2">{service.price}</p>
            )}
            
            <p className="text-gray-300 text-sm line-clamp-2 mb-3">
              {service.description?.substring(0, 100)}
              {service.description && service.description.length > 100 ? '...' : ''}
            </p>

            {/* Action Buttons */}
            <div className="flex gap-2">
              {isMobile ? (
                <>
                  <Button 
                    variant="default" 
                    size="sm"
                    className="flex-1 bg-gray-700 hover:bg-gray-600"
                    onClick={() => onEdit(service)}
                  >
                    <Pencil className="h-4 w-4 mr-1" />
                    Muokkaa
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    className="flex-1"
                    onClick={() => onDelete(service)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Poista
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-gray-300 hover:text-white hover:bg-gray-700"
                    onClick={() => onEdit(service)}
                  >
                    <Pencil className="h-4 w-4 mr-1" />
                    Muokkaa
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-gray-300 hover:text-red-400 hover:bg-red-900/20"
                    onClick={() => onDelete(service)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Poista
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ServiceCard;
