
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from 'react-router-dom';
import OptimizedImage from './OptimizedImage';
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { normalizeImagePath } from '@/hooks/use-optimized-image';

interface Service {
  id: string;
  title: string;
  description: string;
  image: string;
  link: string;
}

const services: Service[] = [
  {
    id: 'konsultaatio',
    title: '15min konsultaatio (0€)',
    description: 'Ilmainen konsultaatio, jossa kartoitamme tilanteesi ja teemme suunnitelman.',
    image: 'https://faytlsrwiszkvakznkux.supabase.co/storage/v1/object/public/media/videos/herom-blondify.jpeg',
    link: '/palvelut/konsultaatio'
  },
  {
    id: 'hiustenpidennykset',
    title: 'Hiustenpidennykset',
    description: 'Laadukkaat hiustenpidennykset ammattitaidolla.',
    image: 'https://faytlsrwiszkvakznkux.supabase.co/storage/v1/object/public/media/videos/hero-blondify.jpeg',
    link: '/palvelut/hiustenpidennykset'
  },
  {
    id: 'extrapitkät',
    title: 'EXTRAPITKÄT',
    description: 'Erityisratkaisut extrapitkiin hiuksiin.',
    image: 'https://faytlsrwiszkvakznkux.supabase.co/storage/v1/object/public/media/videos/hero-blondify.jpeg',
    link: '/palvelut/extrapitkät'
  },
  {
    id: 'pitkät',
    title: 'PITKÄT',
    description: 'Kauniit ja terveet pitkät hiukset.',
    image: 'https://faytlsrwiszkvakznkux.supabase.co/storage/v1/object/public/media/videos/herom-blondify.jpeg',
    link: '/palvelut/pitkät'
  },
  {
    id: 'keskipitkät',
    title: 'KESKIPITKÄT',
    description: 'Tyylikkäät keskipitkät hiukset.',
    image: 'https://faytlsrwiszkvakznkux.supabase.co/storage/v1/object/public/media/videos/herom-blondify.jpeg',
    link: '/palvelut/keskipitkät'
  },
  {
    id: 'lyhyet',
    title: 'LYHYET',
    description: 'Rohkeat ja tyylikkäät lyhyet hiukset.',
    image: 'https://faytlsrwiszkvakznkux.supabase.co/storage/v1/object/public/media/videos/hero-blondify.jpeg',
    link: '/palvelut/lyhyet'
  }
];

const ServiceSection: React.FC = () => {
  return (
    <section className="py-16 bg-black">
      <div className="blondify-container">
        <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">Palvelumme</h2>
        
        {/* Updated grid to show all services clearly */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {services.map((service, index) => (
            <ServiceCard 
              key={service.id} 
              service={service} 
              priority={index < 6} // All services get priority loading
            />
          ))}
        </div>

        <div className="mt-12 text-center">
          <Button asChild variant="outline" className="border-blondify-blue text-blondify-blue hover:bg-blondify-blue hover:text-white">
            <Link to="/palvelut">Katso kaikki palvelut</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

interface ServiceCardProps {
  service: Service;
  priority?: boolean;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ service, priority = false }) => {
  return (
    <Link to={service.link}>
      <Card className="bg-black border border-gray-800 overflow-hidden hover:border-blondify-blue transition-all duration-300 h-full flex flex-col group">
        <div className="overflow-hidden">
          <AspectRatio ratio={4/3} className="w-full">
            <OptimizedImage 
              src={normalizeImagePath(service.image)} 
              alt={service.title} 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              width={400}
              height={300}
              priority={priority}
              placeholder="skeleton"
            />
          </AspectRatio>
        </div>
        <CardContent className="p-6 flex-grow flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-semibold mb-3 group-hover:text-blondify-blue transition-colors duration-300">{service.title}</h3>
            <p className="text-gray-400 mb-4 text-sm leading-relaxed">{service.description}</p>
          </div>
          <div className="flex items-center text-blondify-blue font-medium mt-auto group-hover:text-blue-300 transition-colors duration-300">
            <span>Lue lisää</span>
            <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default ServiceSection;
