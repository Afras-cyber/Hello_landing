
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCampaigns } from '@/hooks/useCampaigns';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useTestCampaign } from '@/hooks/useTestCampaign';

const CampaignsListPage: React.FC = () => {
  const { data: campaigns, isLoading, error } = useCampaigns();
  
  // Use the hook to create a test campaign if it doesn't exist
  useTestCampaign();

  return (
    <div className="min-h-screen bg-black py-20 font-redhat">
      <div className="blondify-container">
        <h1 className="text-4xl font-bold mb-4 text-center">Tarjouskampanjat</h1>
        <p className="text-xl text-gray-300 mb-12 text-center max-w-3xl mx-auto">
          Tutustu voimassa oleviin tarjouskampanjoihimme ja hyödynnä ainutlaatuiset edut
        </p>

        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="rounded-lg overflow-hidden">
                <Skeleton className="h-48 w-full bg-gray-800" />
                <div className="p-4 bg-gray-900">
                  <Skeleton className="h-8 w-3/4 mb-4 bg-gray-800" />
                  <Skeleton className="h-4 w-full mb-2 bg-gray-800" />
                  <Skeleton className="h-4 w-2/3 mb-4 bg-gray-800" />
                  <Skeleton className="h-10 w-32 bg-gray-800" />
                </div>
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="text-center text-red-500 py-12">
            <h3 className="text-2xl mb-2">Virhe kampanjoiden lataamisessa</h3>
            <p>Yritä myöhemmin uudelleen</p>
          </div>
        )}

        {campaigns && campaigns.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {campaigns.map((campaign) => (
              <div 
                key={campaign.id} 
                className="rounded-lg overflow-hidden bg-gray-900 hover:bg-gray-800 transition-colors"
                data-gtm-element="campaign_card"
                data-gtm-campaign-id={campaign.id}
                data-gtm-campaign-name={campaign.name}
              >
                {campaign.banner_image && (
                  <div className="relative h-48">
                    <img
                      src={campaign.banner_image}
                      alt={campaign.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-60"></div>
                  </div>
                )}
                <div className="p-6">
                  <h2 className="text-2xl font-bold mb-2">{campaign.name}</h2>
                  <p className="text-gray-300 mb-4">{campaign.description}</p>
                  <Button 
                    asChild 
                    className="bg-blondify-blue hover:bg-blue-400"
                    data-gtm-element="view_campaign_button"
                    data-gtm-campaign-slug={campaign.slug}
                  >
                    <Link to={`/kampanja/${campaign.slug}`}>Katso kampanja</Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          !isLoading && (
            <div className="text-center py-12">
              <h3 className="text-2xl mb-4">Ei aktiivisia kampanjoita</h3>
              <p className="text-gray-300 mb-8">Seuraa somekanaviamme ja palaa pian uusien tarjouksien perässä!</p>
              <Button asChild className="bg-blondify-blue hover:bg-blue-400">
                <Link to="/palvelut">Tutustu palveluihin</Link>
              </Button>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default CampaignsListPage;
