
import React from 'react';
import { Link } from "react-router-dom";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";

const transformations = [
  {
    id: 1,
    before: 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?ixlib=rb-4.0.3',
    after: 'https://images.unsplash.com/photo-1535295972055-1c762f4483e5?ixlib=rb-4.0.3',
    description: 'Tummanruskeasta vaaleanvaaleaksi. Tässä muutoksessa lähdimme liikkeelle tummanruskeista hiuksista ja päädyimme kauniin vaaleaan lopputulokseen. Prosessi sisälsi useita vaalennuskertoja hiusten kuntoa vaalien.',
    link: '/muutokset/1'
  },
  {
    id: 2,
    before: 'https://images.unsplash.com/photo-1528892952291-009c663ce843?ixlib=rb-4.0.3',
    after: 'https://images.unsplash.com/photo-1544717305-f9c88f2897cf?ixlib=rb-4.0.3',
    description: 'Keskivaaleasta platinablondiksi. Tämä muutos toteutettiin yhdellä käynnillä. Lähtökohtana oli jo vaaleat hiukset, jotka jalostettiin platinablondiksi. Lopputulos säilyttää hiusten terveyden ja kiillon.',
    link: '/muutokset/2'
  },
  {
    id: 3,
    before: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3',
    after: 'https://images.unsplash.com/photo-1534945773093-1119ae5684e4?ixlib=rb-4.0.3',
    description: 'Punertavasta tuhkavaaleaksi. Haasteellisessa muutoksessa punertavista hiuksista poistettiin ensin punaiset sävyt, jonka jälkeen hiukset vaalennettiin asteittain ja sävytettiin kauniiksi tuhkavaaleaksi ilman vihertävyyttä.',
    link: '/muutokset/3'
  }
];

const TransformationCarousel: React.FC = () => {
  return (
    <section className="py-16 bg-black">
      <div className="blondify-container">
        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center">Muutoksia</h2>
        <p className="text-center text-gray-400 mb-12 max-w-2xl mx-auto">
          Katso näyttäviä muutoksia, jotka olemme toteuttaneet asiakkaillemme.
        </p>
        
        <div className="px-1">
          <Carousel className="w-full max-w-5xl mx-auto">
            <CarouselContent>
              {transformations.map((item) => (
                <CarouselItem key={item.id} className="md:basis-1/2 lg:basis-1/3">
                  <Link to={item.link} className="no-underline block">
                    <div className="p-4">
                      <div className="bg-gray-900 rounded-lg overflow-hidden hover:bg-gray-800 transition-colors">
                        <div className="flex flex-col">
                          <div className="w-full h-64 relative">
                            <img 
                              src={item.before} 
                              alt="Before transformation" 
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute top-2 left-2 bg-black bg-opacity-70 text-white text-xs py-1 px-2 rounded">
                              Ennen
                            </div>
                          </div>
                          <div className="w-full h-64 relative">
                            <img 
                              src={item.after} 
                              alt="After transformation" 
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute top-2 left-2 bg-blondify-blue bg-opacity-70 text-white text-xs py-1 px-2 rounded">
                              Jälkeen
                            </div>
                          </div>
                        </div>
                        <div className="p-4">
                          <p className="text-sm text-gray-200">{item.description}</p>
                        </div>
                      </div>
                    </div>
                  </Link>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </div>
      </div>
    </section>
  );
};

export default TransformationCarousel;
