import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, Star, Users, ArrowRight, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import OnlineBooking from '@/components/OnlineBooking';
import CampaignServicesCarousel from './CampaignServicesCarousel';
import { useTestimonials } from '@/hooks/useTestimonials';

interface CampaignData {
  id: string;
  name: string;
  description?: string;
  banner_image?: string;
  background_image?: string;
  hero_video_url?: string;
  influencer_name?: string;
  influencer_bio?: string;
  profile_image?: string;
  campaign_text?: string;
  discount_code?: string;
  exclusive_offers?: any[];
  testimonials?: any[];
  gallery_images?: any[];
  featured_products?: any[];
  recommended_services?: any[];
  social_media_urls?: any;
  countdown_end_date?: string;
  custom_styles?: any;
  content_blocks?: any[];
  faq_items?: any[];
  influencer_stats?: any;
  type: 'basic' | 'influencer';
  is_active: boolean;
}

interface EnhancedCampaignTemplateProps {
  campaign: CampaignData;
}

const EnhancedCampaignTemplate: React.FC<EnhancedCampaignTemplateProps> = ({ campaign }) => {
  const sessionId = `campaign_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const { data: dbTestimonials = [] } = useTestimonials();

  // Hero Section - More elegant and refined with better image support
  const renderHeroSection = () => {
    const heroImage = campaign.background_image || campaign.banner_image;
    
    return (
      <section 
        className="relative min-h-[80vh] flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white overflow-hidden"
        style={{
          backgroundImage: heroImage
            ? `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.3)), url(${heroImage})`
            : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        {/* Subtle animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blondify-blue/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="blondify-container px-4 py-16 text-center relative z-10">
          {campaign.type === 'influencer' && campaign.profile_image && (
            <div className="mb-6 animate-fade-in">
              <img 
                src={campaign.profile_image}
                alt={campaign.influencer_name || campaign.name}
                className="w-20 h-20 rounded-full mx-auto border-2 border-blondify-blue/50 shadow-lg hover:scale-105 transition-transform duration-300"
              />
            </div>
          )}
          
          <div className="max-w-4xl mx-auto animate-fade-in">
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 font-redhat leading-tight">
              {campaign.name}
            </h1>

            {campaign.type === 'influencer' && (
              <Badge className="mb-4 bg-gradient-to-r from-purple-500 to-blondify-blue text-white text-sm px-4 py-2 rounded-full shadow-md">
                ✨ Somekampanja
              </Badge>
            )}

            {campaign.influencer_name && (
              <p className="text-lg md:text-xl text-blondify-blue mb-4 font-medium animate-fade-in delay-200">
                {campaign.influencer_name}
              </p>
            )}

            {campaign.description && (
              <p className="text-base md:text-lg mb-8 text-gray-200 leading-relaxed max-w-2xl mx-auto animate-fade-in delay-300">
                {campaign.description}
              </p>
            )}

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8 animate-fade-in delay-500">
              <Button 
                asChild 
                size="lg" 
                className="bg-blondify-blue hover:bg-blue-600 text-white px-8 py-3 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                <Link to="/varaa-aika" className="flex items-center">
                  <Calendar className="mr-2 h-5 w-5" />
                  Varaa aika nyt
                </Link>
              </Button>
              
              <Button 
                asChild 
                variant="outline" 
                size="lg" 
                className="border-white/60 text-white hover:bg-white hover:text-gray-900 px-8 py-3 rounded-full backdrop-blur-sm bg-white/10 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                <Link to="/palvelut" className="flex items-center">
                  Tutustu palveluihin
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    );
  };

  // Campaign Content Section
  const renderCampaignContent = () => (
    <>
      {campaign.campaign_text && (
        <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
          <div className="blondify-container px-4">
            <div className="max-w-4xl mx-auto">
              <div className="prose prose-lg prose-blondify mx-auto text-center">
                <div 
                  dangerouslySetInnerHTML={{ __html: campaign.campaign_text }} 
                  className="text-gray-800 leading-relaxed"
                />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Discount Code Section - Smaller and more elegant */}
      {campaign.discount_code && (
        <section className="py-16 bg-white">
          <div className="blondify-container px-4">
            <div className="max-w-2xl mx-auto text-center">
              <div className="bg-gradient-to-r from-blondify-blue/10 via-purple-50 to-blondify-blue/10 rounded-2xl p-8 shadow-lg border border-blondify-blue/20">
                <div className="mb-4">
                  <span className="text-2xl">🎉</span>
                  <h3 className="text-xl md:text-2xl font-bold text-gray-900 mt-2 mb-3">
                    Erikoiskoodi
                  </h3>
                </div>
                
                <div className="bg-white rounded-xl p-4 shadow-inner border-2 border-dashed border-blondify-blue/30 mb-4">
                  <code className="text-2xl md:text-3xl font-bold text-blondify-blue font-mono tracking-wider">
                    {campaign.discount_code}
                  </code>
                </div>
                
                <p className="text-sm text-gray-600 leading-relaxed">
                  Mainitse tämä koodi varatessasi aikaa ja saat alennusta palvelusta
                </p>
              </div>
            </div>
          </div>
        </section>
      )}
    </>
  );

  // Influencer Bio Section
  const renderInfluencerBio = () => {
    if (campaign.type !== 'influencer' || !campaign.influencer_bio) return null;

    return (
      <section className="py-16 bg-white">
        <div className="blondify-container px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 font-redhat text-gray-900">
                Tietoa {campaign.influencer_name}sta
              </h2>
              <div className="w-20 h-1 bg-gradient-to-r from-blondify-blue to-purple-600 mx-auto rounded-full"></div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-12 items-center">
              {campaign.profile_image && (
                <div className="order-2 md:order-1">
                  <img 
                    src={campaign.profile_image}
                    alt={campaign.influencer_name}
                    className="w-full max-w-md mx-auto rounded-2xl shadow-xl hover:shadow-2xl transition-shadow duration-500 border-2 border-gray-100"
                  />
                </div>
              )}
              
              <div className="order-1 md:order-2">
                <div className="prose prose-lg prose-gray max-w-none">
                  <p className="text-lg leading-relaxed text-gray-700 mb-6">
                    {campaign.influencer_bio}
                  </p>
                </div>
                
                {campaign.influencer_stats && Object.keys(campaign.influencer_stats).length > 0 && (
                  <div className="grid grid-cols-2 gap-4 mt-8">
                    {Object.entries(campaign.influencer_stats).map(([key, value]) => (
                      <div key={key} className="text-center p-4 bg-gray-50 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300">
                        <p className="text-2xl font-bold text-blondify-blue mb-1">{value as string}</p>
                        <p className="text-xs text-gray-600 capitalize font-medium">{key.replace('_', ' ')}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  };

  // Exclusive Offers Section
  const renderExclusiveOffers = () => {
    if (!campaign.exclusive_offers || campaign.exclusive_offers.length === 0) return null;

    return (
      <section className="py-16 bg-gradient-to-br from-blondify-blue via-purple-600 to-blondify-blue text-white relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-x-32 -translate-y-32"></div>
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl translate-x-32 translate-y-32"></div>
        </div>

        <div className="blondify-container px-4 relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 font-redhat">
              🌟 Eksklusiivisia tarjouksia
            </h2>
            <p className="text-lg text-white/90 max-w-2xl mx-auto">
              Vain tämän kampanjan kautta saatavilla olevat erikoistarjoukset
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaign.exclusive_offers.map((offer, index) => (
              <Card key={index} className="bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/15 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105">
                <CardContent className="p-6 text-center">
                  <h3 className="text-xl font-bold mb-3 text-white">{offer.title}</h3>
                  <p className="text-white/90 mb-4 text-base leading-relaxed">{offer.description}</p>
                  {offer.discount && (
                    <Badge className="bg-white text-blondify-blue font-bold text-lg px-4 py-2 shadow-md">
                      -{offer.discount}%
                    </Badge>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  };

  // Testimonials Section - Fixed to properly handle campaign testimonials
  const renderTestimonials = () => {
    // Process campaign testimonials properly
    const campaignTestimonials = (campaign.testimonials || []).map(testimonial => ({
      name: testimonial.name || testimonial.customer_name || 'Anonyymi',
      text: testimonial.text || testimonial.review || testimonial.testimonial_text || '',
      rating: testimonial.rating || 5,
      service: testimonial.service || testimonial.service_type || '',
      avatar: testimonial.avatar || testimonial.image || null
    }));

    // Combine with database testimonials
    const allTestimonials = [
      ...campaignTestimonials,
      ...dbTestimonials.map(testimonial => ({
        name: testimonial.name,
        text: testimonial.text,
        rating: testimonial.rating,
        service: testimonial.service,
        avatar: testimonial.avatar
      }))
    ];

    if (allTestimonials.length === 0) return null;

    return (
      <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="blondify-container px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 font-redhat text-gray-900">
              💬 Asiakaskokemuksia
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Katso mitä asiakkaamme sanovat palveluistamme
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allTestimonials.slice(0, 6).map((testimonial, index) => (
              <Card key={index} className="bg-white shadow-lg hover:shadow-xl transition-all duration-300 border-0 hover:transform hover:scale-105">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`h-5 w-5 ${
                          i < (testimonial.rating || 5) 
                            ? 'text-yellow-400 fill-current' 
                            : 'text-gray-300'
                        }`} 
                      />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-6 italic text-base leading-relaxed">
                    "{testimonial.text || 'Loistava palvelu!'}"
                  </p>
                  <div className="flex items-center">
                    {testimonial.avatar && (
                      <img 
                        src={testimonial.avatar}
                        alt={testimonial.name}
                        className="w-12 h-12 rounded-full mr-3 border-2 border-gray-200"
                      />
                    )}
                    <div>
                      <p className="font-bold text-gray-900">{testimonial.name}</p>
                      {testimonial.service && (
                        <p className="text-gray-500 text-sm">{testimonial.service}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  };

  return (
    <div className="min-h-screen font-redhat bg-white">
      {renderHeroSection()}
      {renderCampaignContent()}
      {renderInfluencerBio()}
      {renderExclusiveOffers()}
      {renderTestimonials()}
      
      {/* Services Carousel with proper spacing */}
      <div className="bg-black">
        <CampaignServicesCarousel />
      </div>
      
      {/* Booking Section */}
      <div className="bg-black">
        <OnlineBooking sessionId={sessionId} />
      </div>
    </div>
  );
};

export default EnhancedCampaignTemplate;
