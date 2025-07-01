
import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQProps {
  items?: FAQItem[];
}

const FAQ: React.FC<FAQProps> = ({ items = [] }) => {
  return (
    <section className="bg-black">
      <div className="blondify-container py-16 md:py-20">
        {items && items.length > 0 ? (
          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="w-full">
              {items.map((item, index) => (
                <AccordionItem value={`item-${index}`} key={index} className="border-gray-700">
                  <AccordionTrigger className="text-left text-lg text-white hover:text-blondify-blue">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-300">
                    <div className="prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: item.answer }} />
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        ) : (
           <div className="text-center text-gray-400">
             Tällä hetkellä ei ole saatavilla kysymyksiä ja vastauksia. Sisältöä päivitetään pian.
           </div>
        )}
      </div>
    </section>
  );
};

export default FAQ;
