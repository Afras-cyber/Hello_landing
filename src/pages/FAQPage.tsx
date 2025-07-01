
import React from 'react';
import { Helmet } from 'react-helmet-async';
import FAQ from '@/components/FAQ';
import { usePageContent, getPageContent } from '@/hooks/usePageContent';
import { useFaqItems } from '@/hooks/useFaqItems';
import { Loader2 } from 'lucide-react';

const FAQPage = () => {
  const { data: pageContent, isLoading: pageLoading } = usePageContent('ukk');
  const { data: faqItems, isLoading: faqLoading } = useFaqItems();
  
  const titleContent = getPageContent(pageContent, 'faq_title', { text: 'UKK - Usein kysytyt kysymykset' });
  const descriptionContent = getPageContent(pageContent, 'faq_description', { text: 'Löydä vastaukset yleisimpiin kysymyksiin Blondifyn palveluista, varauksista ja hiustenhoidosta.' });

  // Convert database FAQ items to the format expected by the FAQ component
  const faqItemsForComponent = faqItems?.map(item => ({
    question: item.question,
    answer: item.answer
  })) || [];

  if (pageLoading || faqLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-16 h-16 animate-spin text-blondify-blue" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{`${titleContent.text} | Blondify`}</title>
        <meta name="description" content={descriptionContent.text} />
        <meta name="keywords" content="ukk, usein kysytyt kysymykset, blondify, hiustenhoito, varaukset, palvelut" />
        <link rel="canonical" href="https://www.blondify.fi/faq" />
      </Helmet>
      
      <div className="min-h-screen bg-black text-white">
        <div className="relative h-[60vh] bg-black">
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center px-4">
              <h1 className="text-4xl md:text-6xl font-bold mb-4 font-redhat">UKK</h1>
              <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto font-redhat">
                {descriptionContent.text}
              </p>
            </div>
          </div>
        </div>
        
        <FAQ items={faqItemsForComponent} />
      </div>
    </>
  );
};

export default FAQPage;
