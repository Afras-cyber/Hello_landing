
import React, { useEffect } from 'react';

const VerkkokauplaRedirect: React.FC = () => {
  useEffect(() => {
    // Track the redirection with Google Tag Manager
    if (window.dataLayer) {
      window.dataLayer.push({
        'event': 'verkkokauppa_redirect',
        'eventCategory': 'Navigation',
        'eventAction': 'Redirect',
        'eventLabel': 'Verkkokauppa'
      });
    }
    
    // Open a new tab to the external site
    window.open('https://blondifystore.com/', '_blank');
    
    // Navigate back to the home page
    window.location.href = '/';
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4 font-redhat">Ohjataan verkkokauppaan...</h1>
        <p className="text-gray-400 font-redhat">Sinut ohjataan nyt Blondify-verkkokauppaan.</p>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blondify-blue mx-auto mt-6"></div>
      </div>
    </div>
  );
};

export default VerkkokauplaRedirect;
