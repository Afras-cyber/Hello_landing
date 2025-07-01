import React, { useState, useEffect } from 'react';
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { useHairShades, HairShade } from '@/hooks/useHairShades';
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Heart, Check, X, Copy, Mail, Sparkles, Star, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from '@/hooks/use-toast';
import { supabase } from "@/integrations/supabase/client";

const ShadesExplorer: React.FC = () => {
  const { data: shades, isLoading, error } = useHairShades();
  const [selectedShades, setSelectedShades] = useState<HairShade[]>([]);
  const [compareOpen, setCompareOpen] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [email, setEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [showNewsletterCard, setShowNewsletterCard] = useState(false);
  const { toast } = useToast();

  console.log('🎯 ShadesExplorer - Received shades data:', shades);
  console.log('🎯 ShadesExplorer - Shades display order:', shades?.map(s => `${s.name}: ${s.display_order}`));

  // Load favorites from localStorage on component mount
  useEffect(() => {
    const savedFavorites = localStorage.getItem('blondifyFavoriteShades');
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
  }, []);

  // Save favorites to localStorage when they change
  useEffect(() => {
    localStorage.setItem('blondifyFavoriteShades', JSON.stringify(favorites));
    
    // Show newsletter card when first favorite is added
    if (favorites.length === 1 && !showNewsletterCard) {
      setShowNewsletterCard(true);
    }
  }, [favorites, showNewsletterCard]);

  const toggleShadeSelection = (shade: HairShade) => {
    if (selectedShades.some(s => s.id === shade.id)) {
      setSelectedShades(selectedShades.filter(s => s.id !== shade.id));
    } else {
      if (selectedShades.length < 5) {
        setSelectedShades([...selectedShades, shade]);
      } else {
        toast({
          title: "Voit vertailla maksimissaan 5 sävyä kerrallaan",
          description: "Poista ensin jokin valituista sävyistä",
          variant: "destructive",
        });
      }
    }
  };

  const toggleFavorite = (shadeId: string) => {
    if (favorites.includes(shadeId)) {
      setFavorites(favorites.filter(id => id !== shadeId));
      toast({
        title: "Poistettu suosikeista",
        variant: "default",
      });
    } else {
      setFavorites([...favorites, shadeId]);
      toast({
        title: "Lisätty suosikkeihin",
        variant: "default",
      });
    }
  };

  const compareShades = () => {
    if (selectedShades.length >= 2) {
      setCompareOpen(true);
    } else {
      toast({
        title: "Valitse vähintään kaksi sävyä vertaillaksesi",
        description: "Voit valita sävy klikkaamalla sitä",
        variant: "destructive",
      });
    }
  };

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      toast({
        title: "Virhe",
        description: "Syötä kelvollinen sähköpostiosoite.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubscribing(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('subscribe-newsletter', {
        body: { email }
      });
      
      if (error) {
        throw new Error(error.message || 'Newsletter subscription failed');
      }
      
      toast({
        title: "Kiitos tilauksesta!",
        description: "Saat pian lisää ideoita blondeihin sävyihin sähköpostiisi.",
        duration: 5000
      });

      setEmail('');
      setShowNewsletterCard(false);
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      toast({
        title: "Virhe",
        description: "Uutiskirjeen tilauksessa tapahtui virhe. Yritä myöhemmin uudelleen.",
        variant: "destructive",
        duration: 5000
      });
    } finally {
      setIsSubscribing(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white navbar-offset">
      {/* Hero section */}
      <div className="relative h-[40vh] bg-black">
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-4 font-redhat">Sävykokeilu</h1>
            <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto font-redhat">
              Löydä täydellinen sävy hiuksillesi. Kokeile eri sävyjä ja vertaile niitä keskenään.
            </p>
          </div>
        </div>
      </div>

      <div className="blondify-container py-16 md:py-20">
        {/* Control bar */}
        <div className="sticky top-16 z-10 bg-gray-950 border-b border-gray-800 py-4 -mx-4 px-4 mb-16">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-gray-400">Valittu: {selectedShades.length}/5</span>
              {selectedShades.map(shade => (
                <div key={shade.id} className="flex items-center bg-gray-800 px-3 py-1 rounded-full">
                  <span className="mr-2">{shade.name}</span>
                  <button 
                    onClick={() => setSelectedShades(selectedShades.filter(s => s.id !== shade.id))}
                    className="text-gray-400 hover:text-white"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                disabled={selectedShades.length < 2} 
                onClick={compareShades}
                className="whitespace-nowrap"
              >
                <Copy size={16} className="mr-2" />
                Vertaile sävyjä
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setSelectedShades([])}
                className="whitespace-nowrap"
                disabled={selectedShades.length === 0}
              >
                Tyhjennä valinnat
              </Button>
            </div>
          </div>
        </div>

        {/* Shades explorer */}
        <section>
          {isLoading ? (
            <div className="flex items-center justify-center min-h-[300px]">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blondify-blue"></div>
            </div>
          ) : error ? (
            <p className="text-center text-red-500 py-12">Virhe ladattaessa sävyjä. Yritä myöhemmin uudelleen.</p>
          ) : (
            <>
              {/* Show favorites if any */}
              {favorites.length > 0 && (
                <div className="mb-12">
                  <h2 className="text-2xl font-bold mb-6 font-redhat">Omat suosikkisi</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {shades?.filter(shade => favorites.includes(shade.id)).map(shade => {
                      console.log(`❤️ Rendering favorite shade: ${shade.name} (order: ${shade.display_order})`);
                      return (
                        <ShadeCard 
                          key={shade.id} 
                          shade={shade}
                          isSelected={selectedShades.some(s => s.id === shade.id)}
                          isFavorite={favorites.includes(shade.id)}
                          onToggleSelect={() => toggleShadeSelection(shade)}
                          onToggleFavorite={() => toggleFavorite(shade.id)}
                        />
                      );
                    })}
                  </div>
                  
                  {/* Newsletter Card - Positioned like popular services section */}
                  {showNewsletterCard && (
                    <div className="mb-16">
                      <div className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-black to-gray-900 rounded-2xl border border-gray-800">
                        {/* Background pattern */}
                        <div className="absolute inset-0 opacity-5">
                          <div className="absolute inset-0" style={{
                            backgroundImage: `radial-gradient(circle at 25% 25%, #48bcff 0%, transparent 50%), radial-gradient(circle at 75% 75%, #48bcff 0%, transparent 50%)`
                          }}></div>
                        </div>
                        
                        <div className="relative p-8 lg:p-12">
                          <div className="max-w-2xl mx-auto text-center">
                            {/* Icon and stars */}
                            <div className="flex justify-center items-center gap-2 mb-6">
                              <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                                ))}
                              </div>
                              <Sparkles className="h-6 w-6 text-blondify-blue ml-2" />
                            </div>

                            {/* Title */}
                            <h3 className="text-3xl lg:text-4xl font-bold text-blondify-blue mb-4 font-redhat">
                              Mahtava valinta!
                            </h3>
                            
                            {/* Subtitle */}
                            <p className="text-xl text-white mb-2 font-redhat">
                              Saat nyt eksklusiivisia hiusvinkkejä
                            </p>
                            <p className="text-gray-300 mb-8 font-redhat">
                              + erikoistarjouksia suoraan sähköpostiisi
                            </p>

                            {/* Form */}
                            <form onSubmit={handleNewsletterSubmit} className="max-w-md mx-auto">
                              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                                <Input
                                  type="email"
                                  value={email}
                                  onChange={(e) => setEmail(e.target.value)}
                                  placeholder="oma@sahkoposti.fi"
                                  className="bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-400 font-redhat text-center sm:text-left flex-1"
                                  required
                                />
                                <Button 
                                  type="submit"
                                  className="bg-blondify-blue hover:bg-blue-600 text-white font-redhat px-8 whitespace-nowrap"
                                  disabled={isSubscribing}
                                >
                                  {isSubscribing ? (
                                    <span className="flex items-center">
                                      <span className="animate-spin mr-2 h-4 w-4 border-t-2 border-b-2 border-white rounded-full" />
                                      Tilaan...
                                    </span>
                                  ) : (
                                    <span className="flex items-center">
                                      Tilaa vinkit
                                      <ArrowRight className="ml-2 h-4 w-4" />
                                    </span>
                                  )}
                                </Button>
                              </div>
                              
                              <Button 
                                type="button"
                                variant="ghost" 
                                onClick={() => setShowNewsletterCard(false)}
                                className="text-gray-400 hover:text-white font-redhat"
                              >
                                Ehkä myöhemmin
                              </Button>
                            </form>

                            {/* Benefits */}
                            <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-gray-300">
                              <div className="flex items-center gap-2">
                                <Check className="h-4 w-4 text-green-400" />
                                <span>Ilmaiset hiusvinkit</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Check className="h-4 w-4 text-green-400" />
                                <span>Eksklusiiviset tarjoukset</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Check className="h-4 w-4 text-green-400" />
                                <span>Ei roskapostia</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* All shades */}
              <h2 className="text-2xl font-bold mb-6 font-redhat">Kaikki sävyt</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {shades?.map((shade, index) => {
                  console.log(`🎨 Rendering all shades: ${shade.name} (order: ${shade.display_order})`);
                  return (
                    <ShadeCard 
                      key={shade.id} 
                      shade={shade}
                      isSelected={selectedShades.some(s => s.id === shade.id)}
                      isFavorite={favorites.includes(shade.id)}
                      onToggleSelect={() => toggleShadeSelection(shade)}
                      onToggleFavorite={() => toggleFavorite(shade.id)}
                    />
                  );
                })}
              </div>
            </>
          )}
        </section>
      </div>

      {/* Compare Dialog */}
      <Dialog open={compareOpen} onOpenChange={setCompareOpen}>
        <DialogContent className="max-w-6xl w-full max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Vertaile sävyjä</DialogTitle>
          </DialogHeader>
          <div className={`grid gap-4 mt-6 ${selectedShades.length <= 2 ? 'grid-cols-2' : selectedShades.length <= 3 ? 'grid-cols-3' : 'grid-cols-2 lg:grid-cols-5'}`}>
            {selectedShades.map(shade => (
              <div key={shade.id} className="flex flex-col">
                <div className="w-full max-h-[250px] overflow-hidden rounded-lg mb-4">
                  <img 
                    src={shade.images && shade.images.length > 0 ? shade.images[0].url : ''} 
                    alt={shade.name} 
                    className="w-full h-full object-cover max-h-[250px]"
                  />
                </div>
                <h3 className="text-lg font-bold mb-2 font-redhat">{shade.name}</h3>
                <p className="text-gray-400 mb-2 text-sm">{shade.description}</p>
                <div className="flex items-center text-sm text-gray-500">
                  {shade.category === 'cool' ? 'Viileä' : 
                   shade.category === 'warm' ? 'Lämmin' : 'Neutraali'} sävy
                </div>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button 
              onClick={() => setCompareOpen(false)}
              className="mt-4"
            >
              Sulje
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

interface ShadeCardProps {
  shade: HairShade;
  isSelected: boolean;
  isFavorite: boolean;
  onToggleSelect: () => void;
  onToggleFavorite: () => void;
}

const ShadeCard: React.FC<ShadeCardProps> = ({ 
  shade, 
  isSelected, 
  isFavorite, 
  onToggleSelect, 
  onToggleFavorite
}) => {
  // Always use the first image from the images array (main image)
  const firstImageUrl = shade.images && shade.images.length > 0 ? shade.images[0].url : '';

  console.log(`🖼️ ShadeCard ${shade.name} - Using main image:`, firstImageUrl);

  return (
    <div 
      className={`bg-black border ${isSelected ? 'border-blondify-blue' : 'border-gray-800'} rounded-lg overflow-hidden relative`}
    >
      <div className="absolute top-2 right-2 z-10 flex space-x-2">
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite();
          }}
          className={`p-2 rounded-full ${isFavorite ? 'bg-red-500' : 'bg-gray-800'} hover:bg-opacity-90 transition-colors`}
          title={isFavorite ? "Poista suosikeista" : "Lisää suosikkeihin"}
        >
          <Heart size={16} fill={isFavorite ? "white" : "none"} />
        </button>
        
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onToggleSelect();
          }}
          className={`p-2 rounded-full ${isSelected ? 'bg-blondify-blue' : 'bg-gray-800'} hover:bg-opacity-90 transition-colors`}
          title={isSelected ? "Poista valinta" : "Valitse vertailuun"}
        >
          <Check size={16} className={isSelected ? "text-white" : ""} />
        </button>
      </div>
      
      <div className="cursor-pointer" onClick={onToggleSelect}>
        <AspectRatio ratio={3/4} className="overflow-hidden">
          <img 
            src={firstImageUrl} 
            alt={shade.name} 
            className="w-full h-full object-cover"
          />
        </AspectRatio>
        <div className="p-6">
          <h3 className="text-xl font-bold mb-2 font-redhat">{shade.name}</h3>
          <p className="text-gray-400 mb-2">{shade.description}</p>
          <div className="flex items-center">
            <span className="text-sm text-gray-500">
              {shade.category === 'cool' ? 'Viileä' : 
               shade.category === 'warm' ? 'Lämmin' : 'Neutraali'} sävy
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShadesExplorer;
