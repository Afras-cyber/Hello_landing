
import React from 'react';
import TimmaTracker from './TimmaTracker';

interface OnlineBookingProps {
  className?: string;
  sessionId?: string;
}

const OnlineBooking: React.FC<OnlineBookingProps> = ({ className, sessionId }) => {
  return (
    <section className={`py-12 sm:py-16 ${className || "bg-black"}`}>
      {sessionId && <TimmaTracker sessionId={sessionId} />}
      <div className="blondify-container px-4">
        <div className={`${className ? "bg-gray-100" : "bg-gray-900"} rounded-xl p-4 sm:p-6 md:p-10 text-center`}>
          <h2 className={`text-2xl sm:text-3xl md:text-4xl font-bold mb-4 font-redhat ${className ? "text-black" : "text-white"}`}>
            Varaa aikasi nyt
          </h2>
          <p className={`${className ? "text-gray-600" : "text-gray-400"} mb-6 sm:mb-8 max-w-2xl mx-auto text-sm sm:text-base font-redhat`}>
            Aloita matkasi täydellisiin vaaleisiin hiuksiin jo tänään. Kaikissa kampaamissamme on asiantunteva tiimi, joka on erikoistunut juuri vaaleisiin hiuksiin.
          </p>
          
          {/* Rating display */}
          <div className={`mb-6 ${className ? "text-gray-700" : "text-gray-300"}`}>
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="flex text-yellow-400">
                {'★'.repeat(5)}
              </div>
              <span className="font-semibold">4,87/5</span>
            </div>
            <p className="text-sm">Arvostelu perustuu asiakkaidemme kokemuksiin</p>
          </div>
          
          {/* Responsive calendar iframe */}
          <div className="w-full max-w-6xl mx-auto">
            <iframe
              src="https://varaa.timma.fi/reservation/blondifyjatkasaari?view=mobile"
              width="100%"
              height="600"
              frameBorder="0"
              className="rounded-lg shadow-lg min-h-[500px] sm:min-h-[600px] md:h-[768px]"
              title="Varaa aika - Blondify"
              scrolling="yes"
              style={{ 
                border: 'none',
                backgroundColor: 'transparent'
              }}
              loading="lazy"
              onLoad={() => {
                console.log('🎯 OnlineBooking iframe loaded successfully');
                
                // Try to inject CSS to remove white backgrounds
                try {
                  const iframe = document.querySelector('iframe[src*="timma.fi"]') as HTMLIFrameElement;
                  if (iframe && iframe.contentDocument) {
                    const style = iframe.contentDocument.createElement('style');
                    style.textContent = `
                      body { 
                        background-color: transparent !important; 
                        background: transparent !important;
                      }
                      .like-button,
                      [class*="like"],
                      [class*="thumb"],
                      .social-share,
                      .share-button {
                        display: none !important;
                      }
                      .white-bg,
                      .bg-white,
                      [style*="background-color: white"],
                      [style*="background-color:#ffffff"],
                      [style*="background: white"] {
                        background-color: transparent !important;
                        background: transparent !important;
                      }
                    `;
                    iframe.contentDocument.head.appendChild(style);
                  }
                } catch (error) {
                  console.log('Could not inject iframe styles due to CORS restrictions');
                }
              }}
            />
          </div>
          
          <div className={`mt-4 sm:mt-6 text-xs sm:text-sm font-redhat ${className ? "text-gray-500" : "text-gray-500"}`}>
            Saat vahvistuksen sähköpostiisi heti varauksen jälkeen
          </div>
        </div>
      </div>
    </section>
  );
};

export default OnlineBooking;
