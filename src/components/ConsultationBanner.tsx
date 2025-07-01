import React, { useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import { Calendar } from "lucide-react";
import OptimizedImage from './OptimizedImage';

interface ConsultationBannerProps {
  content?: {
    title?: string;
    description?: string;
    button_text?: string;
    button_url?: string;
    image_url?: string;
    background_color?: string;
  };
}

const defaultContent = {
  title: "Ilmainen 15 min konsultaatio",
  description: "Etkö ole varma, mitä haluaisit hiuksillesi? Varaa maksuton 15 minuutin konsultaatio.",
  button_text: "Varaa aika",
  button_url: "/varaa-aika",
  image_url: "https://faytlsrwiszkvakznkux.supabase.co/storage/v1/object/public/media/images/ilmainen-konsultaatio.webp",
  background_color: "#48bcff"
};

const ConsultationBanner: React.FC<ConsultationBannerProps> = React.memo(({ content }) => {
  const bannerContent = useMemo(
    () => ({ ...defaultContent, ...content }),
    [content]
  );

  const sectionStyle = useMemo(
    () => ({ backgroundColor: bannerContent.background_color }),
    [bannerContent.background_color]
  );

  return (
    <section className="py-8 w-full overflow-hidden" style={sectionStyle}>
      <div className="blondify-container flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-col md:flex-row items-center w-full md:w-auto">
          <div className="hidden sm:block md:mr-4 mb-4 md:mb-0">
            {/* If you want to show the image, uncomment below */}
            {/* <OptimizedImage src={bannerContent.image_url} alt={bannerContent.title} loading="lazy" className="rounded-lg shadow-lg max-h-32" /> */}
          </div>
          <div className="text-center md:text-left w-full">
            <h3 className="text-2xl md:text-3xl font-bold text-white font-redhat mb-2">
              {bannerContent.title}
            </h3>
            <p className="text-white opacity-90 font-redhat-light text-center md:text-left">
              {bannerContent.description}
            </p>
          </div>
        </div>
        <div className="w-full md:w-auto flex justify-center md:justify-end mt-4 md:mt-0">
          <Button asChild size="lg" variant="light-bg" className="min-w-[220px]">
            <Link to={bannerContent.button_url} className="flex items-center justify-center gap-3">
              <Calendar className="h-5 w-5" />
              <span className="whitespace-nowrap">{bannerContent.button_text}</span>
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
});

export default ConsultationBanner;