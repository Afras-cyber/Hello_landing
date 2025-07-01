
import React from 'react';
import { CheckCircle2 } from "lucide-react";
import { usePageContent, getPageContent } from '@/hooks/usePageContent';
import { Loader2 } from 'lucide-react';

interface SustainabilityPrinciple {
  title: string;
  description: string;
}

const defaultPrinciples: SustainabilityPrinciple[] = [
  {
    title: "Ekologiset tuotteet",
    description: "Käytämme SIM SensiDO-värisarjaa: vegaaninen, hajusteeton ja valmistettu Suomessa uusiutuvalla energialla. Ympäristö­sertifikaatit ja läpinäkyvät raaka-ainelistat varmistavat, että jokainen vaalennus on yhtä puhdas kuin lopputulos."
  },
  {
    title: "Veden säästö",
    description: "Säästämme vettä emmekä pidä hanaa turhaan päällä. Lisäksi valitsemamme ekologiset pesupaikat säästävät turhaa vedenkulutusta."
  },
  {
    title: "Digitaalinen kuitti",
    description: "Suosimme digitaalisuutta ja säästämme paperissa: Kuitit ja varausvahvistukset lähetetään pääasiassa sähköpostitse tai tekstiviestillä."
  },
  {
    title: "Reilu ja selkeä hinnoittelu",
    description: "Hinnoittelumme perustuu palveluun ja lopputulokseen, ja hintamme ovat samat kaikille meillä käyville asiakkaille. Kaikki hintamme löytyvät avoimesti nettisivuiltamme."
  },
  {
    title: "Työolosuhteet",
    description: "Mukavat taukotilat palautumiseen, ergonomiset työ­välineet rasituksen minimoimiseksi ja huippuluokan suojatarvikkeet kemikaaliturvallisuuteen – perusta, jonka varaan rakennamme terveellisen työpäivän."
  }
];

const Sustainability: React.FC = () => {
  const { data: pageContent, isLoading } = usePageContent('vastuullisuus');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <Loader2 className="w-12 h-12 text-blondify-blue animate-spin" />
      </div>
    );
  }

  const heroTitle = getPageContent(pageContent, 'hero_title', 'Vastuullisuus');
  const heroDescription = getPageContent(pageContent, 'hero_description', 'Haluamme tarjota kauniita hiuksia ympäristöä ja ihmisiä kunnioittaen');
  const heroImageUrl = getPageContent(pageContent, 'hero_image_url', 'https://faytlsrwiszkvakznkux.supabase.co/storage/v1/object/public/media/kampaamot/kampaamo-jatkasaari.webp');
  const heroImageAlt = getPageContent(pageContent, 'hero_image_alt', 'Blondify kampaamo - vastuullista kauneutta');
  const section1Title = getPageContent(pageContent, 'section1_title', 'Vastuullisuus Blondifylla');
  const section1Content1 = getPageContent(pageContent, 'section1_content1', 'Vaaleiden hiusten asiantuntijana ymmärrämme vastuumme sekä ympäristöä että asiakkaitamme kohtaan. Olemme kehittäneet toimintaamme kestävämpään suuntaan monin tavoin, ja jatkamme jatkuvasti työtämme sen ympärillä. Samalla huolehdimme, että palvelumme laatu pysyy korkeana ja asiakkaiden hiukset terveinä.');
  const section1Content2 = getPageContent(pageContent, 'section1_content2', '');
  const principlesTitle = getPageContent(pageContent, 'principles_title', 'Kestävän kehityksen periaatteemme');
  const principlesContent = getPageContent(pageContent, 'principles', defaultPrinciples);
  const principles: SustainabilityPrinciple[] = Array.isArray(principlesContent.content) && principlesContent.content.length > 0 ? principlesContent.content : defaultPrinciples;
  const finalCtaTitle = getPageContent(pageContent, 'final_cta_title', 'Sitoudumme kestävään kauneuteen');
  const finalCtaDescription = getPageContent(pageContent, 'final_cta_description', 'Vastuullisuus on meille jatkuva kehitysprosessi. Otamme mielellämme vastaan ideoita ja palautetta siitä, miten voisimme tehdä toiminnastamme entistä ympäristöystävällisempää.');
  const finalCtaButtonText = getPageContent(pageContent, 'final_cta_button_text', 'Anna palautetta');

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="relative h-[60vh] bg-black">
        <div className="absolute inset-0">
          <img 
            src={heroImageUrl.text}
            alt={heroImageAlt.text}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-black/70"></div>
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-4 font-redhat">{heroTitle.text}</h1>
            <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto font-redhat">
              {heroDescription.text}
            </p>
          </div>
        </div>
      </div>

      <div className="blondify-container py-16">
        <div className="max-w-3xl mb-16">
          <h2 className="text-3xl font-bold mb-6 font-redhat">{section1Title.text}</h2>
          <p className="text-gray-300 mb-6 font-redhat">
            {section1Content1.text}
          </p>
          <p className="text-gray-300 font-redhat">
            {section1Content2.text}
          </p>
        </div>

        <h2 className="text-3xl font-bold mb-10 text-left font-redhat">{principlesTitle.text}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {principles.map((principle, index) => (
            <div key={index} className="bg-gray-900 p-6 rounded-lg">
              <div className="flex items-center mb-4">
                <CheckCircle2 className="text-blondify-blue mr-3 h-6 w-6" />
                <h3 className="text-xl font-semibold font-redhat">{principle.title}</h3>
              </div>
              <p className="text-gray-300 font-redhat">{principle.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 p-8 bg-gray-900 rounded-lg text-center">
          <h3 className="text-2xl font-bold mb-4 font-redhat">{finalCtaTitle.text}</h3>
          <p className="text-gray-300 mb-6 max-w-2xl mx-auto font-redhat">
            {finalCtaDescription.text}
          </p>
          <a 
            href="https://form.typeform.com/to/HnogrLvu" 
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-6 py-3 bg-blondify-blue text-white rounded hover:bg-blue-600 transition-colors font-redhat"
          >
            {finalCtaButtonText.text}
          </a>
        </div>
      </div>
    </div>
  );
};

export default Sustainability;
