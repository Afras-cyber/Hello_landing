
import React from 'react';
import ServiceCategoryCard from './cards/ServiceCategoryCard';

const categories = [
  {
    title: 'Shampoot',
    description: 'Löydä laadukkaat shampoot moniin tarpeisiin. Valikoimastamme löydät parhaat ammattilaistuotteet vaaleille hiuksille, jotka tehostavat hiusten väriä ja pitävät ne terveinä pidempään.',
    imageUrl: 'https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?ixlib=rb-4.0.3',
    link: '/tuotteet/shampoot',
    price: '12€'
  },
  {
    title: 'Hoitoaineet',
    description: 'Tehokkaita hoitoaineita hiusten hyvinvointiin. Ammattilaishoitoaineemme ravitsevat hiuksia syvältä ja auttavat ylläpitämään kaunista kiiltoa ja pehmeyttä. Soveltuvat erityisesti käsitellyille hiuksille.',
    imageUrl: 'https://images.unsplash.com/photo-1582562124811-c09040d0a901?ixlib=rb-4.0.3',
    link: '/tuotteet/hoitoaineet',
    price: '15€'
  },
  {
    title: 'Sävytteet',
    description: 'Sävytteet viimeistelevät hiusten värin täydelliseksi. Laadukkaat sävytystuotteet ylläpitävät vaaleiden hiusten haluttua sävyä ja estävät ei-toivottujen keltaisten ja oranssien sävyjen ilmaantumista.',
    imageUrl: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?ixlib=rb-4.0.3',
    link: '/tuotteet/savytteet',
    price: '18€'
  },
  {
    title: 'Erikoistuotteet',
    description: 'Erikoistarpeiden mukaan valitut hiustuotteet. Valikoimastamme löydät ammattilaistasoiset erikoistuotteet, jotka on suunniteltu erityisesti vaaleille hiuksille. Täsmähoitoa vaativiin hiusongelmiin ja ylläpitämään hiusten optimaalista kuntoa.',
    imageUrl: 'https://images.unsplash.com/photo-1535268647677-300dbf3d78d1?ixlib=rb-4.0.3',
    link: '/tuotteet/erikoistuotteet',
    price: '25€'
  }
];

const ProductCategories: React.FC = () => {
  return (
    <section className="py-16 bg-black">
      <div className="blondify-container">
        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-left">
          <span className="text-white">Ammattilais</span>
          <span className="text-blondify-blue">tuotteet</span>
        </h2>
        <p className="text-left text-gray-200 mb-12 max-w-2xl">
          Löydä parhaat tuotteet vaaleille hiuksille meidän valikoimasta.
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 px-4">
          {categories.map((category, index) => (
            <ServiceCategoryCard
              key={category.title}
              title={category.title}
              description={category.description}
              imageUrl={category.imageUrl}
              linkUrl={category.link}
              price={category.price}
              isFeatured={index === 0} // Make the first product featured for demonstration
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductCategories;
