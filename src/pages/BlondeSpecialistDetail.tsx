
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Play } from "lucide-react";
import SpecialistPortfolioCarousel from "@/components/SpecialistPortfolioCarousel";
import TestimonialsSection from "@/components/TestimonialsSection";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { useIsMobile } from '@/hooks/use-mobile';

type Specialist = Tables<'team_members'>;

const BlondeSpecialistDetail: React.FC = () => {
  const { id } = useParams<{ id: string; }>();
  const [specialist, setSpecialist] = useState<Specialist | null>(null);
  const [loading, setLoading] = useState(true);
  const isMobile = useIsMobile();

  useEffect(() => {
    const fetchSpecialist = async () => {
      if (!id) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      console.log('Fetching specialist with ID:', id);
      
      try {
        // First try to fetch by ID
        let { data, error } = await supabase
          .from('team_members')
          .select('*')
          .eq('id', id)
          .single();

        // If not found by ID, try to fetch by name (case insensitive)
        if (error && error.code === 'PGRST116') {
          console.log('ID not found, trying by name:', id);
          const { data: nameData, error: nameError } = await supabase
            .from('team_members')
            .select('*')
            .ilike('name', id.replace('-', ' '))
            .single();
          
          if (!nameError && nameData) {
            data = nameData;
            error = null;
            console.log('Found specialist by name:', nameData);
          }
        }

        if (error) {
          console.error('Error fetching specialist:', error);
          throw error;
        }
        
        if (data) {
          console.log('Specialist found:', data);
          setSpecialist(data);
        }
      } catch (error) {
        console.error('Error fetching specialist:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSpecialist();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center navbar-offset">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blondify-blue"></div>
      </div>
    );
  }

  if (!specialist) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center navbar-offset">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4 font-redhat">Specialistia ei löytynyt</h1>
          <Button asChild variant="outline" className="mt-4">
            <Link to="/blonde-specialistit">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Takaisin
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white navbar-offset">
      <div className="blondify-container py-16 md:py-20">
        {/* Back button with proper spacing */}
        <div className="mb-8 md:mb-12">
          <Button asChild variant="ghost" className="bg-transparent text-white hover:bg-white hover:text-black border-0">
            <Link to="/blonde-specialistit" className="font-redhat">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Takaisin
            </Link>
          </Button>
        </div>
        
        {/* Mobile-first layout with proper spacing */}
        <div className="flex flex-col space-y-8 md:space-y-12">
          {/* Specialist info and image with improved spacing */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-16">
            <div className="flex flex-col items-center order-2 md:order-1 lg:col-span-1">
              <div className="w-full max-w-md lg:max-w-full aspect-[3/4] rounded-lg overflow-hidden mb-6 md:mb-8">
                <img 
                  src={specialist.image_path} 
                  alt={specialist.name} 
                  className="w-full h-full object-cover" 
                />
              </div>
              
              {/* Specialties with better spacing */}
              <div className="flex flex-wrap gap-3 mt-4 justify-center">
                {specialist.specialties?.map((specialty, index) => (
                  <Badge 
                    key={index} 
                    variant="outline" 
                    className="border-blondify-blue text-blondify-blue font-redhat px-3 py-1"
                  >
                    {specialty}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div className="flex flex-col order-1 md:order-2 lg:col-span-2 space-y-6 md:space-y-8">
              <div>
                <h1 className="text-3xl md:text-4xl lg:text-6xl font-bold mb-4 md:mb-6 font-redhat">{specialist.name}</h1>
                <p className="text-blondify-blue mb-6 md:mb-8 font-redhat text-lg md:text-xl lg:text-2xl">{specialist.role}</p>
                <p className="text-gray-300 mb-6 md:mb-8 font-redhat text-base md:text-lg lg:text-xl leading-relaxed">
                  {specialist.bio}
                </p>
                
                {specialist.location && (
                  <div className="mb-6 md:mb-8">
                    <p className="text-gray-400 font-redhat text-base md:text-lg">
                      <span className="text-blondify-blue">Toimipiste:</span> {specialist.location}
                    </p>
                  </div>
                )}
              </div>
              
              {/* Mobile booking button - positioned after location info */}
              {isMobile && (
                <div className="my-8 px-4">
                  <Button asChild className="w-full bg-blondify-blue text-white font-medium hover:bg-blue-600 font-redhat min-h-[48px]">
                    <Link to="/varaa-aika">Varaa aika</Link>
                  </Button>
                </div>
              )}
              
              {/* Desktop booking button with improved spacing */}
              {!isMobile && (
                <div className="my-12">
                  <Button asChild className="w-full lg:w-auto lg:px-12 lg:py-4 bg-blondify-blue text-white font-medium hover:bg-blue-600 font-redhat text-lg min-h-[48px]">
                    <Link to="/varaa-aika">Varaa aika</Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
          
          {/* Showreel Video Section with generous spacing */}
          {specialist.video_url && (
            <div className="mt-16 md:mt-20 px-4 md:px-0">
              <h4 className="text-2xl md:text-3xl lg:text-4xl font-semibold font-redhat mb-8 md:mb-12 text-center">Showreel</h4>
              <div className="relative w-full max-w-4xl mx-auto">
                <div className="aspect-video rounded-xl overflow-hidden bg-gray-800 shadow-2xl">
                  {specialist.video_url.includes('youtube.com') || specialist.video_url.includes('youtu.be') ? (
                    <iframe
                      src={specialist.video_url.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      title={`${specialist.name} Showreel`}
                    />
                  ) : specialist.video_url.includes('vimeo.com') ? (
                    <iframe
                      src={specialist.video_url.replace('vimeo.com/', 'player.vimeo.com/video/')}
                      className="w-full h-full"
                      allow="autoplay; fullscreen; picture-in-picture"
                      allowFullScreen
                      title={`${specialist.name} Showreel`}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                      <div className="text-center">
                        <Play className="h-16 w-16 text-blondify-blue mx-auto mb-4" />
                        <p className="text-gray-300 font-redhat">Video tulossa pian</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* Portfolio section with improved spacing */}
          <div className="mt-16 md:mt-20 px-4 md:px-0">
            <h4 className="text-2xl md:text-3xl lg:text-4xl font-semibold font-redhat mb-8 md:mb-12 text-center">Portfolio</h4>
            <SpecialistPortfolioCarousel specialistId={specialist.id} />
          </div>

          {/* Testimonials section with proper spacing */}
          <div className="mt-16 md:mt-20 px-4 md:px-0">
            <TestimonialsSection specialistId={specialist.id} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlondeSpecialistDetail;
