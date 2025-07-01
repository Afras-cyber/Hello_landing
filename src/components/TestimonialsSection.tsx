
import React, { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from '@/hooks/use-mobile';
import { Star } from 'lucide-react';

interface SpecialistTestimonial {
  id: string;
  customer_name: string;
  customer_age?: number;
  testimonial_text: string;
  image_url?: string;
  is_featured: boolean;
}

interface TestimonialsSectionProps {
  specialistId: string;
}

const TestimonialsSection: React.FC<TestimonialsSectionProps> = ({ specialistId }) => {
  const [testimonials, setTestimonials] = useState<SpecialistTestimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const isMobile = useIsMobile();

  useEffect(() => {
    const fetchTestimonials = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('specialist_testimonials')
          .select('*')
          .eq('specialist_id', specialistId)
          .order('is_featured', { ascending: false })
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching testimonials:', error);
          return;
        }

        if (data) {
          setTestimonials(data);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTestimonials();
  }, [specialistId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blondify-blue"></div>
      </div>
    );
  }

  if (testimonials.length === 0) {
    return null; // Don't show section if no testimonials
  }

  return (
    <section className="py-8 md:py-12">
      <h4 className="text-2xl md:text-3xl lg:text-4xl font-semibold font-redhat mb-8 md:mb-12 text-center">
        Asiakaspalautteet
      </h4>
      
      <div className={`grid gap-6 md:gap-8 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
        {testimonials.map((testimonial) => (
          <div 
            key={testimonial.id} 
            className={`bg-gray-900 rounded-lg p-6 md:p-8 border border-gray-800 hover:border-blondify-blue/50 transition-all duration-300 min-h-[200px] flex flex-col justify-between ${
              testimonial.is_featured ? 'ring-2 ring-blondify-blue/30' : ''
            }`}
          >
            {/* Star rating */}
            <div className="flex items-center mb-4">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className="h-4 w-4 text-yellow-400 fill-current" 
                />
              ))}
            </div>
            
            {/* Testimonial text */}
            <blockquote className="text-gray-300 italic mb-6 font-redhat leading-relaxed flex-1">
              "{testimonial.testimonial_text}"
            </blockquote>
            
            {/* Customer info */}
            <div className="flex items-center mt-auto">
              {testimonial.image_url && (
                <img 
                  src={testimonial.image_url} 
                  alt={testimonial.customer_name}
                  className="w-10 h-10 rounded-full object-cover mr-3"
                />
              )}
              <div>
                <p className="text-blondify-blue font-semibold font-redhat">
                  {testimonial.customer_name}
                  {testimonial.customer_age && (
                    <span className="text-gray-400 font-normal">, {testimonial.customer_age}v</span>
                  )}
                </p>
                {testimonial.is_featured && (
                  <p className="text-xs text-yellow-400 font-redhat mt-1">Suosittu palaute</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default TestimonialsSection;
