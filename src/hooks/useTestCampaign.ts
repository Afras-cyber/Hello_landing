
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Hook to create a test campaign if it doesn't exist already
export function useTestCampaign() {
  const { toast } = useToast();
  
  useEffect(() => {
    const createTestCampaign = async () => {
      try {
        // Check if the test campaign already exists
        const { data: existingCampaign } = await supabase
          .from('campaigns')
          .select('*')
          .eq('slug', 'kesatarjous-2025')
          .single();
          
        if (existingCampaign) {
          console.log('Test campaign already exists:', existingCampaign);
          return;
        }
        
        // Create a new test campaign
        const { data, error } = await supabase
          .from('campaigns')
          .insert([
            {
              name: 'Kesätarjous 2025',
              description: 'Loistava tarjouskampanja kesän kauneimpiin vaaleisiin hiuksiin. Ota tämä etu käyttöön heti!',
              slug: 'kesatarjous-2025',
              type: 'influencer',
              influencer_name: 'Sofia Sunlight',
              banner_image: 'https://faytlsrwiszkvakznkux.supabase.co/storage/v1/object/public/media/campaigns/summer_offer_2025.jpg',
              discount_code: 'SUNLIGHT25',
              is_active: true,
              social_media_urls: {
                instagram: 'https://instagram.com/blondifyfinland',
                tiktok: 'https://tiktok.com/@blondifyfinland',
                youtube: 'https://youtube.com/c/Blondify'
              },
              content_blocks: [
                {
                  type: 'text',
                  content: '<h3>Miksi valita tämä kampanja?</h3><p>Kesä on parasta aikaa huolehtia hiustesi kunnosta ja saada ne näyttämään upealta. Tämä tarjous sisältää erikoiskäsittelyn, joka suojaa hiuksia auringolta ja merivedeltä.</p>'
                },
                {
                  type: 'video',
                  url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
                  caption: 'Katso miten upeat kesähiukset saadaan aikaan!'
                },
                {
                  type: 'text',
                  content: '<h3>Tarjouksen ehdot</h3><p>Tarjous on voimassa 30.8.2025 saakka. Alennus koskee vain uusia varauksia eikä sitä voi yhdistää muihin tarjouksiin. Muista mainita alennuskoodi varausta tehdessäsi!</p>'
                }
              ],
              recommended_services: [
                {
                  id: '123e4567-e89b-12d3-a456-426614174000',
                  name: 'Vaalennuspaketti All-Inclusive',
                  highlight: true
                },
                {
                  id: '223e4567-e89b-12d3-a456-426614174001',
                  name: 'Blondify Special Highlights'
                },
                {
                  id: '323e4567-e89b-12d3-a456-426614174002',
                  name: 'Blondify Refresh -sävytys'
                }
              ]
            }
          ])
          .select()
          .single();
          
        if (error) {
          console.error('Error creating test campaign:', error);
          toast({
            title: 'Virhe',
            description: 'Testikampanjan luominen epäonnistui.',
            variant: 'destructive',
          });
        } else {
          console.log('Test campaign created:', data);
        }
      } catch (err) {
        console.error('Unexpected error creating campaign:', err);
      }
    };
    
    createTestCampaign();
  }, [toast]);
  
  return null;
}
