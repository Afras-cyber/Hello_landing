
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Button } from "@/components/ui/button";
import { useServiceBySlug } from '@/hooks/useServiceBySlug';
import { ArrowLeft } from 'lucide-react';

const ServiceDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: service, isLoading, isError } = useServiceBySlug(slug);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white navbar-offset">
        <div className="blondify-container py-16 text-center">
          <p className="font-redhat">Ladataan palvelua...</p>
        </div>
      </div>
    );
  }

  if (isError || !service) {
    return (
      <div className="min-h-screen bg-black text-white navbar-offset">
        <div className="blondify-container py-16 text-center">
          <h1 className="text-3xl font-bold mb-4 font-redhat">Palvelua ei löytynyt</h1>
          <Button asChild variant="outline" className="mt-4">
            <Link to="/palvelut" className="font-redhat">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Takaisin palveluihin
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const title = service.meta_title || `${service.name} | Blondify`;
  const description = service.meta_description || service.description;
  const keywords = service.meta_keywords || `blondify, kampaamo, ${service.name}`;

  return (
    <>
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="keywords" content={keywords} />
        <link rel="canonical" href={`https://www.blondify.fi/palvelut/${slug}`} />
      </Helmet>
      <div className="min-h-screen bg-black text-white navbar-offset">
        <div className="blondify-container py-16">
          <Button asChild variant="outline" className="mb-8">
            <Link to="/palvelut" className="font-redhat">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Takaisin palveluihin
            </Link>
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <AspectRatio ratio={3/4} className="overflow-hidden rounded-lg mb-6">
                <img 
                  src={service.image_path || '/placeholder.svg'} 
                  alt={service.name} 
                  className="w-full h-full object-cover"
                />
              </AspectRatio>
              
              {service.price && (
                <div className="bg-gray-900 p-6 rounded-lg">
                  <h3 className="text-xl font-bold mb-2 font-redhat">Hinta</h3>
                  <p className="text-2xl text-blondify-blue font-redhat">{service.price}</p>
                </div>
              )}
            </div>

            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-6 font-redhat">{service.name}</h1>
              
              {service.has_landing_page && Array.isArray(service.landing_page_content) && service.landing_page_content.length > 0 ? (
                <div className="space-y-8 mb-8">
                  {(service.landing_page_content as any[]).map((block, index) => {
                    if (block.type === 'richtext' && block.data?.html) {
                      return (
                        <div
                          key={block.id || index}
                          className="prose prose-lg prose-invert max-w-none font-redhat"
                          dangerouslySetInnerHTML={{ __html: block.data.html }}
                        />
                      );
                    }
                    return null;
                  })}
                </div>
              ) : (
                <div className="prose prose-lg prose-invert mb-8 font-redhat">
                  <p>{service.description}</p>
                </div>
              )}

              <Button asChild size="lg" className="bg-blondify-blue hover:bg-blue-600 w-full md:w-auto">
                <Link to="/varaa-aika" className="font-redhat">Varaa aika</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ServiceDetail;
