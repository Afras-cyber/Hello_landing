
import React from 'react';
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import OptimizedImage from './OptimizedImage';

interface Project {
  title: string;
  description: string;
  imageUrl: string;
  link: string;
}

const projects: Project[] = [{
  title: 'Vaalennukset',
  description: 'Kokopään vaalennukset, värinkorjaukset, suuret muutostyöt',
  imageUrl: 'https://faytlsrwiszkvakznkux.supabase.co/storage/v1/object/public/media/services_images/Vaalennus%20all%20inclusive-min.png',
  link: '/palvelut'
}, {
  title: 'Raidoitus -palvelut',
  description: 'Blondify Special Highlights- erikoisraidoitukset, klassiset raidat, balayage',
  imageUrl: 'https://faytlsrwiszkvakznkux.supabase.co/storage/v1/object/public/media/services_images/Blondify%20Special%20Highlights-min.png',
  link: '/palvelut'
}, {
  title: 'Vaaleiden hiusten ylläpito',
  description: 'Tehohoidot, sävyn ylläpito ja hiustenhoitotuotteet',
  imageUrl: 'https://faytlsrwiszkvakznkux.supabase.co/storage/v1/object/public/media/services_images/Blondify%20Refresh-min.png',
  link: '/palvelut'
}];

const ProjectList = () => {
  return (
    <section className="py-24 bg-gradient-to-b from-black via-gray-950 to-black relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-r from-blondify-blue/5 to-transparent opacity-30"></div>
      <div className="absolute top-20 left-10 w-64 h-64 bg-blondify-blue/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-blondify-blue/5 rounded-full blur-3xl"></div>
      
      <div className="blondify-container relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-6 text-center font-redhat">
            <span className="bg-gradient-to-r from-white via-gray-100 to-white bg-clip-text text-transparent">
              Palvelumme
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Erikoisosaamisemme vaaleissa hiuksissa takaa aina upeimmat tulokset
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {projects.map((project, index) => (
            <Link 
              key={project.title} 
              to={project.link} 
              className="group flex flex-col bg-gradient-to-b from-gray-900/50 to-black/80 backdrop-blur-sm border border-gray-800/50 rounded-2xl overflow-hidden hover:border-blondify-blue/50 transition-all duration-700 hover:shadow-2xl hover:shadow-blondify-blue/20 transform hover:-translate-y-2" 
              data-gtm-element="service_card" 
              data-gtm-service={project.title}
            >
              <div className="relative overflow-hidden bg-gray-900">
                {/* Fixed aspect ratio container - ensures consistent sizing */}
                <div className="relative aspect-[3/4] w-full overflow-hidden bg-gray-900">
                  <OptimizedImage
                    src={project.imageUrl}
                    alt={project.title}
                    className="absolute inset-0 w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-700"
                    width={400}
                    height={533}
                    priority={index < 3}
                    placeholder="skeleton"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/5 to-transparent opacity-30 group-hover:opacity-10 transition-opacity duration-700"></div>
                  
                  {/* Shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transform -skew-x-12 translate-x-full group-hover:translate-x-[-200%] transition-all duration-1000"></div>
                </div>
              </div>
              
              <div className="p-8 flex flex-col flex-grow relative">
                <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-blondify-blue/30 to-transparent"></div>
                
                <h3 className="text-2xl font-bold mb-4 font-redhat text-white group-hover:text-blondify-blue transition-colors duration-500">
                  {project.title}
                </h3>
                <p className="text-gray-300 mb-8 font-redhat leading-relaxed text-lg flex-grow">
                  {project.description}
                </p>
                
                <div className="mt-auto">
                  <div className="inline-flex items-center bg-gradient-to-r from-transparent to-blondify-blue/10 border-2 border-blondify-blue/50 text-blondify-blue hover:bg-gradient-to-r hover:from-blondify-blue hover:to-blondify-blue/80 hover:text-white hover:border-blondify-blue transition-all duration-500 font-redhat px-6 py-3 rounded-full group/button backdrop-blur-sm">
                    <span className="font-medium">Katso kaikki</span>
                    <ArrowRight className="ml-3 h-5 w-5 transform group-hover/button:translate-x-1 transition-transform duration-300" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProjectList;
