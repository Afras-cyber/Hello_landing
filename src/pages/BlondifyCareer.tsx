import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useCareers } from '@/hooks/useCareers';
import { usePageContent, getPageContent } from '@/hooks/usePageContent';
import { Loader2 } from 'lucide-react';
import CareerApplicationModal from '@/components/CareerApplicationModal';

const BlondifyCareer: React.FC = () => {
  const { data: jobPositions, isLoading: careersLoading, error } = useCareers();
  const { data: pageContent, isLoading: pageLoading } = usePageContent('ura');
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    jobTitle?: string;
  }>({
    isOpen: false
  });

  const heroTitle = getPageContent(pageContent, 'hero_title', { text: 'Ura Blondifylla' });
  const heroDescription = getPageContent(pageContent, 'hero_description', { text: 'Liity Suomen vaaleimpien hiusten asiantuntijatiimiin ja kehitä osaamistasi huippuammattilaisten seurassa' });
  
  const whyWorkTitle = getPageContent(pageContent, 'why_work_title', { text: 'Miksi työskennellä Blondifylla?' });
  const whyWorkDescription = getPageContent(pageContent, 'why_work_description', { text: '<p>Blondify on erikoistunut vaaleiden hiusten kampaamoketju, jossa arvostamme ammattitaitoa, jatkuvaa kehittymistä ja asiakastyytyväisyyttä. Tarjoamme työntekijöillemme mahdollisuuden kehittyä alansa huippuosaajiksi ja työskennellä modernissa, inspiroivassa ympäristössä. Blondifylla on tavoitteena kasvaa Pohjoimaiden parhaimmaksi vaaleiden hiusten kampaamoketjuksi, joten urapolun ei tarvitse rajoittua vain kampaamossa toimivaksi Blonde Specialistiksi.</p>' });
  
  const benefitsTitle = getPageContent(pageContent, 'benefits_title', { text: 'Edut' });
  const benefitsList = getPageContent(pageContent, 'benefits_list', { text: '<ul><li>Jatkuva koulutus ja ammatillinen kehitys</li><li>Kilpailukykyinen palkka ja bonusjärjestelmä</li><li>Moderni työympäristö ja huippuluokan työvälineet</li><li>Yhteisöllinen ja kannustava työilmapiiri</li><li>Joustavat työajat ja yrittäjän etuudet</li></ul>' });
  
  const openAppTitle = getPageContent(pageContent, 'open_app_title', { text: 'Eikö sopivaa paikkaa ole avoinna?' });
  const openAppDescription = getPageContent(pageContent, 'open_app_description', { text: 'Olemme aina kiinnostuneita tapaamaan osaavia ja innostuneita alan ammattilaisia. Lähetä avoin hakemus, niin otamme sinuun yhteyttä!' });

  const openPositionsTitle = getPageContent(pageContent, 'open_positions_title', { text: 'Avoimet työpaikat' });
  const noOpenPositions = getPageContent(pageContent, 'no_open_positions', { text: 'Ei avoimia työpaikkoja tällä hetkellä. Lähetä avoin hakemus kiinnostuksestasi!' });

  const errorLoadingTitle = getPageContent(pageContent, 'error_loading_title', { text: 'Virhe ladattaessa työpaikkoja' });
  const errorLoadingDescription = getPageContent(pageContent, 'error_loading_description', { text: 'Yritä päivittää sivu tai tarkista yhteytesi.' });

  const isLoading = pageLoading || careersLoading;

  const openJobApplicationModal = (jobTitle: string) => {
    setModalState({
      isOpen: true,
      jobTitle
    });
  };

  const handleEmailApplication = () => {
    const subject = encodeURIComponent('Avoin työhakemus - Blondify');
    const body = encodeURIComponent('Hei,\n\nOlen kiinnostunut työskentelemään Blondifylla.\n\nYstävällisin terveisin,');
    window.location.href = `mailto:vilma@blondify.fi?subject=${subject}&body=${body}`;
  };

  const closeModal = () => {
    setModalState({
      isOpen: false
    });
  };

  if (pageLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-16 h-16 animate-spin text-blondify-blue" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="relative h-[60vh] bg-black">
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-4 font-redhat">{heroTitle.text}</h1>
            <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto font-redhat leading-relaxed">
              {heroDescription.text}
            </p>
          </div>
        </div>
      </div>

      <div className="blondify-container py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div>
            <h2 className="text-3xl font-bold mb-6 font-redhat">{whyWorkTitle.text}</h2>
            <div
              className="text-gray-300 mb-8 font-redhat leading-relaxed prose prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: whyWorkDescription.text }}
            />
            
            <h3 className="text-xl font-semibold mb-4 font-redhat">{benefitsTitle.text}</h3>
            <div
              className="mb-8 prose prose-invert max-w-none [&>ul]:list-none [&>ul]:p-0 [&>ul>li]:flex [&>ul>li]:items-start [&>ul>li]:font-redhat [&>ul>li]:leading-relaxed [&>ul>li_::before]:content-['•'] [&>ul>li_::before]:text-blondify-blue [&>ul>li_::before]:mr-2"
              dangerouslySetInnerHTML={{ __html: benefitsList.text }}
            />

            <div className="bg-gray-900 p-6 rounded-lg mb-8">
              <h3 className="text-xl font-semibold mb-4 font-redhat">{openAppTitle.text}</h3>
              <p className="text-gray-300 mb-4 font-redhat leading-relaxed">
                {openAppDescription.text}
              </p>
              <a 
                href="mailto:vilma@blondify.fi?subject=Avoin%20työhakemus%20-%20Blondify&body=Hei,%0A%0AOlen%20kiinnostunut%20työskentelemään%20Blondifylla.%0A%0AYstävällisin%20terveisin,"
                className="text-blondify-blue hover:text-blue-400 transition-colors duration-300 font-redhat text-lg underline"
              >
                vilma@blondify.fi
              </a>
            </div>
          </div>

          <div>
            <h2 className="text-3xl font-bold mb-6 font-redhat">{openPositionsTitle.text}</h2>
            
            {isLoading && (
              <div className="space-y-6">
                {[1, 2, 3].map((_, index) => (
                  <Card key={index} className="bg-gray-900 border-gray-800">
                    <CardContent className="p-6">
                      <Skeleton className="h-6 w-3/4 mb-2 bg-gray-800" />
                      <div className="flex flex-wrap gap-4 mb-4">
                        <Skeleton className="h-5 w-20 bg-gray-800" />
                        <Skeleton className="h-5 w-24 bg-gray-800" />
                      </div>
                      <Skeleton className="h-20 w-full mb-6 bg-gray-800" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
            
            {error && (
              <div className="p-6 bg-gray-900 rounded-lg">
                <p className="text-red-400 mb-2 font-redhat">{errorLoadingTitle.text}</p>
                <p className="text-gray-300 font-redhat leading-relaxed">{errorLoadingDescription.text}</p>
              </div>
            )}
            
            {!isLoading && !error && jobPositions && jobPositions.length === 0 && (
              <div className="p-6 bg-gray-900 rounded-lg">
                <p className="text-gray-300 font-redhat leading-relaxed">
                  {noOpenPositions.text}
                </p>
              </div>
            )}
            
            {!isLoading && !error && jobPositions && jobPositions.length > 0 && (
              <div className="space-y-6">
                {jobPositions.map(job => (
                  <Card key={job.id} className="bg-gray-900 border-gray-800">
                    <CardContent className="p-6">
                      <h3 className="text-xl font-bold mb-2 font-redhat text-white">{job.title}</h3>
                      <div className="flex flex-wrap gap-4 mb-4">
                        <span className="text-sm bg-gray-800 px-3 py-1 rounded text-gray-300 font-redhat">{job.location}</span>
                        <span className="text-sm bg-gray-800 px-3 py-1 rounded text-gray-300 font-redhat">{job.type}</span>
                      </div>
                      <p className="text-gray-300 font-redhat leading-relaxed whitespace-pre-line">
                        {job.description}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <CareerApplicationModal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        jobTitle={modalState.jobTitle}
        isOpenApplication={false}
      />
    </div>
  );
};

export default BlondifyCareer;
