
import React, { useState, useEffect } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { usePageContent, getPageContent } from '@/hooks/usePageContent';
import { Sparkles } from 'lucide-react';

type Specialist = Tables<'team_members'>;

export default function BlondeSpecialists() {
  const navigate = useNavigate();
  const [specialists, setSpecialists] = useState<Specialist[]>([]);
  const [loading, setLoading] = useState(true);
  const { data: pageContent = {} } = usePageContent('blonde-specialistit');

  // Get content with fallbacks
  const heroTitle = getPageContent(pageContent, 'hero_title', 'Blonde Specialistit');
  const heroDescription = getPageContent(pageContent, 'hero_description', 'Tutustu huippuosaajiimme, joiden intohimona on luoda juuri sinulle täydelliset vaaleat hiukset');

  useEffect(() => {
    const fetchSpecialists = async () => {
      try {
        const { data, error } = await supabase
          .from('team_members')
          .select('*')
          .eq('is_active', true);

        if (error) {
          console.error('Error fetching specialists:', error);
          throw error;
        }

        setSpecialists(data || []);
      } catch (error) {
        console.error('Error fetching specialists:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSpecialists();
  }, []);

  const handleSpecialistClick = (specialist: Specialist) => {
    navigate(`/blonde-specialistit/${specialist.id}`);
  };

  const handleProductClick = (e: React.MouseEvent, specialist: Specialist) => {
    e.stopPropagation();
    navigate(`/blonde-specialistit/${specialist.id}`);
  };

  return (
    <div className="min-h-screen bg-black text-white navbar-offset">
      {/* Hero section */}
      <div className="relative h-[40vh] bg-black">
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-4 font-redhat text-white">
              {heroTitle.text}
            </h1>
            <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto font-redhat">
              {heroDescription.text}
            </p>
          </div>
        </div>
      </div>

      {/* Content section */}
      <div className="blondify-container py-16 md:py-20">
        {loading ? (
          <div className="flex flex-col justify-center items-center min-h-[400px] text-white">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blondify-blue mb-4"></div>
            <p className="text-lg text-gray-300 font-redhat">Ladataan spesialisteja...</p>
          </div>
        ) : specialists.length === 0 ? (
          <div className="flex flex-col justify-center items-center min-h-[400px] text-white">
            <p className="text-lg text-gray-300 font-redhat">Spesialisteja ei löytynyt.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {specialists.map(specialist => (
              <div 
                key={specialist.id} 
                className="bg-gray-900 rounded-lg overflow-hidden cursor-pointer transform hover:scale-[1.02] transition-all duration-300 border border-gray-800 hover:border-blondify-blue relative" 
                onClick={() => handleSpecialistClick(specialist)}
              >
                <div className="aspect-[3/4] relative bg-gray-800">
                  {/* Product Button in Center */}
                  <div className="absolute inset-0 flex items-center justify-center z-20">
                    <button 
                      onClick={(e) => handleProductClick(e, specialist)} 
                      className="bg-blondify-blue/90 backdrop-blur-md rounded-full p-2 shadow-2xl border-2 border-blondify-blue/60 
                                 hover:bg-blondify-blue hover:border-blondify-blue hover:shadow-blondify-blue/40 
                                 transition-all duration-500 ease-out transform hover:scale-110 active:scale-95
                                 group min-h-[48px] min-w-[48px]" 
                      aria-label="Näytä specialisti"
                    >
                      <Sparkles className="h-5 w-5 text-white group-hover:text-white transition-colors duration-300" />
                    </button>
                  </div>
                  
                  <img 
                    src={specialist.image_path} 
                    alt={specialist.name} 
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent opacity-70"></div>
                </div>
                
                <div className="p-4">
                  <h3 className="text-xl font-bold mb-1 font-redhat text-white">{specialist.name}</h3>
                  <p className="text-blondify-blue font-redhat">{specialist.role}</p>
                  <div className="mt-3 flex flex-wrap gap-1">
                    {specialist.specialties?.map((specialty, index) => (
                      <Badge 
                        key={index} 
                        variant="outline" 
                        className="text-xs border-gray-700 text-gray-400 font-redhat"
                      >
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Mobile booking button */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 block md:hidden">
        <Button asChild variant="light-bg" size="lg" className="shadow-2xl min-h-[48px] min-w-[48px]">
          <Link to="/varaa-aika" className="font-redhat font-semibold">
            Varaa aika
          </Link>
        </Button>
      </div>
    </div>
  );
}
