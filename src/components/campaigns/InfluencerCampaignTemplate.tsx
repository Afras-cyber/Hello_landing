import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Instagram, Youtube, ExternalLink, Copy, Star, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Campaign } from '@/hooks/useCampaign';
import CampaignAnalyticsWidget from './CampaignAnalyticsWidget';
import AffiliateLinkGenerator from './AffiliateLinkGenerator';
import SocialProofWidget from './SocialProofWidget';
import ReferralCodeDisplay from './ReferralCodeDisplay';
import InfluencerLinkManager from './InfluencerLinkManager';

const TikTok = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
  </svg>
);

interface InfluencerCampaignTemplateProps {
  campaign: Campaign;
}

const InfluencerCampaignTemplate: React.FC<InfluencerCampaignTemplateProps> = ({ campaign }) => {
  const { toast } = useToast();

  const socialIcons: Record<string, React.ReactNode> = {
    instagram: <Instagram className="w-5 h-5" />,
    youtube: <Youtube className="w-5 h-5" />,
    tiktok: <TikTok className="w-5 h-5" />,
    website: <ExternalLink className="w-5 h-5" />
  };

  const copyDiscountCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: "Koodi kopioitu",
      description: "Alennuskoodi kopioitu leikepöydälle",
    });
  };

  return (
    <div className="min-h-screen bg-black font-redhat">
      {/* Hero Section */}
      <div className="relative min-h-screen flex items-center justify-center">
        {campaign.hero_video_url ? (
          <div className="absolute inset-0 w-full h-full">
            <iframe
              src={campaign.hero_video_url}
              className="w-full h-full object-cover"
              allow="autoplay; muted"
              title="Campaign Hero Video"
            ></iframe>
            <div className="absolute inset-0 bg-black/40"></div>
          </div>
        ) : campaign.banner_image ? (
          <div className="absolute inset-0 w-full h-full">
            <img 
              src={campaign.banner_image} 
              alt={campaign.name} 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
          </div>
        ) : null}
        
        <div className="relative z-10 text-center px-6 max-w-4xl">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 text-white">{campaign.name}</h1>
          {campaign.influencer_name && (
            <p className="text-xl md:text-2xl text-blondify-blue mb-4">with {campaign.influencer_name}</p>
          )}
          <p className="text-xl md:text-2xl text-gray-200 mb-8 max-w-3xl mx-auto">{campaign.description}</p>
          
          {/* Countdown Timer */}
          {campaign.countdown_end_date && (
            <div className="mb-8 p-6 bg-red-900/30 rounded-lg border border-red-500/50">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-red-400" />
                <span className="text-red-400 font-semibold">Kampanja päättyy pian!</span>
              </div>
              <p className="text-white">Käytä tilaisuus hyväksesi</p>
            </div>
          )}
          
          <Button 
            asChild 
            size="lg"
            className="bg-blondify-blue hover:bg-blue-400 text-white px-8 py-4 text-lg"
          >
            <Link to="/varaa-aika">Varaa aika nyt</Link>
          </Button>
        </div>
      </div>

      <div className="blondify-container py-20">
        {/* Analytics and Affiliate Tools Section - Only visible to influencers/admins */}
        {campaign.influencer_name && (
          <div className="mb-16">
            <h2 className="text-3xl font-bold mb-8 text-center">Kampanjan seuranta ja työkalut</h2>
            <div className="grid lg:grid-cols-3 gap-6 mb-8">
              <div className="lg:col-span-2">
                <CampaignAnalyticsWidget campaignId={campaign.id} showDetailed={true} />
              </div>
              <div>
                <SocialProofWidget campaignId={campaign.id} />
              </div>
            </div>
            
            <div className="grid lg:grid-cols-2 gap-6 mb-8">
              <AffiliateLinkGenerator 
                campaignSlug={campaign.slug} 
                influencerName={campaign.influencer_name} 
              />
              <ReferralCodeDisplay campaignId={campaign.id} />
            </div>

            {/* Enhanced Link Manager */}
            <div className="mb-8">
              <InfluencerLinkManager 
                campaignSlug={campaign.slug}
                influencerName={campaign.influencer_name}
                socialMediaUrls={campaign.social_media_urls}
              />
            </div>
          </div>
        )}

        {/* Influencer Bio Section */}
        {campaign.influencer_bio && (
          <div className="mb-16">
            <h2 className="text-3xl font-bold mb-6 text-center">Tietoa {campaign.influencer_name}sta</h2>
            <div className="bg-gray-900 p-8 rounded-lg">
              <p className="text-gray-300 text-lg leading-relaxed">{campaign.influencer_bio}</p>
              
              {/* Influencer Stats */}
              {campaign.influencer_stats && Object.keys(campaign.influencer_stats).length > 0 && (
                <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-6">
                  {Object.entries(campaign.influencer_stats).map(([key, value]) => (
                    <div key={key} className="text-center">
                      <div className="text-2xl font-bold text-blondify-blue">{value}</div>
                      <div className="text-gray-400 capitalize">{key}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Enhanced Social Media Links */}
        {campaign.social_media_urls && Object.keys(campaign.social_media_urls).length > 0 && (
          <div className="mb-16">
            <h2 className="text-3xl font-bold mb-8 text-center">Seuraa somessa</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(campaign.social_media_urls).map(([platform, urls]: [string, any]) => (
                <div key={platform} className="bg-gray-900 p-6 rounded-lg">
                  <h3 className="flex items-center gap-3 mb-4 text-lg font-semibold capitalize">
                    {socialIcons[platform] || <ExternalLink className="w-5 h-5" />}
                    {platform}
                  </h3>
                  
                  <div className="space-y-3">
                    {urls.bio_link && (
                      <a 
                        href={urls.bio_link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="block w-full px-4 py-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors text-center text-sm"
                      >
                        Profiili / Bio
                      </a>
                    )}
                    {urls.story_link && (
                      <a 
                        href={urls.story_link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="block w-full px-4 py-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors text-center text-sm"
                      >
                        Tarinat / Stories
                      </a>
                    )}
                    {urls.post_link && (
                      <a 
                        href={urls.post_link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="block w-full px-4 py-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors text-center text-sm"
                      >
                        Viimeisimmät postaukset
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Exclusive Offers */}
        {campaign.exclusive_offers && campaign.exclusive_offers.length > 0 && (
          <div className="mb-16">
            <h2 className="text-3xl font-bold mb-8 text-center">Eksklusiiviset tarjoukset</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {campaign.exclusive_offers.map((offer, index) => (
                <div key={index} className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 p-6 rounded-lg border border-purple-500/30">
                  <h3 className="text-xl font-bold mb-2">{offer.title}</h3>
                  <p className="text-gray-300 mb-4">{offer.description}</p>
                  {offer.discount && (
                    <div className="text-2xl font-bold text-purple-400">{offer.discount}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Discount Code */}
        {campaign.discount_code && (
          <div className="mb-16 p-8 border border-blondify-blue rounded-lg bg-blue-900/20">
            <h2 className="text-3xl font-bold mb-4 text-center">Eksklusiivinen alennuskoodi</h2>
            <p className="text-center mb-6 text-lg">Käytä tätä koodia saadaksesi erikoishinnan:</p>
            <div className="flex items-center justify-center gap-4">
              <div className="bg-white text-black font-bold py-4 px-8 rounded-l-md text-2xl">
                {campaign.discount_code}
              </div>
              <Button 
                variant="outline" 
                className="rounded-r-md border-l-0 border-white py-4" 
                onClick={() => copyDiscountCode(campaign.discount_code || '')}
              >
                <Copy className="mr-2 h-5 w-5" /> Kopioi
              </Button>
            </div>
          </div>
        )}

        {/* Gallery */}
        {campaign.gallery_images && campaign.gallery_images.length > 0 && (
          <div className="mb-16">
            <h2 className="text-3xl font-bold mb-8 text-center">Galleria</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {campaign.gallery_images.map((image, index) => (
                <div key={index} className="relative group">
                  <img 
                    src={image.url} 
                    alt={image.alt_text || `Galleria kuva ${index + 1}`} 
                    className="w-full aspect-square object-cover rounded-lg group-hover:scale-105 transition-transform"
                  />
                  {image.caption && (
                    <p className="mt-2 text-sm text-gray-400 text-center">{image.caption}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Partner Logos */}
        {campaign.partner_logos && campaign.partner_logos.length > 0 && (
          <div className="mb-16">
            <h2 className="text-3xl font-bold mb-8 text-center">Yhteistyökumppanit</h2>
            <div className="flex flex-wrap justify-center items-center gap-8">
              {campaign.partner_logos.map((partner, index) => (
                <a 
                  key={index}
                  href={partner.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block hover:opacity-75 transition-opacity"
                >
                  <img 
                    src={partner.logo_url} 
                    alt={partner.name} 
                    className="h-12 w-auto grayscale hover:grayscale-0 transition-all"
                  />
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Testimonials */}
        {campaign.testimonials && campaign.testimonials.length > 0 && (
          <div className="mb-16">
            <h2 className="text-3xl font-bold mb-8 text-center">Mitä asiakkaat sanovat</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {campaign.testimonials.map((testimonial, index) => (
                <div key={index} className="bg-gray-900 p-6 rounded-lg">
                  <div className="flex mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`w-5 h-5 ${i < testimonial.rating ? 'text-yellow-400 fill-current' : 'text-gray-600'}`} 
                      />
                    ))}
                  </div>
                  <p className="text-gray-300 mb-4">"{testimonial.review}"</p>
                  <div className="flex items-center gap-3">
                    {testimonial.image_url && (
                      <img 
                        src={testimonial.image_url} 
                        alt={testimonial.name} 
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    )}
                    <span className="font-medium">{testimonial.name}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pricing Table */}
        {campaign.pricing_table && campaign.pricing_table.length > 0 && (
          <div className="mb-16">
            <h2 className="text-3xl font-bold mb-8 text-center">Kampanjahinnat</h2>
            <div className="bg-gray-900 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-800">
                    <tr>
                      <th className="px-6 py-4 text-left">Palvelu</th>
                      <th className="px-6 py-4 text-center">Normaalihinta</th>
                      <th className="px-6 py-4 text-center">Kampanjahinta</th>
                      <th className="px-6 py-4 text-center">Säästät</th>
                    </tr>
                  </thead>
                  <tbody>
                    {campaign.pricing_table.map((row, index) => (
                      <tr key={index} className="border-t border-gray-700">
                        <td className="px-6 py-4 font-medium">{row.service}</td>
                        <td className="px-6 py-4 text-center text-gray-400 line-through">{row.original_price}</td>
                        <td className="px-6 py-4 text-center text-blondify-blue font-bold">{row.campaign_price}</td>
                        <td className="px-6 py-4 text-center text-green-400">{row.savings}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Recommended Services */}
        {campaign.recommended_services && campaign.recommended_services.length > 0 && (
          <div className="mb-16">
            <h2 className="text-3xl font-bold mb-8 text-center">Suositellut palvelut</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {campaign.recommended_services.map((service, index) => (
                <div 
                  key={index} 
                  className={`p-6 rounded-lg border ${
                    service.highlight 
                      ? 'border-blondify-blue bg-blue-900/20' 
                      : 'border-gray-700 bg-gray-900'
                  }`}
                >
                  <h3 className="text-xl font-semibold mb-4">{service.name}</h3>
                  {service.highlight && (
                    <span className="inline-block px-3 py-1 text-xs bg-blondify-blue text-white rounded-full mb-4">
                      Suositelluin
                    </span>
                  )}
                  <Button 
                    asChild 
                    className="w-full bg-blondify-blue hover:bg-blue-400"
                  >
                    <Link to={`/varaa-aika/${service.id}`}>Varaa aika</Link>
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* FAQ Section */}
        {campaign.faq_items && campaign.faq_items.length > 0 && (
          <div className="mb-16">
            <h2 className="text-3xl font-bold mb-8 text-center">Usein kysytyt kysymykset</h2>
            <div className="space-y-4">
              {campaign.faq_items.map((item, index) => (
                <details key={index} className="bg-gray-900 rounded-lg">
                  <summary className="p-6 cursor-pointer hover:bg-gray-800 rounded-lg transition-colors">
                    <span className="font-semibold">{item.question}</span>
                  </summary>
                  <div className="px-6 pb-6">
                    <p className="text-gray-300">{item.answer}</p>
                  </div>
                </details>
              ))}
            </div>
          </div>
        )}

        {/* Final CTA */}
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-6">Valmis muutokseen?</h2>
          <p className="text-xl text-gray-300 mb-8">Varaa aikasi tänään ja koe ainutlaatuinen palvelu!</p>
          <Button 
            asChild 
            size="lg"
            className="bg-blondify-blue hover:bg-blue-400 text-white px-8 py-4 text-lg"
          >
            <Link to="/varaa-aika">Varaa aika nyt</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default InfluencerCampaignTemplate;
