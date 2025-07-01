
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Copy, ExternalLink, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Campaign } from '@/hooks/useCampaign';

interface BasicCampaignTemplateProps {
  campaign: Campaign;
}

const BasicCampaignTemplate: React.FC<BasicCampaignTemplateProps> = ({ campaign }) => {
  const { toast } = useToast();

  const copyDiscountCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: "Koodi kopioitu",
      description: "Alennuskoodi kopioitu leikepöydälle",
    });
  };

  return (
    <div className="min-h-screen bg-black py-20 font-redhat">
      <div className="blondify-container">
        {/* Header Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">{campaign.name}</h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-4xl mx-auto">{campaign.description}</p>
          
          {campaign.banner_image && (
            <div className="relative w-full max-w-4xl mx-auto mb-8">
              <img 
                src={campaign.banner_image} 
                alt={campaign.name} 
                className="w-full h-80 md:h-96 object-cover rounded-lg"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-lg"></div>
            </div>
          )}
        </div>

        {/* Discount Code Section */}
        {campaign.discount_code && (
          <div className="mb-16 p-8 border border-blondify-blue rounded-lg bg-blue-900/20 text-center">
            <h2 className="text-2xl font-bold mb-4">Erikoisalennuskoodi</h2>
            <p className="mb-6 text-lg">Käytä tätä koodia saadaksesi alennuksen:</p>
            <div className="flex items-center justify-center gap-3 max-w-md mx-auto">
              <div className="bg-white text-black font-bold py-3 px-6 rounded-l-md text-xl flex-1 text-center">
                {campaign.discount_code}
              </div>
              <Button 
                variant="outline" 
                className="rounded-r-md border-l-0 border-white" 
                onClick={() => copyDiscountCode(campaign.discount_code || '')}
              >
                <Copy className="mr-2 h-4 w-4" /> Kopioi
              </Button>
            </div>
          </div>
        )}

        {/* Pricing Table */}
        {campaign.pricing_table && campaign.pricing_table.length > 0 && (
          <div className="mb-16">
            <h2 className="text-3xl font-bold mb-8 text-center">Kampanjahinnat</h2>
            <div className="bg-gray-900 rounded-lg overflow-hidden max-w-4xl mx-auto">
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
                        <td className="px-6 py-4 text-center text-blondify-blue font-bold text-lg">{row.campaign_price}</td>
                        <td className="px-6 py-4 text-center text-green-400 font-semibold">{row.savings}</td>
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
            <h2 className="text-3xl font-bold mb-8 text-center">Tarjouksessa olevat palvelut</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {campaign.recommended_services.map((service, index) => (
                <div 
                  key={index} 
                  className={`p-6 rounded-lg border text-center ${
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

        {/* Content Blocks */}
        {campaign.content_blocks && campaign.content_blocks.length > 0 && (
          <div className="mb-16 space-y-10">
            {campaign.content_blocks.map((block: any, index: number) => {
              if (block.type === 'video') {
                return (
                  <div key={index} className="aspect-video w-full max-w-4xl mx-auto">
                    <iframe
                      src={block.url}
                      title={`Campaign Video ${index}`}
                      className="w-full h-full rounded-lg"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  </div>
                );
              } else if (block.type === 'image') {
                return (
                  <div key={index} className="w-full max-w-4xl mx-auto text-center">
                    <img 
                      src={block.url} 
                      alt={block.caption || `Campaign Image ${index}`} 
                      className="w-full rounded-lg"
                    />
                    {block.caption && (
                      <p className="mt-4 text-gray-400">{block.caption}</p>
                    )}
                  </div>
                );
              } else if (block.type === 'text') {
                return (
                  <div key={index} className="prose prose-invert max-w-4xl mx-auto">
                    <div dangerouslySetInnerHTML={{ __html: block.content }}></div>
                  </div>
                );
              }
              return null;
            })}
          </div>
        )}

        {/* Testimonials */}
        {campaign.testimonials && campaign.testimonials.length > 0 && (
          <div className="mb-16">
            <h2 className="text-3xl font-bold mb-8 text-center">Asiakaspalautteet</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {campaign.testimonials.map((testimonial, index) => (
                <div key={index} className="bg-gray-900 p-6 rounded-lg text-center">
                  <div className="flex justify-center mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`w-5 h-5 ${i < testimonial.rating ? 'text-yellow-400 fill-current' : 'text-gray-600'}`} 
                      />
                    ))}
                  </div>
                  <p className="text-gray-300 mb-4 italic">"{testimonial.review}"</p>
                  <span className="font-medium text-blondify-blue">{testimonial.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* FAQ Section */}
        {campaign.faq_items && campaign.faq_items.length > 0 && (
          <div className="mb-16">
            <h2 className="text-3xl font-bold mb-8 text-center">Usein kysytyt kysymykset</h2>
            <div className="space-y-4 max-w-4xl mx-auto">
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

        {/* Call to Action */}
        <div className="text-center bg-gray-900 p-12 rounded-lg">
          <h2 className="text-3xl font-bold mb-4">Valmis aloittamaan?</h2>
          <p className="text-xl text-gray-300 mb-8">Varaa aikasi tänään ja hyödynnä nämä upeat tarjoukset!</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              asChild 
              size="lg"
              className="bg-blondify-blue hover:bg-blue-400 text-white px-8 py-4 text-lg"
            >
              <Link to="/varaa-aika">Varaa aika</Link>
            </Button>
            <Button 
              asChild 
              variant="outline"
              size="lg"
              className="border-blondify-blue text-blondify-blue hover:bg-blondify-blue hover:text-white px-8 py-4 text-lg"
            >
              <Link to="/palvelut">Tutustu palveluihin</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BasicCampaignTemplate;
