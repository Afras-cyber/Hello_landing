
import React, { useEffect } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { useCampaign } from '@/hooks/useCampaign';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import InfluencerCampaignTemplate from '@/components/campaigns/InfluencerCampaignTemplate';
import BasicCampaignTemplate from '@/components/campaigns/BasicCampaignTemplate';
import EnhancedCampaignTemplate from '@/components/campaigns/EnhancedCampaignTemplate';
import { trackAffiliateClick } from '@/utils/affiliateLinks';

const CampaignPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const { data: campaign, isLoading, error } = useCampaign(slug || '');
  
  // Track affiliate click if UTM parameters are present
  useEffect(() => {
    if (campaign && slug) {
      const utmSource = searchParams.get('utm_source');
      const utmMedium = searchParams.get('utm_medium');
      const utmCampaign = searchParams.get('utm_campaign');
      const utmContent = searchParams.get('utm_content');
      const utmTerm = searchParams.get('utm_term');

      // If this is an affiliate link (has UTM parameters), track the click
      if (utmSource || utmMedium || utmCampaign) {
        const utmParams = {
          source: utmSource || '',
          medium: utmMedium || '',
          campaign: utmCampaign || '',
          content: utmContent || '',
          term: utmTerm || ''
        };

        // We'll need to find the redirect_id based on the campaign and UTM params
        // For now, we'll use a dummy redirect_id - this should be improved to find the actual redirect
        trackAffiliateClick(campaign.id, 'dummy-redirect-id', utmParams);
        
        console.log('Tracked affiliate click for campaign:', campaign.name, utmParams);
      }
    }
  }, [campaign, slug, searchParams]);
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-black py-20 font-redhat">
        <div className="blondify-container">
          <Skeleton className="h-12 w-3/4 mb-8 bg-gray-800 mx-auto" />
          <Skeleton className="h-6 w-full mb-4 bg-gray-800" />
          <Skeleton className="h-6 w-2/3 mb-10 bg-gray-800" />
          <Skeleton className="h-64 w-full mb-8 rounded-lg bg-gray-800" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-40 w-full bg-gray-800 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  if (error || !campaign) {
    return (
      <div className="min-h-screen bg-black py-20 text-center font-redhat">
        <div className="blondify-container">
          <h1 className="text-3xl font-bold mb-6 text-red-500">Kampanjaa ei löytynyt</h1>
          <p className="text-gray-300 mb-8">Hakemaasi kampanjaa ei löytynyt tai se ei ole enää voimassa.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild className="bg-blondify-blue hover:bg-blue-400">
              <Link to="/kampanjat">Katso muita kampanjoita</Link>
            </Button>
            <Button asChild variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800">
              <Link to="/">Takaisin etusivulle</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Use enhanced template for all campaigns now
  return <EnhancedCampaignTemplate campaign={campaign} />;
};

export default CampaignPage;
