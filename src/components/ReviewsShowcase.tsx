import React, { useRef, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import { useIntersectionObserver } from "@/hooks/use-intersection-observer";
import { Star } from "lucide-react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

// Memoize review data to avoid recreation on every render
const reviewData = [
  {
    platform: 'Trustpilot',
    rating: '4.8/5',
    count: 'Anna meille arvostelu',
    icon: () => (
      <img
        src="https://faytlsrwiszkvakznkux.supabase.co/storage/v1/object/public/media/logot/trustpilot_ikoni.png"
        alt="Trustpilot"
        className="w-20 h-20 md:w-24 md:h-24 object-contain"
        loading="lazy"
        decoding="async"
        fetchPriority="auto"
      />
    ),
    color: 'text-green-500',
    link: 'https://fi.trustpilot.com/review/blondify.fi',
    stars: 5
  },
  {
    platform: 'Google',
    rating: '4.4/5',
    count: '7 arvostelua',
    icon: () => (
      <img
        src="https://faytlsrwiszkvakznkux.supabase.co/storage/v1/object/public/media/logot/google_ikoni.png"
        alt="Google"
        className="w-20 h-20 md:w-24 md:h-24 object-contain"
        loading="lazy"
        decoding="async"
        fetchPriority="auto"
      />
    ),
    color: 'text-blue-500',
    link: 'https://www.google.com/search?sca_esv=5276e13006ffd282&q=blondify&si=AMgyJEtREmoPL4P1I5IDCfuA8gybfVI2d5Uj7QMwYCZHKDZ-E45YIwVFX07fsOpiCe8PNGowSIwHezoamGauKpyotYZC3y4qox_vEvuVoHdQNpZPws0jiC8%3D&uds=AOm0WdHgQDH3BWuaTTIJ7hSgDeZxbxO3n1L39kPMe4mTeoCQPGg4jwDR_wlz7eJYXbIQJ5_7qJCGc-bwWJwHCiZZS3LyIjUZ5ELOaPjiF_diIyjChKbJd34&sa=X&sqi=2&ved=2ahUKEwiq28vu0cqNAxV2EhAIHZh0KxIQ3PALegQIHRAE&biw=1281&bih=685&dpr=2',
    stars: 4
  },
  {
    platform: 'Timma',
    rating: '4.9/5',
    count: '135 arvostelua',
    icon: () => (
      <img
        src="https://faytlsrwiszkvakznkux.supabase.co/storage/v1/object/public/media/logot/timma-white1.png"
        alt="Timma"
        className="w-20 h-20 md:w-24 md:h-24 object-contain"
        loading="lazy"
        decoding="async"
        fetchPriority="auto"
      />
    ),
    color: 'text-gray-300',
    link: 'https://timma.fi/yritys/vimma-hair-oy',
    stars: 5
  }
];

const ReviewsShowcase: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  useIntersectionObserver(containerRef, {
    threshold: 0.1,
    rootMargin: "100px"
  });

  // Memoize stars rendering
  const renderStars = useMemo(
    () => (count: number) =>
      Array.from({ length: count }, (_, i) => (
        <Star key={i} className="w-3 h-3 md:w-4 md:h-4 fill-yellow-400 text-yellow-400" />
      )),
    []
  );

  return (
    <section className="relative py-16 md:py-20 bg-black overflow-hidden" ref={containerRef}>
      {/* Centered section header */}
      <div className="relative z-10 text-center mb-12 px-4">
        <div className="blondify-container">
          <h2 className="text-2xl md:text-4xl font-bold mb-4 font-redhat text-white">
            Asiakkaiden kokemuksia
          </h2>
          <p className="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed font-redhat">
            Asiakkaidemme arvostelut ja kokemukset eri alustoilta
          </p>
          {/* Decorative line */}
          <div className="mt-8 flex justify-center"></div>
        </div>
      </div>

      {/* Reviews grid for desktop, carousel for mobile */}
      <div className="blondify-container relative z-10">
        {/* Mobile carousel */}
        <div className="block md:hidden">
          <Carousel
            opts={{
              align: "center",
              loop: true,
              skipSnaps: false,
              dragFree: false
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-4">
              {reviewData.map((review) => {
                const IconComponent = review.icon;
                return (
                  <CarouselItem key={review.platform} className="pl-4 basis-full">
                    <div className="text-center px-4">
                      {/* Platform icon */}
                      <div className={`flex justify-center mb-6 ${review.color}`}>
                        <IconComponent />
                      </div>
                      {/* Platform name */}
                      <h3 className="text-white font-redhat font-bold text-lg mb-4 drop-shadow-lg">
                        {review.platform}
                      </h3>
                      {/* Rating with stars or large text */}
                      <div className="mb-3">
                        <div className="text-white font-redhat font-bold text-xl mb-2 drop-shadow-lg">
                          {review.rating}
                        </div>
                        {review.stars > 0 && (
                          <div className="flex justify-center gap-1 mb-2">
                            {renderStars(review.stars)}
                          </div>
                        )}
                      </div>
                      {/* Count */}
                      <div className="text-gray-300 text-base font-medium mb-4 drop-shadow-lg">
                        {review.count}
                      </div>
                      {/* Call to action link */}
                      {review.link && (
                        <a
                          href={review.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blondify-blue hover:text-blondify-blue/80 text-sm font-semibold transition-colors duration-300 drop-shadow-lg"
                        >
                          Katso kaikki
                        </a>
                      )}
                    </div>
                  </CarouselItem>
                );
              })}
            </CarouselContent>
            <CarouselPrevious className="left-4 bg-black/80 border-blondify-blue/30 text-white hover:bg-blondify-blue/20 hover:border-blondify-blue" />
            <CarouselNext className="right-4 bg-black/80 border-blondify-blue/30 text-white hover:bg-blondify-blue/20 hover:border-blondify-blue" />
          </Carousel>
        </div>

        {/* Desktop grid */}
        <div className="hidden md:grid grid-cols-3 gap-6 lg:gap-8 xl:gap-12">
          {reviewData.map((review) => {
            const IconComponent = review.icon;
            return (
              <div key={review.platform} className="text-center">
                {/* Platform icon */}
                <div className={`flex justify-center mb-4 md:mb-6 ${review.color}`}>
                  <IconComponent />
                </div>
                {/* Platform name */}
                <h3 className="text-white font-redhat font-bold text-lg mb-3 md:mb-4 drop-shadow-lg md:text-xl">
                  {review.platform}
                </h3>
                {/* Rating with stars or large text */}
                <div className="mb-3 md:mb-4">
                  <div className="text-white font-redhat font-bold text-xl md:text-2xl mb-2 drop-shadow-lg">
                    {review.rating}
                  </div>
                  {review.stars > 0 && (
                    <div className="flex justify-center gap-1 mb-2">
                      {renderStars(review.stars)}
                    </div>
                  )}
                </div>
                {/* Count */}
                <div className="text-gray-300 text-base md:text-lg font-medium mb-3 md:mb-4 drop-shadow-lg">
                  {review.count}
                </div>
                {/* Call to action link */}
                {review.link && (
                  <a
                    href={review.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blondify-blue hover:text-blondify-blue/80 text-sm md:text-base font-semibold transition-colors duration-300 drop-shadow-lg"
                  >
                    Katso kaikki
                  </a>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default React.memo(ReviewsShowcase);