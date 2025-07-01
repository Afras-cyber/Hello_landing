
import React from 'react';
import { Helmet } from 'react-helmet-async';
import { usePageContent, getPageContent } from '@/hooks/usePageContent';
import PortfolioGallery from '@/components/PortfolioGallery';
import { Loader2 } from 'lucide-react';

const Portfolio = () => {
  const { data: pageContent, isLoading } = usePageContent('portfolio');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <Loader2 className="w-12 h-12 text-blondify-blue animate-spin" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Portfolio - Blondify</title>
        <meta name="description" content="Katso Blondifyn töiden portfoliota ja inspiroidu upeista hiusmuutoksista." />
        <link rel="preload" as="fetch" href="/api/unified-portfolio" />
      </Helmet>
      
      <div className="min-h-screen bg-black text-white">
        {/* Hero Section - Optimized for faster LCP */}
        <div className="relative h-[50vh] bg-black">
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black"></div>
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center px-4">
                    <h1 className="text-3xl md:text-5xl font-bold mb-4 font-redhat text-white">
                        {getPageContent(pageContent, 'hero_title', 'Portfolio').text}
                    </h1>
                    <p className="text-base md:text-lg text-gray-300 max-w-2xl mx-auto font-redhat">
                        Katso upeita hiusmuutoksia ja inspiroidu seuraavaa kampaajakäyntiäsi varten
                    </p>
                </div>
            </div>
        </div>

        {/* Portfolio Gallery - Optimized loading */}
        <section className="py-12 px-4">
          <div className="max-w-7xl mx-auto">
            <PortfolioGallery />
          </div>
        </section>
      </div>
    </>
  );
};

export default Portfolio;
