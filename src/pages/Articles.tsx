import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useArticles } from '@/hooks/useArticles';
import { Link } from 'react-router-dom';
import { ArrowRight, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { useGlobalSettings } from '@/hooks/useGlobalSettings';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Articles: React.FC = () => {
  const { data: articles, isLoading, error } = useArticles();
  const { getSetting } = useGlobalSettings();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const { toast } = useToast();

  const newsletterTitle = getSetting('articles_newsletter_title', 'Saa alennuksia ja hiusoppaita');
  const newsletterDescription = getSetting('articles_newsletter_description', 'Tilaa uutiskirjeemme ja saat ensimmäisenä tietää uusimmista palveluista, sesongin trendeistä sekä yksinoikeudella alennuksia ja etuja.');
  const newsletterImageUrl = 'https://faytlsrwiszkvakznkux.supabase.co/storage/v1/object/public/media/newsletter-1750010008918.webp';
  const newsletterButtonText = getSetting('articles_newsletter_button_text', 'Tilaa uutiskirje');
  const newsletterPrivacyText = getSetting('articles_newsletter_privacy_text', 'Voit perua tilauksesi milloin tahansa. Emme koskaan jaa tietojasi kolmansille osapuolille.');

  console.log('📄 Articles component render:', { articles, isLoading, error });

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      toast({
        title: "Virheellinen sähköposti",
        description: "Syötä kelvollinen sähköpostiosoite.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    console.log('Starting newsletter subscription from articles page:', { email });

    try {
      const response = await supabase.functions.invoke('subscribe-newsletter', {
        body: { email: email.trim() }
      });

      if (response.error) {
        console.error('Newsletter subscription error:', response.error);
        throw response.error;
      }

      console.log('Newsletter subscription successful:', response.data);

      // Enhanced success handling
      const isAlreadySubscribed = response.data?.alreadySubscribed;
      const brevoSynced = response.data?.brevoSynced;
      const requestId = response.data?.requestId;

      let successTitle = "Tilaus onnistui!";
      let successDescription = "Kiitos tilauksestasi! Tarkista sähköpostisi.";

      if (isAlreadySubscribed) {
        successTitle = "Olet jo tilaaja!";
        successDescription = "Sähköpostisi on jo tilattu uutiskirjeeseemme.";
      } else if (!brevoSynced) {
        successTitle = "Tilaus vastaanotettu!";
        successDescription = "Tilauksesi on tallennettu ja käsittelemme sen pian.";
      }

      toast({
        title: successTitle,
        description: successDescription,
        duration: 8000,
      });

      setEmail("");
      setShowSuccess(true);

      // Store success info for debugging
      if (process.env.NODE_ENV === 'development') {
        console.log('Newsletter subscription debug info:', {
          requestId,
          brevoSynced,
          isAlreadySubscribed,
          timestamp: new Date().toISOString()
        });
      }

    } catch (error) {
      console.error('Newsletter subscription error:', error);
      
      toast({
        title: "Virhe tilauksessa",
        description: error instanceof Error ? error.message : "Yritä myöhemmin uudelleen.",
        variant: "destructive",
        duration: 5000,
        action: (
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleNewsletterSubmit(e)}
            disabled={isSubmitting}
            className="ml-2"
          >
            <AlertCircle className="w-4 h-4 mr-1" />
            Yritä uudelleen
          </Button>
        )
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white navbar-offset">
      <div className="relative h-[40vh] bg-black">
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-4 font-redhat">Artikkelit</h1>
            <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto font-redhat">
              Lue uusimmat artikkelimme hiustenhoidosta, trendeistä ja vinkeistä
            </p>
          </div>
        </div>
      </div>

      <div className="blondify-container py-16 md:py-20">
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((_, i) => (
              <Card key={i} className="bg-gray-900/60 border-gray-800/50 overflow-hidden">
                <div className="h-64 overflow-hidden">
                  <Skeleton className="h-full w-full bg-gray-800" />
                </div>
                <CardContent className="p-6">
                  <Skeleton className="h-6 w-full mb-3 bg-gray-800" />
                  <Skeleton className="h-4 w-full mb-2 bg-gray-800" />
                  <Skeleton className="h-4 w-3/4 mb-4 bg-gray-800" />
                  <Skeleton className="h-8 w-32 bg-gray-800" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {error && (
          <div className="text-center p-12">
            <p className="text-red-400 mb-4 text-xl font-redhat">Virhe ladattaessa artikkeleita</p>
            <p className="text-gray-300 mb-6 font-redhat">
              {error instanceof Error ? error.message : 'Yritä päivittää sivu tai tarkista yhteytesi.'}
            </p>
            <Button onClick={() => window.location.reload()} variant="outline">
              Päivitä sivu
            </Button>
          </div>
        )}

        {!isLoading && !error && (!articles || articles.length === 0) && (
          <div className="text-center p-12">
            <p className="text-gray-300 mb-4 text-xl font-redhat">Ei artikkeleita saatavilla tällä hetkellä.</p>
            <p className="text-gray-400 font-redhat">Tarkista myöhemmin uudelleen.</p>
          </div>
        )}

        {!isLoading && !error && articles && articles.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article, index) => (
              <Card key={article.id} className="bg-gray-900/60 border-gray-800/50 overflow-hidden hover:border-blondify-blue/30 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-blondify-blue/10 group">
                <Link to={`/artikkelit/${article.slug}`} className="block h-64 overflow-hidden" data-gtm-element="article_card_image">
                  <img 
                    src={article.imageUrl || '/placeholder.svg'} 
                    alt={article.title} 
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="eager"
                    onError={(e) => {
                      console.error('Failed to load image:', article.imageUrl);
                      e.currentTarget.src = '/placeholder.svg';
                    }}
                  />
                </Link>
                <CardContent className="p-6">
                  <Link to={`/artikkelit/${article.slug}`} data-gtm-element="article_card_title">
                    <h3 className="text-xl font-bold mb-3 font-redhat text-white group-hover:text-blondify-blue transition-colors line-clamp-2">{article.title}</h3>
                  </Link>
                  <p className="text-gray-300 mb-4 font-redhat line-clamp-3 text-sm leading-relaxed">{article.excerpt}</p>
                  <Button variant="link" asChild className="text-blondify-blue p-0 h-auto font-redhat group-hover:text-blue-300 transition-colors">
                    <Link to={`/artikkelit/${article.slug}`} data-gtm-element="article_read_button" className="inline-flex items-center">
                      <span>Lue artikkeli</span>
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      
      {/* Newsletter section - 50/50 layout */}
      <section className="py-16 bg-gray-950">
        <div className="blondify-container">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="w-full md:w-1/2">
              <img 
                src={newsletterImageUrl} 
                alt="Hiusopas" 
                className="rounded-lg w-full h-auto object-cover"
                loading="eager"
              />
            </div>
            <div className="w-full md:w-1/2">
              {showSuccess ? (
                <div className="text-center">
                  <div className="mx-auto w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold mb-4 font-redhat">Kiitos tilauksesta!</h2>
                  <p className="text-gray-300 mb-6 font-redhat">
                    Olet nyt tilannut uutiskirjeemme. Saat pian ensimmäisen uutiskirjeemme sähköpostiisi täynnä alennuksia, tarjouksia ja hiusoppaita!
                  </p>
                  <Button
                    onClick={() => setShowSuccess(false)}
                    variant="outline"
                    className="border-blondify-blue text-blondify-blue hover:bg-blondify-blue hover:text-white font-redhat"
                  >
                    Tilaa uudelleen
                  </Button>
                </div>
              ) : (
                <>
                  <h2 className="text-2xl md:text-3xl font-bold mb-4 font-redhat">{newsletterTitle}</h2>
                  <p className="text-gray-300 mb-6 font-redhat">
                    {newsletterDescription}
                  </p>
                  
                  <form onSubmit={handleNewsletterSubmit} className="space-y-4">
                    <div>
                      <input 
                        type="email" 
                        placeholder="Sähköpostiosoitteesi" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={isSubmitting}
                        className="w-full px-4 py-3 rounded-md bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blondify-blue transition-colors disabled:opacity-50"
                      />
                    </div>
                    <Button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="w-full bg-blondify-blue hover:bg-blue-600 font-redhat transition-colors h-12"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Tilaa...
                        </>
                      ) : (
                        newsletterButtonText
                      )}
                    </Button>
                  </form>
                  <p className="text-xs text-gray-400 mt-4 font-redhat">
                    {newsletterPrivacyText}
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Articles;
