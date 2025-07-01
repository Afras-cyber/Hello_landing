import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import { Volume2, VolumeX } from 'lucide-react';

// Simple responsive hook
function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(window.innerWidth < breakpoint);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < breakpoint);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [breakpoint]);
  return isMobile;
}

interface YouTubeHeroProps {
  content?: {
    title?: string;
    subtitle?: string;
    primary_button_text?: string;
    primary_button_url?: string;
    secondary_button_text?: string;
    secondary_button_url?: string;
    background_video_desktop?: string;
    background_video_mobile?: string;
    background_poster?: string; // Optional: add poster support
  };
}

const YouTubeHero: React.FC<YouTubeHeroProps> = ({ content }) => {
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const isMobile = useIsMobile();

  // Default content if none provided
  const defaultContent = {
    title: "Pohjoismaiden #1 kampaamo blondeille",
    subtitle: "Vaalennus, balayage, raidat tai mikä tahansa muu ihana lopputulos",
    primary_button_text: "Varaa aika",
    primary_button_url: "/varaa-aika",
    secondary_button_text: "Palvelut",
    secondary_button_url: "/palvelut",
    background_video_desktop: "https://faytlsrwiszkvakznkux.supabase.co/storage/v1/object/public/media/videos/blondify_hero.mp4",
    background_video_mobile: "https://faytlsrwiszkvakznkux.supabase.co/storage/v1/object/public/media/videos/mobile_hero2025.mp4",
    background_poster: "https://faytlsrwiszkvakznkux.supabase.co/storage/v1/object/public/media/videos/hero_poster.jpg"
  };

  const heroContent = { ...defaultContent, ...content };

  const handleVideoLoad = () => setIsVideoLoaded(true);
  const handleVideoError = () => setIsVideoLoaded(false);

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  // Use correct video for device
  const videoUrl = isMobile ? heroContent.background_video_mobile : heroContent.background_video_desktop;

  // Parse title to highlight "#1 kampaamo" with blue color
  const renderTitle = () => {
    const title = heroContent.title;
    if (title.includes('#1 kampaamo') && title.includes('blondeille')) {
      const parts = title.split(/(#1 kampaamo)/);
      return (
        <h1 className="font-redhat text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2 sm:mb-3 leading-tight tracking-tight">
          <span className="text-white">{parts[0]}</span>
          <span className="text-blondify-blue">{parts[1]}</span>
          <span className="text-white">{parts[2]}</span>
        </h1>
      );
    }
    return (
      <h1 className="font-redhat text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2 sm:mb-3 leading-tight tracking-tight">
        {title}
      </h1>
    );
  };

  const renderSubtitle = () => (
    <p className="font-redhat-light text-sm sm:text-lg md:text-xl text-white tracking-wide leading-relaxed max-w-3xl mb-4 sm:mb-6">
      {heroContent.subtitle}
    </p>
  );

  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* Background with video */}
      <div className="absolute inset-0 bg-black">
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay
          muted={isMuted}
          loop
          playsInline
          preload="none" // Performance: don't preload video
          poster={heroContent.background_poster}
          onLoadedData={handleVideoLoad}
          onError={handleVideoError}
        >
          <source src={videoUrl} type="video/mp4" />
        </video>
      </div>

      {/* Mute/Unmute button */}
      <div className="absolute top-6 right-6 z-20">
        <button
          onClick={toggleMute}
          className="bg-black/20 hover:bg-black/40 backdrop-blur-sm text-white p-3 rounded-full transition-all duration-300 hover:scale-105 border border-white/20"
          aria-label={isMuted ? "Poista mykistys" : "Mykistä"}
        >
          {isMuted ? (
            <VolumeX className="w-5 h-5" />
          ) : (
            <Volume2 className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Hero content */}
      <div className="relative h-full w-full z-10 overflow-hidden flex items-end pb-8 sm:pb-12 pt-20 md:pt-24">
        <div className="blondify-container w-full">
          <div className="max-w-3xl text-left">
            <div className="relative">
              {renderTitle()}
              {renderSubtitle()}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start">
                <Button 
                  asChild 
                  size="lg" 
                  className="bg-blondify-blue hover:bg-blondify-blue/80 text-white font-semibold w-full sm:w-auto text-sm sm:text-base px-6 sm:px-8 py-3 sm:py-4 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 border-0"
                >
                  <Link to={heroContent.primary_button_url} className="flex items-center justify-center">
                    {heroContent.primary_button_text}
                  </Link>
                </Button>
                <Button 
                  asChild 
                  variant="outline" 
                  size="lg" 
                  className="border-2 border-white text-white bg-black/20 hover:bg-white hover:text-black backdrop-blur-sm font-semibold w-full sm:w-auto text-sm sm:text-base px-6 sm:px-8 py-3 sm:py-4 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  <Link to={heroContent.secondary_button_url}>
                    {heroContent.secondary_button_text}
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(YouTubeHero);