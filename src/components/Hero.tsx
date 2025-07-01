
import React, { useRef, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import { VolumeX, Volume2 } from 'lucide-react';

const Hero: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [showVideo, setShowVideo] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);

  const toggleMute = React.useCallback((event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    const currentVideoElement = videoRef.current;
    if (!currentVideoElement) return;

    const newMuteState = !isMuted;
    currentVideoElement.muted = newMuteState;
    setIsMuted(newMuteState);

    if (!newMuteState) {
      currentVideoElement.play().catch(() => {
        console.log("Autoplay after unmute failed");
      });
    }
  }, [isMuted]);

  // Faster video loading - reduce delay for better performance
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setShowVideo(true);
    }, 1500); // Reduced from 3000ms to 1500ms
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* Ultra-optimized hero background - prioritize mobile performance */}
      <div className="absolute inset-0 bg-black">
        {/* Mobile hero image - heavily optimized for LCP */}
        <img
          src="https://faytlsrwiszkvakznkux.supabase.co/storage/v1/object/public/media/videos/herom-blondify.jpeg?width=360&quality=50&format=webp"
          alt=""
          className="absolute inset-0 w-full h-full object-cover md:hidden"
          loading="eager"
          decoding="sync"
          fetchPriority="high"
          width={360}
          height={480}
          role="presentation"
        />
        
        {/* Desktop hero image - optimized */}
        <img
          src="https://faytlsrwiszkvakznkux.supabase.co/storage/v1/object/public/media/videos/hero-blondify.jpeg?width=1200&quality=60&format=webp"
          alt=""
          className="absolute inset-0 w-full h-full object-cover hidden md:block"
          loading="eager"
          decoding="sync"
          fetchPriority="high"
          width={1200}
          height={675}
          role="presentation"
        />
        
        {/* Video Background - lazy loaded for performance */}
        {showVideo && (
          <video
            ref={videoRef}
            className="absolute inset-0 w-full h-full object-cover opacity-90 hidden md:block"
            autoPlay
            loop
            muted={isMuted}
            playsInline
            preload="none"
            aria-hidden="true"
            src="https://faytlsrwiszkvakznkux.supabase.co/storage/v1/object/public/media/videos/blondify_hero.mp4"
            onLoadedData={() => setVideoLoaded(true)}
            style={{ display: videoLoaded ? 'block' : 'none' }}
          />
        )}
        
        {/* Minimal gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
      </div>

      {/* Video controls - only show when video is loaded */}
      {showVideo && videoLoaded && (
        <div className="absolute bottom-4 right-4 z-50 hidden md:block">
          <Button
            variant="outline"
            size="icon"
            onClick={toggleMute}
            className="backdrop-blur-sm bg-black/20 border-white/30 hover:bg-black/40 text-white"
            aria-label={isMuted ? "Poista mykistys videosta" : "Mykistä video"}
          >
            {isMuted ? (
              <VolumeX className="w-5 h-5" />
            ) : (
              <Volume2 className="w-5 h-5" />
            )}
          </Button>
        </div>
      )}

      {/* Hero content - optimized for LCP */}
      <div className="relative h-full w-full z-10 flex items-end pb-8 sm:pb-12">
        <div className="blondify-container w-full">
          <div className="max-w-3xl text-left">
            <h1 className="font-redhat text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2 sm:mb-3 leading-tight">
              <span className="text-white">Pohjoismaiden</span>
              {' '}
              <span className="text-blondify-blue">#1 kampaamo</span>
              {' '}
              <span className="text-white">blondeille</span>
            </h1>
            
            <p className="font-redhat text-sm sm:text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl mb-4 sm:mb-6">
              Vaalennus, balayage, raidat tai mikä tahansa muu ihana lopputulos
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start">
              <Button 
                asChild 
                size="lg" 
                className="bg-blondify-blue hover:bg-blondify-blue/90 text-white font-semibold w-full sm:w-auto text-sm sm:text-base px-6 sm:px-8 py-3 sm:py-4 transition-colors duration-200"
              >
                <Link to="/varaa-aika" className="flex items-center justify-center gap-2">
                  <span>✨</span>
                  Varaa aika
                </Link>
              </Button>
              <Button 
                asChild 
                variant="outline" 
                size="lg" 
                className="border-white/60 text-black bg-white/95 hover:bg-white font-semibold w-full sm:w-auto text-sm sm:text-base px-6 sm:px-8 py-3 sm:py-4 transition-colors duration-200"
              >
                <Link to="/palvelut">
                  Palvelut
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
