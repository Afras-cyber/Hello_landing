
import React, { useState } from "react";
import { Helmet } from 'react-helmet-async';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Mail, Gift, BookOpen, Star, Sparkles, Loader2, AlertCircle } from "lucide-react";
import { usePageContent, getPageContent } from '@/hooks/usePageContent';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const NewsletterPage = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const { toast } = useToast();
  const { data: pageContent, isLoading } = usePageContent('uutiskirje');

  const heroTitle = getPageContent(pageContent, 'hero_title', { text: 'Tilaa uutiskirjeemme' });
  const heroDescription = getPageContent(pageContent, 'hero_description', { text: 'Pysy ajan tasalla uusimmista vaaleiden hiusten trendeistä, saat eksklusiivisia tarjouksia ja asiantuntijavinkkejä suoraan sähköpostiisi' });
  const benefitsTitle = getPageContent(pageContent, 'benefits_title', { text: 'Mitä saat tilaajana?' });
  const benefitsSubtitle = getPageContent(pageContent, 'benefits_subtitle', { text: 'Liity yli 10,000 vaaleiden hiusten ystävän joukkoon' });
  const formTitle = getPageContent(pageContent, 'form_title', { text: 'Aloita tilaus' });
  const formDescription = getPageContent(pageContent, 'form_description', { text: 'Syötä sähköpostiosoitteesi alle niin lähetämme sinulle ensimmäisen uutiskirjeen' });

  const benefits = [
    {
      icon: <Gift className="w-8 h-8 text-blondify-blue" />,
      title: "Eksklusiiviset tarjoukset",
      description: "Saat ensimmäisenä tietoa alennuksista ja kampanjoista"
    },
    {
      icon: <BookOpen className="w-8 h-8 text-blondify-blue" />,
      title: "Asiantuntijavinkit",
      description: "Hiushoito-oppaat ja styling-vinkit ammattilaisilta"
    },
    {
      icon: <Sparkles className="w-8 h-8 text-blondify-blue" />,
      title: "Trenditietoa",
      description: "Uusimmat vaaleiden hiusten trendit ja ideat"
    },
    {
      icon: <Star className="w-8 h-8 text-blondify-blue" />,
      title: "VIP-sisältö",
      description: "Sisältöä ja vinkkejä vain tilaajille"
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
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
    console.log('Starting newsletter subscription from newsletter page:', { email });

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
            onClick={() => handleSubmit(e)}
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 animate-spin text-blondify-blue mx-auto mb-4" />
          <p className="text-gray-300 font-redhat">Ladataan...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Uutiskirje | Blondify</title>
        <meta name="description" content="Tilaa Blondifyn uutiskirje ja saa eksklusiivia tarjouksia, asiantuntijavinkkejä ja trenditietoa vaaleiden hiusten hoitoon." />
        <meta name="keywords" content="uutiskirje, vaaleat hiukset, hiushoito, tarjoukset, vinkit, blondify" />
      </Helmet>

      <div className="min-h-screen bg-black text-white">
        {/* Hero Section */}
        <div className="relative py-24 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Mail className="w-16 h-16 text-blondify-blue mx-auto mb-6" />
            <h1 className="text-4xl md:text-6xl font-bold mb-6 font-redhat">
              {heroTitle.text}
            </h1>
            <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto font-redhat leading-relaxed">
              {heroDescription.text}
            </p>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4 font-redhat text-white">
                {benefitsTitle.text}
              </h2>
              <p className="text-gray-400 font-redhat">
                {benefitsSubtitle.text}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
              {benefits.map((benefit, index) => (
                <Card key={index} className="bg-gray-900 border-gray-800 text-center">
                  <CardContent className="p-6">
                    <div className="mb-4">{benefit.icon}</div>
                    <h3 className="text-xl font-semibold mb-2 text-white font-redhat">
                      {benefit.title}
                    </h3>
                    <p className="text-gray-400 font-redhat leading-relaxed">
                      {benefit.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Subscription Form */}
        <div className="py-16 px-4">
          <div className="max-w-md mx-auto">
            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="p-8">
                {showSuccess ? (
                  <div className="text-center">
                    <div className="mx-auto w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-6">
                      <CheckCircle className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold mb-4 text-white font-redhat">
                      Kiitos tilauksesta!
                    </h3>
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
                    <div className="text-center mb-6">
                      <h3 className="text-2xl font-bold mb-2 text-white font-redhat">
                        {formTitle.text}
                      </h3>
                      <p className="text-gray-400 font-redhat">
                        {formDescription.text}
                      </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                      <Input
                        type="email"
                        placeholder="sähköpostiosoitteesi@gmail.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={isSubmitting}
                        className="bg-gray-800 border-gray-700 text-white placeholder-gray-400 font-redhat h-12"
                      />
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-blondify-blue hover:bg-blue-600 font-redhat h-12"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Tilaa...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Tilaa ilmainen uutiskirje
                          </>
                        )}
                      </Button>
                    </form>

                    <p className="text-xs text-gray-500 text-center mt-4 font-redhat">
                      Voit perua tilauksen milloin tahansa. Emme jaa tietojasi kolmansille osapuolille.
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default NewsletterPage;
