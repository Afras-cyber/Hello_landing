
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Check, Loader2 } from "lucide-react";

const NewsletterPopup: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [settings, setSettings] = useState<any>(null);
  const [isEnabled, setIsEnabled] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchNewsletterSettings();
  }, []);

  const fetchNewsletterSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('newsletter_settings')
        .select('*')
        .single();
      
      if (error) {
        console.error('Error fetching newsletter settings:', error);
        setIsEnabled(false);
        return;
      }
      
      setSettings(data);
      setIsEnabled(data?.is_enabled || false);
      
      // Only show popup if enabled in admin settings
      if (data?.is_enabled) {
        checkShouldShowPopup(data);
      } else {
        console.log('Newsletter popup disabled in admin settings');
      }
    } catch (error) {
      console.error('Error fetching newsletter settings:', error);
      setIsEnabled(false);
    }
  };

  const checkShouldShowPopup = (settings: any) => {
    const newsletterData = localStorage.getItem('newsletter_data');
    let shouldShow = false;

    if (!newsletterData) {
      shouldShow = true;
      console.log('First time visitor - showing newsletter popup');
    } else {
      try {
        const data = JSON.parse(newsletterData);
        
        if (data.subscribed) {
          console.log('User has subscribed - not showing popup');
          shouldShow = false;
        } else {
          const lastShown = new Date(data.lastShown);
          const threeDaysAgo = new Date();
          threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
          
          if (lastShown < threeDaysAgo) {
            shouldShow = true;
            console.log('3 days have passed - showing newsletter popup');
          } else {
            console.log('Less than 3 days since last shown - not showing popup');
          }
        }
      } catch (error) {
        shouldShow = true;
        console.log('Invalid newsletter data - showing popup');
      }
    }

    if (shouldShow) {
      const timer = setTimeout(() => {
        console.log('Showing newsletter popup');
        setOpen(true);
        localStorage.setItem('newsletter_data', JSON.stringify({
          lastShown: new Date().toISOString(),
          subscribed: false
        }));
      }, (settings?.delay_seconds || 5) * 1000);
      
      return () => clearTimeout(timer);
    }
  };

  const handleClose = () => {
    if (isSubmitting) return;
    console.log('Newsletter popup closed');
    setOpen(false);
    setShowSuccess(false);
    setEmail('');
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    if (!email || !email.includes('@')) {
      toast({
        title: "Virheellinen sähköposti",
        description: "Syötä kelvollinen sähköpostiosoite.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    console.log('Starting newsletter subscription from popup:', { email });
    
    try {
      const { data, error } = await supabase.functions.invoke('subscribe-newsletter', {
        body: { email: email.trim() }
      });
      
      if (error) {
        console.error('Newsletter subscription error:', error);
        throw new Error(error.message || 'Newsletter subscription failed');
      }
      
      console.log('Newsletter subscription successful:', data);
      
      setShowSuccess(true);
      
      const isAlreadySubscribed = data?.alreadySubscribed;
      const brevoSynced = data?.brevoSynced;
      
      let successTitle = "Kiitos tilauksesta!";
      let successDescription = "Olet nyt tilannut uutiskirjeemme. Saat pian ensimmäisen uutiskirjeemme!";
      
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
        duration: 8000
      });

      localStorage.setItem('newsletter_data', JSON.stringify({
        lastShown: new Date().toISOString(),
        subscribed: true,
        subscribedAt: new Date().toISOString(),
        requestId: data?.requestId
      }));

      setTimeout(() => {
        handleClose();
      }, 3000);
      
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      
      toast({
        title: "Tilausvirhe",
        description: error instanceof Error ? error.message : "Uutiskirjeen tilauksessa tapahtui virhe. Yritä myöhemmin uudelleen.",
        variant: "destructive",
        duration: 5000,
        action: (
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleSubmit(e)}
            disabled={isSubmitting}
          >
            Yritä uudelleen
          </Button>
        )
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Don't render anything if not enabled
  if (!isEnabled) {
    return null;
  }
  
  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-4xl bg-black border border-gray-800 p-0 max-h-[90vh] overflow-y-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[400px] lg:min-h-[500px]">
          {/* Left side - Image */}
          <div className="relative overflow-hidden rounded-t-lg lg:rounded-l-lg lg:rounded-t-none order-1 lg:order-1">
            <img
              src={settings?.image_url || "https://images.unsplash.com/photo-1721322800607-8c38375eef04?w=600&h=500&fit=crop"}
              alt="Newsletter"
              className="w-full h-48 lg:h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent" />
          </div>
          
          {/* Right side - Content */}
          <div className="p-6 lg:p-8 flex flex-col justify-center order-2 lg:order-2">
            {showSuccess ? (
              <div className="text-center">
                <div className="mx-auto w-12 h-12 lg:w-16 lg:h-16 bg-green-500 rounded-full flex items-center justify-center mb-4 lg:mb-6">
                  <Check className="w-6 h-6 lg:w-8 lg:h-8 text-white" />
                </div>
                <DialogTitle className="text-xl lg:text-2xl font-redhat text-white mb-3 lg:mb-4">
                  Kiitos tilauksesta!
                </DialogTitle>
                <DialogDescription className="text-gray-300 font-redhat text-base lg:text-lg">
                  Saat pian ensimmäisen uutiskirjeemme sähköpostiisi. Siellä on tarjouksia, alennuksia ja hiusoppaita!
                </DialogDescription>
              </div>
            ) : (
              <>
                <DialogHeader className="text-left mb-4 lg:mb-6">
                  <DialogTitle className="text-xl lg:text-2xl font-redhat text-white mb-2 lg:mb-3">
                    {settings?.title || "Saa alennuksia ja hiusoppaita!"}
                  </DialogTitle>
                  <DialogDescription className="text-gray-300 font-redhat text-sm lg:text-base leading-relaxed">
                    {settings?.description || "Liity uutiskirjeemme tilaajaksi ja saat ensimmäisenä tietoa tarjouksista, alennuksista ja hiusoppaista."}
                  </DialogDescription>
                </DialogHeader>
                
                <form onSubmit={handleSubmit} className="space-y-4 lg:space-y-6">
                  <div className="flex flex-col space-y-2">
                    <label htmlFor="newsletter-email" className="text-sm font-medium text-gray-300 font-redhat">
                      Sähköpostiosoitteesi *
                    </label>
                    <Input
                      id="newsletter-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="oma@sahkoposti.fi"
                      className="bg-gray-900 border-gray-700 text-white placeholder:text-gray-400 h-10 lg:h-12"
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                  
                  <Button 
                    type="submit"
                    className="w-full bg-blondify-blue hover:bg-blue-600 text-white font-redhat h-10 lg:h-12"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Lähetetään...
                      </span>
                    ) : (
                      settings?.button_text || "Tilaa nyt"
                    )}
                  </Button>
                </form>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NewsletterPopup;
