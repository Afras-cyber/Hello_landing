
import React from 'react';
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, CalendarIcon, ClockIcon, FileTextIcon } from "lucide-react";

const guides = [
  {
    title: 'Miten valmistautua vaalennukseen',
    description: 'Vinkit ja ohjeet, miten valmistautua parhaiten tulevaan vaalennukseen.',
    icon: CalendarIcon,
    link: '/oppaat/valmistaudu-vaalennukseen'
  },
  {
    title: 'Vaaleahiuksisten hoito-opas',
    description: 'Kattava opas vaaleahiuksisten hoitoon ja ylläpitoon kotona.',
    icon: FileTextIcon,
    link: '/oppaat/vaaleahiuksisten-hoito'
  },
  {
    title: 'Sävyjen ylläpito kotona',
    description: 'Näin ylläpidät ja piristät blondin sävyä kotona.',
    icon: ClockIcon,
    link: '/oppaat/savyjen-yllapito'
  }
];

const ServiceGuides: React.FC = () => {
  return (
    <section className="py-16 bg-black">
      <div className="blondify-container">
        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center">Oppaat</h2>
        <p className="text-center text-gray-400 mb-12 max-w-2xl mx-auto">
          Hyödyllisiä oppaita ja vinkkejä vaaleahiuksisille.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {guides.map((guide) => (
            <div key={guide.title} className="bg-gray-900 rounded-xl p-6 flex flex-col">
              <div className="mb-4">
                <guide.icon className="h-10 w-10 text-blondify-blue" />
              </div>
              <h3 className="text-xl font-bold mb-2">{guide.title}</h3>
              <p className="text-gray-400 mb-6 flex-grow">{guide.description}</p>
              <Button asChild variant="ghost" className="text-blondify-blue justify-start p-0 hover:bg-transparent hover:text-blue-400">
                <Link to={guide.link} className="flex items-center">
                  <span>Lue lisää</span>
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          ))}
        </div>
        
        <div className="mt-10 text-center">
          <Button asChild variant="outline" className="border-white text-white hover:bg-white hover:text-black">
            <Link to="/oppaat">Kaikki oppaat</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ServiceGuides;
