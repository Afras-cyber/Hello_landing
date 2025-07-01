
import React from 'react';
import { usePageContent, getPageContent } from '@/hooks/usePageContent';
import { Helmet } from 'react-helmet-async';
import { Loader2 } from 'lucide-react';

const Blog = () => {
  const { data: pageContent, isLoading } = usePageContent('blogi');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <Loader2 className="w-12 h-12 text-blondify-blue animate-spin" />
      </div>
    );
  }
  
  const heroTitle = getPageContent(pageContent, 'hero_title', 'Blogi');
  const introContent = getPageContent(pageContent, 'intro_content', 'Tämä sivu on kehityksen alla. Tarkempi sisältö tulee myöhemmin.');

  return (
    <>
      <Helmet>
        <title>{heroTitle.text} - Blondify</title>
        <meta name="description" content="Lue Blondifyn blogista vinkkejä ja uutisia vaaleiden hiusten maailmasta." />
      </Helmet>
      <div className="min-h-screen bg-black text-white navbar-offset">
        <div className="blondify-container py-16 md:py-24">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-center">{heroTitle.text}</h1>
          {introContent.type === 'richtext' ? (
            <div
              className="prose prose-invert lg:prose-xl mx-auto mt-8 text-center"
              dangerouslySetInnerHTML={{ __html: introContent.text }}
            />
          ) : (
            <p className="prose prose-invert lg:prose-xl mx-auto mt-8 text-center">{introContent.text}</p>
          )}
        </div>
      </div>
    </>
  );
};

export default Blog;
