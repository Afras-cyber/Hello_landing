
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from 'lucide-react';
import CampaignForm from '@/components/admin/CampaignForm';
import AffiliateAnalytics from '@/components/admin/AffiliateAnalytics';
import EnhancedLinkGenerator from '@/components/admin/EnhancedLinkGenerator';

const AdminCampaignDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const [campaign, setCampaign] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  useEffect(() => {
    fetchCampaign();
  }, [id]);
  
  const fetchCampaign = async () => {
    try {
      setLoading(true);
      
      if (id === 'new') {
        const campaignType = searchParams.get('type') || 'basic';
        setCampaign({ type: campaignType });
        setIsEditing(true);
        setLoading(false);
        return;
      }
      
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      setCampaign(data);
    } catch (error) {
      console.error('Error fetching campaign:', error);
      toast({
        title: "Virhe",
        description: "Kampanjan tietojen hakeminen epäonnistui.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleGoBack = () => {
    navigate('/admin/campaigns');
  };
  
  const handleEditSuccess = (campaignId?: string) => {
    setIsEditing(false);
    
    if (id === 'new' && campaignId) {
      navigate(`/admin/campaigns/${campaignId}`);
      return;
    }
    
    fetchCampaign();
    toast({
      title: "Tallennettu",
      description: "Kampanjan tiedot päivitetty onnistuneesti."
    });
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8 h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blondify-blue" />
      </div>
    );
  }
  
  const getCampaignTypeTitle = () => {
    if (id === 'new') {
      const campaignType = searchParams.get('type') || 'basic';
      return campaignType === 'influencer' ? 'Uusi somekampanja' : 'Uusi peruskampanja';
    }
    return campaign?.name || 'Kampanjan tiedot';
  };

  const socialMediaProfiles = campaign?.social_media_urls ? 
    Object.entries(campaign.social_media_urls)
      .filter(([platform, data]: [string, any]) => data.profile_url)
      .map(([platform, data]: [string, any]) => ({ platform, url: data.profile_url }))
    : [];
  
  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Button 
          variant="outline" 
          size="icon"
          onClick={handleGoBack}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold font-redhat">
          {getCampaignTypeTitle()}
        </h1>
        {campaign?.type && (
          <span className={`px-3 py-1 rounded text-sm ${
            campaign.type === 'influencer' 
              ? 'bg-purple-800 text-purple-200' 
              : 'bg-blue-800 text-blue-200'
          }`}>
            {campaign.type === 'influencer' ? 'Somekampanja' : 'Peruskampanja'}
          </span>
        )}
      </div>
      
      {(isEditing || id === 'new') ? (
        <CampaignForm 
          onClose={() => {
            setIsEditing(false);
            if (id === 'new') {
              navigate('/admin/campaigns');
            }
          }}
          onSuccess={handleEditSuccess}
          editingCampaign={campaign}
          isInline={true}
        />
      ) : (
        <div className="space-y-6">
          {campaign && (
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
              <div className="flex flex-col md:flex-row gap-8">
                <div className="w-full md:w-1/3">
                  {campaign.banner_image && (
                    <img 
                      src={campaign.banner_image}
                      alt={campaign.name}
                      className="w-full aspect-[16/9] object-cover rounded-lg"
                    />
                  )}
                </div>
                
                <div className="w-full md:w-2/3">
                  <div className="mb-6">
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-xl font-bold">{campaign.name}</h2>
                      <span className={`px-2 py-1 rounded text-xs ${
                        campaign.type === 'influencer' 
                          ? 'bg-purple-800 text-purple-200' 
                          : 'bg-blue-800 text-blue-200'
                      }`}>
                        {campaign.type === 'influencer' ? 'Somekampanja' : 'Peruskampanja'}
                      </span>
                    </div>
                    
                    {campaign.is_active ? (
                      <div className="inline-block bg-green-900/30 text-green-400 border border-green-900/50 px-2 py-1 rounded-md text-xs">
                        Aktiivinen
                      </div>
                    ) : (
                      <div className="inline-block bg-gray-800 text-gray-400 border border-gray-700 px-2 py-1 rounded-md text-xs">
                        Ei aktiivinen
                      </div>
                    )}
                  </div>
                  
                  {campaign.description && (
                    <div className="mb-6">
                      <h3 className="text-sm font-semibold text-gray-400 mb-2">Kuvaus</h3>
                      <p className="text-sm text-gray-300">{campaign.description}</p>
                    </div>
                  )}
                  
                  {campaign.slug && (
                    <div className="mb-6">
                      <h3 className="text-sm font-semibold text-gray-400 mb-2">URL-polku</h3>
                      <p className="text-sm text-gray-300">/kampanja/{campaign.slug}</p>
                    </div>
                  )}

                  {socialMediaProfiles.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-sm font-semibold text-gray-400 mb-2">Somekanavat</h3>
                      <div className="space-y-1">
                        {socialMediaProfiles.map(({ platform, url }) => (
                          <div key={platform} className="flex items-center gap-2">
                            <span className="text-xs text-gray-500 capitalize w-20">{platform}:</span>
                            <a 
                              href={url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-xs text-blue-400 hover:text-blue-300 break-all"
                            >
                              {url}
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex gap-3 mt-8">
                    <Button
                      onClick={() => setIsEditing(true)}
                      className="bg-blondify-blue hover:bg-blue-600"
                    >
                      Muokkaa tietoja
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Enhanced Link Generator - Show for all campaigns with slug */}
          {campaign && campaign.slug && (
            <EnhancedLinkGenerator 
              campaignSlug={campaign.slug}
              influencerName={campaign.influencer_name || campaign.name}
              campaignId={campaign.id}
            />
          )}

          {/* Affiliate Analytics Section - Only show for influencer campaigns */}
          {campaign && campaign.type === 'influencer' && campaign.slug && (
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
              <h2 className="text-xl font-bold mb-4">Yksityiskohtainen analytiikka</h2>
              <AffiliateAnalytics 
                campaignId={campaign.id}
                campaignSlug={campaign.slug}
                influencerName={campaign.influencer_name}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminCampaignDetail;
