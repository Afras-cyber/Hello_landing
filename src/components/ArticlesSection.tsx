
import React, { useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import { ArrowRight } from "lucide-react";
import { useIntersectionObserver } from "@/hooks/use-intersection-observer";
import { useArticles } from "@/hooks/useArticles";
import { Skeleton } from "@/components/ui/skeleton";
import OptimizedImage from './OptimizedImage';

const ArticlesSection: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { data: articles, isLoading, error } = useArticles();
  
  const entry = useIntersectionObserver(containerRef, {
    threshold: 0.1,
    rootMargin: "100px"
  });

  // Show only the 3 most recent articles
  const featuredArticles = articles?.slice(0, 3) || [];

  return (
    <section 
      ref={containerRef}
      className="relative py-16 bg-black overflow-hidden"
    >
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-r from-blondify-blue/5 via-transparent to-blondify-blue/5 opacity-40"></div>
      
      <div className="blondify-container relative z-10">
        {/* Section header - simplified and more focused */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 font-redhat text-white">
            Artikkelit
          </h2>
          
          <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed font-redhat">
            Tuoreimmat vinkit ja trendit blondien maailmasta
          </p>
        </div>

        {/* Articles content */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-900/60 rounded-xl overflow-hidden border border-gray-800/50">
                <Skeleton className="w-full h-48 bg-gray-800" />
                <div className="p-6">
                  <Skeleton className="h-6 w-full mb-3 bg-gray-800" />
                  <Skeleton className="h-4 w-full mb-2 bg-gray-800" />
                  <Skeleton className="h-4 w-3/4 bg-gray-800" />
                </div>
              </div>
            ))}
          </div>
        ) : error || !featuredArticles.length ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg font-redhat">
              {error ? "Artikkeleiden lataaminen epäonnistui" : "Ei artikkeleita saatavilla"}
            </p>
          </div>
        ) : (
          <>
            {/* Articles grid - optimized layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {featuredArticles.map((article, index) => (
                <Link 
                  key={article.id} 
                  to={`/artikkelit/${article.slug}`}
                  className="group block"
                >
                  <article className="bg-gray-900/60 rounded-xl overflow-hidden border border-gray-800/50 hover:border-blondify-blue/30 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-blondify-blue/10 h-full flex flex-col">
                    {/* Article image - load immediately for presentation mode */}
                    <div className="w-full h-48 relative overflow-hidden">
                      <OptimizedImage
                        src={article.imageUrl}
                        alt={article.title}
                        width={600}
                        height={300}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        priority={true}
                        loading="eager"
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                    
                    {/* Article content - optimized spacing */}
                    <div className="p-6 flex-grow flex flex-col">
                      {/* Article title */}
                      <h3 className="text-xl font-semibold text-white mb-3 font-redhat group-hover:text-blondify-blue transition-colors duration-300 line-clamp-2 flex-shrink-0">
                        {article.title}
                      </h3>
                      
                      {/* Article excerpt */}
                      <p className="text-gray-300 text-sm leading-relaxed font-redhat line-clamp-3 flex-grow">
                        {article.excerpt}
                      </p>

                      {/* Read more indicator */}
                      <div className="flex items-center text-blondify-blue text-sm font-medium mt-4 group-hover:text-blue-300 transition-colors">
                        <span>Lue artikkeli</span>
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>

            {/* View all articles button - enhanced styling */}
            <div className="text-center">
              <Button 
                asChild 
                size="lg" 
                className="bg-gradient-to-r from-blondify-blue to-blondify-blue/80 hover:from-blondify-blue/90 hover:to-blondify-blue/70 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 font-redhat"
              >
                <Link to="/artikkelit" className="inline-flex items-center">
                  <span className="font-medium text-lg">Katso kaikki artikkelit</span>
                  <ArrowRight className="ml-3 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default ArticlesSection;
