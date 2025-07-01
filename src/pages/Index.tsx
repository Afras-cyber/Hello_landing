
import React, { Suspense } from 'react';
import { useHomepageContent } from '@/hooks/useHomepageContent';
import { Loader2 } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

// Lazy load components to reduce initial bundle size
const DynamicHomepageSection = React.lazy(() => import('@/components/DynamicHomepageSection'));

const Index = () => {
  const { data: sections, isLoading } = useHomepageContent();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <Loader2 className="w-12 h-12 text-blondify-blue animate-spin" />
      </div>
    );
  }

  // Separate campaign banner from other sections
  const campaignBanner = sections?.find(section => section.section_name === 'campaign_banner');
  const otherSections = sections?.filter(section => section.section_name !== 'campaign_banner') || [];

  return (
    <div className="min-h-screen bg-black text-white w-full overflow-x-hidden">
      <Helmet>
        <title>Blondify - Vaaleiden hiusten erikoisliike Helsingissä</title>
        <meta name="description" content="Blondify on vaaleiden hiusten erikoisliike Helsingin Jätkäsaaressa. Tarjoamme laadukkaita vaalennus- ja värjäyspalveluita intohimolla ja ammattitaidolla." />
        
        {/* Preload critical resources */}
        <link rel="preload" href="https://fonts.googleapis.com/css2?family=Red+Hat+Display:wght@300;400;500;600;700;800;900&display=swap" as="style" />
        <link rel="preload" href="https://faytlsrwiszkvakznkux.supabase.co/storage/v1/object/public/media/videos/herom-blondify.jpeg?width=320&quality=60&format=webp" as="image" />
        
        {/* DNS prefetch for external resources */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//faytlsrwiszkvakznkux.supabase.co" />
        
        {/* Preconnect to critical domains */}
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="preconnect" href="https://faytlsrwiszkvakznkux.supabase.co" />
      </Helmet>
      
      {/* Campaign Banner - appears above everything including navbar */}
      {campaignBanner && campaignBanner.is_active && (
        <Suspense fallback={<div className="h-16 bg-gray-900 animate-pulse" />}>
          <DynamicHomepageSection
            key={campaignBanner.id}
            sectionName={campaignBanner.section_name}
            content={campaignBanner}
          />
        </Suspense>
      )}
      
      {/* Add navbar offset for other content */}
      <div className="navbar-offset">
        <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-blondify-blue" /></div>}>
          {otherSections.map((section) => (
            <DynamicHomepageSection
              key={section.id}
              sectionName={section.section_name}
              content={section}
            />
          ))}
        </Suspense>
      </div>
    </div>
  );
};

export default Index;
