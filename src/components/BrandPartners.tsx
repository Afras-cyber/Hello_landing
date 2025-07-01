
import React, { useRef, useState } from 'react';
import OptimizedImage from '@/components/OptimizedImage';
import { useIntersectionObserver } from "@/hooks/use-intersection-observer";

const brands = [{
  name: 'Yhteistyökumppani 1',
  logo: 'https://faytlsrwiszkvakznkux.supabase.co/storage/v1/object/public/media/yk_logot/blondify_yk1.png',
  hoverLogo: 'https://faytlsrwiszkvakznkux.supabase.co/storage/v1/object/public/media/yk_logot/blondify_yk_Red.png'
}, {
  name: 'Yhteistyökumppani 2',
  logo: 'https://faytlsrwiszkvakznkux.supabase.co/storage/v1/object/public/media/yk_logot/blondify_yk2.png',
  hoverLogo: null
}, {
  name: 'Yhteistyökumppani 3',
  logo: 'https://faytlsrwiszkvakznkux.supabase.co/storage/v1/object/public/media/yk_logot/blondify_yk3.png',
  hoverLogo: null
}, {
  name: 'Yhteistyökumppani 4',
  logo: 'https://faytlsrwiszkvakznkux.supabase.co/storage/v1/object/public/media/yk_logot/blondify_yk.png',
  hoverLogo: null
}];

const BrandPartners: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const entry = useIntersectionObserver(containerRef, {
    threshold: 0.1,
    rootMargin: "100px"
  });

  return (
    <section ref={containerRef} className="relative py-12 bg-gradient-to-b from-black via-gray-950 to-black overflow-hidden">
      {/* Luxury background elements */}
      <div className="absolute inset-0 bg-gradient-to-r from-blondify-blue/5 via-transparent to-blondify-blue/5 opacity-40"></div>
      <div className="absolute top-0 left-1/3 w-48 h-48 bg-blondify-blue/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 right-1/3 w-40 h-40 bg-blondify-blue/15 rounded-full blur-3xl animate-pulse" style={{
        animationDelay: '2s'
      }}></div>
      
      {/* Centered section header */}
      <div className="relative z-10 text-center mb-8 px-4">
        <div className="blondify-container">
          <h2 className="text-3xl md:text-5xl font-bold mb-3 font-redhat text-white">
            Yhteistyökumppanimme
          </h2>
          
          <p className="text-sm md:text-base text-gray-300 max-w-2xl mx-auto leading-relaxed font-redhat">
            Käytämme alan parhaita tuotteita ja tekniikoita
          </p>
        </div>
      </div>
      
      {/* Grid layout with more space for logos */}
      <div className="blondify-container relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 max-w-4xl mx-auto">
          {brands.map((brand, index) => (
            <div 
              key={brand.name} 
              className="p-3 md:p-4 min-h-[80px] md:min-h-[100px] flex items-center justify-center cursor-pointer transition-transform duration-300 hover:scale-105 active:scale-95"
              onMouseEnter={() => brand.hoverLogo ? setHoveredIndex(index) : null}
              onMouseLeave={() => brand.hoverLogo ? setHoveredIndex(null) : null}
            >
              <div className="relative w-full h-full flex items-center justify-center">
                <OptimizedImage 
                  src={hoveredIndex === index && brand.hoverLogo ? brand.hoverLogo : brand.logo}
                  alt={`${brand.name} logo`} 
                  className="w-auto h-auto max-w-full max-h-[70px] md:max-h-[90px] transition-all duration-300"
                  width={200} 
                  height={120} 
                  priority={true} 
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default React.memo(BrandPartners);
