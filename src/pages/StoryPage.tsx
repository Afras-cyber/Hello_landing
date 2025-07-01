
import React from 'react';
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { usePageContent, getPageContent } from '@/hooks/usePageContent';
import { Loader2 } from 'lucide-react';

const StoryPage: React.FC = () => {
  const { data: pageContent, isLoading } = usePageContent('tarina');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <Loader2 className="w-12 h-12 text-blondify-blue animate-spin" />
      </div>
    );
  }

  const heroTitle = getPageContent(pageContent, 'hero_title', 'Blondify – Vaaleiden hiusten asiantuntijat');
  const heroDescription = getPageContent(pageContent, 'hero_description', 'halusin paikan josta löydät kaikki vaaleiden hiusten palvelut - laadukkaasti ja turvallisesti');
  
  const section1Title = getPageContent(pageContent, 'section1_title', 'Kuinka kaikki alkoi');
  const section1Content = getPageContent(pageContent, 'section1_content', '<p>Blondify sai alkunsa helmikuussa 2022, kun huomasin omien vaaleiden hiusteni katkenneen kampaamossa vaalennuksen jäljiltä. Mietin, miksi ei ole kampaamoa, joka keskittyisi pelkästään vaaleisiin hiuksiin ja niiden erityistarpeisiin. Ratkaisin ongelman perustamalla sellaisen itse.</p>');
  const section1ImageUrl = getPageContent(pageContent, 'section1_image_url', 'https://faytlsrwiszkvakznkux.supabase.co/storage/v1/object/public/media/images/vilma-kotro.webp');
  const section1ImageAlt = getPageContent(pageContent, 'section1_image_alt', 'Vilma Kotro, Blondifyn perustaja ja toimitusjohtaja');
  const section1ImageCaption = getPageContent(pageContent, 'section1_image_caption', 'Vilma Kotro, 24, Founder & CEO, Blondify');
  
  const section2Title = getPageContent(pageContent, 'section2_title', 'Laadun varmistus');
  const section2Content = getPageContent(pageContent, 'section2_content', '<p>Havaitsimme vuonna 2024, ettei pelkkä työkokemus ja hienot tittelit riitä saavuttamaan parasta tasoa. Siksi kehitimme Blonde Specialistin -koulutuksen, jonka jokainen Blondifyn- kampaaja suorittaa ennen itsenäisen työn aloittamista. Koulutus sisältää:</p><ul><li>Teoriaosuuden hiuksista ja vaalennuksista</li><li>Käytännön harjoituksia ja kokeita</li><li>Junior Blonde Specialist -harjoittelujakson</li></ul><p>Vasta hyväksytysti suoritetun ohjelman jälkeen Blonde Specialisti työskentelee itsenäisesti asiakkaidemme parissa.</p>');
  
  const section3Title = getPageContent(pageContent, 'section3_title', 'Tulevaisuus');
  const section3Content = getPageContent(pageContent, 'section3_content', '<p>Kasvatamme ja kehitämme koko ajan yritystä Pohjoismaiden parhaimmaksi ja luotettavimmaksi vaaleiden hiusten kampaamoksi, jotta kaikille Pohjoismaalaisille blondeille löytyisi turvallinen ja laadukas paikka. Tervetuloa Blondifyyn toteuttamaan oma blondiunelmasi.</p>');

  const ctaButtonText = getPageContent(pageContent, 'cta_button_text', 'Varaa aika luoksemme');

  const [titlePart1, titlePart2] = heroTitle.text.includes(' – ') ? heroTitle.text.split(' – ') : [heroTitle.text, ''];

  return (
    <div className="min-h-screen bg-black text-white">
      <div 
        className="relative h-[60vh] bg-black"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-black"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center px-4">
            <h1 className="text-4xl md:text-6xl font-bold mb-4 font-redhat leading-tight">
              {titlePart1}
              {titlePart2 && <br />}
              {titlePart2}
            </h1>
            <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto font-redhat">
              {heroDescription.text}
            </p>
          </div>
        </div>
      </div>

      <div className="blondify-container py-16 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-24">
          <div>
            <h2 className="text-3xl font-bold mb-6 font-redhat">{section1Title.text}</h2>
            {section1Content.type === 'richtext' ? (
              <div
                className="prose prose-lg prose-invert max-w-none font-redhat"
                dangerouslySetInnerHTML={{ __html: section1Content.text || '' }}
              />
            ) : (
              <p className="prose prose-lg prose-invert max-w-none font-redhat">{section1Content.text}</p>
            )}
          </div>
          <div className="flex justify-center">
            <div className="w-full max-w-xs">
              <AspectRatio ratio={3/4} className="overflow-hidden rounded-lg mb-4">
                <img 
                  src={section1ImageUrl.text} 
                  alt={section1ImageAlt.text} 
                  className="w-full h-full object-cover"
                />
              </AspectRatio>
              <p className="text-gray-400 italic text-center font-redhat text-sm">
                {section1ImageCaption.text}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-8 md:p-12 my-24 max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-6 font-redhat text-left">{section2Title.text}</h2>
          {section2Content.type === 'richtext' ? (
             <div
                className="prose prose-lg prose-invert max-w-none font-redhat text-left [&>p]:text-left [&>ul]:text-left [&>li]:text-left [&>ul]:list-disc [&>ul]:ml-6 [&>ul>li]:mb-2"
                dangerouslySetInnerHTML={{ __html: section2Content.text || '' }}
              />
          ) : (
            <p className="text-gray-300 max-w-3xl font-redhat text-left">
              {section2Content.text}
            </p>
          )}
        </div>
        
        <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-8 md:p-12 text-center my-24 max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-6 font-redhat">{section3Title.text}</h2>
          {section3Content.type === 'richtext' ? (
             <div
                className="prose prose-lg prose-invert max-w-3xl mx-auto font-redhat text-left md:text-center"
                dangerouslySetInnerHTML={{ __html: section3Content.text || '' }}
              />
          ) : (
            <p className="text-gray-300 max-w-3xl mx-auto font-redhat">
              {section3Content.text}
            </p>
          )}
        </div>

        <div className="text-center mt-24">
          <a href="/varaa-aika" className="inline-block px-8 py-3 bg-blondify-blue text-white rounded-lg hover:bg-blue-600 transition-colors font-redhat text-lg font-semibold">
            {ctaButtonText.text}
          </a>
        </div>
      </div>
    </div>
  );
};

export default StoryPage;
