
import React from 'react';
import { Helmet } from 'react-helmet-async';
import EnhancedTimmaTracker from '@/components/EnhancedTimmaTracker';
import ComprehensiveSiteTracker from '@/components/ComprehensiveSiteTracker';

const Booking = () => {
  const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // Check for debug mode via URL parameter
  const urlParams = new URLSearchParams(window.location.search);
  const debugMode = urlParams.get('debug') === 'true' || window.location.hostname === 'localhost';

  return (
    <>
      <Helmet>
        <title>Varaa aika - Blondify</title>
        <meta name="description" content="Varaa aika Blondify-kampaajille helposti online. Täysin blondeihin erikoistunut kampaamo Helsingin keskustassa." />
      </Helmet>
      
      <div className="min-h-screen bg-black">
        {/* Enhanced Timma tracking with unified system */}
        <EnhancedTimmaTracker enableDebugMode={debugMode} />
        <ComprehensiveSiteTracker sessionId={sessionId} enableDebugMode={debugMode} />
        
        <div className="container mx-auto px-2 sm:px-4 py-4">
          <div className="max-w-7xl mx-auto">
            {/* Compact header section */}
            <div className="text-center mb-4">
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
                Varaa aika
              </h1>
              <p className="text-base text-gray-300 mb-4">
                Valitse sopiva aika ja palvelu alla olevasta kalenterista
              </p>
              {debugMode && (
                <div className="bg-yellow-900/50 border border-yellow-600 rounded-lg p-3 mb-4">
                  <p className="text-yellow-200 text-sm">
                    🐛 Enhanced Debug Mode Active - Unified Timma tracking enabled
                  </p>
                  <p className="text-yellow-200 text-xs mt-1">
                    ✨ New features: API monitoring, Visual detection, Console tracking, URL analysis
                  </p>
                </div>
              )}
            </div>

            {/* Full width booking calendar */}
            <div className="bg-black rounded-lg shadow-lg p-2 sm:p-4">
              <div className="w-full h-[800px] relative">
                <iframe
                  id="timma-booking-iframe"
                  src="https://varaa.timma.fi/reservation/blondifyjatkasaari"
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  className="rounded-lg"
                  title="Varaa aika - Blondify"
                  style={{ 
                    border: 'none',
                    backgroundColor: 'transparent'
                  }}
                  onLoad={() => {
                    console.log('🎯 Timma iframe loaded - Enhanced tracking active');
                    
                    // Inject CSS to hide white backgrounds and like button
                    try {
                      const iframe = document.getElementById('timma-booking-iframe') as HTMLIFrameElement;
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
                      console.log('Could not inject styles due to CORS restrictions');
                    }
                  }}
                />
              </div>
            </div>

            <div className="mt-6 text-center text-sm text-gray-400">
              <p>
                Ongelmia varauksen kanssa? Ota yhteyttä suoraan: 
                <a href="tel:+358401234567" className="text-blondify-blue hover:underline ml-1">
                  040 123 4567
                </a>
              </p>
              {debugMode && (
                <div className="mt-2 text-xs text-yellow-400">
                  <p>Enhanced Debug mode: Add ?debug=true to URL to enable on production</p>
                  <p>🔍 Monitoring: API calls, Visual changes, Console logs, URL changes</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Booking;
