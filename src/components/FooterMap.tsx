
import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const FooterMap: React.FC = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    console.log('Initializing Mapbox map...');
    
    // Mapbox access token
    mapboxgl.accessToken = 'pk.eyJ1IjoianVzdHVzYmVybmVyIiwiYSI6ImNtM29qOXF1MTA1ZzEyaXM4cnZ4YXFrancifQ.mrQB5CdjFI23QhPxmjzCXg';
    
    try {
      // Small delay to ensure container is fully rendered
      setTimeout(() => {
        if (!mapContainer.current) return;
        
        map.current = new mapboxgl.Map({
          container: mapContainer.current,
          style: 'mapbox://styles/mapbox/dark-v11', // Dark theme to match website
          center: [24.91028, 60.15371], // Atlantinkatu 16, Helsinki coordinates
          zoom: 13, // Adjusted zoom level
          pitch: 20, // Further reduced pitch for better overview
          bearing: -17.6,
          // Disable all interactions
          interactive: false,
          scrollZoom: false,
          boxZoom: false,
          dragRotate: false,
          dragPan: false,
          keyboard: false,
          doubleClickZoom: false,
          touchZoomRotate: false
        });

        console.log('Map created successfully');

        // Add a marker for Blondify location with custom styling
        const marker = new mapboxgl.Marker({
          color: '#48BCFF', // Blondify blue color
          scale: 1.2
        })
        .setLngLat([24.91028, 60.15371])
        .addTo(map.current);

        console.log('Marker added');

        // Add a popup to the marker with dark theme
        const popup = new mapboxgl.Popup({ 
          offset: 25,
          className: 'dark-popup',
          closeButton: false,
          closeOnClick: false
        })
        .setHTML(`
          <div style="text-align: center; padding: 12px; background: rgba(0,0,0,0.9); border-radius: 8px; border: 1px solid #48BCFF;">
            <h3 style="margin: 0 0 6px 0; color: #48BCFF; font-weight: bold; font-size: 14px;">Blondify</h3>
            <p style="margin: 0; color: #fff; font-size: 12px; line-height: 1.4;">Atlantinkatu 16<br>00220 Helsinki</p>
          </div>
        `);

        marker.setPopup(popup);

        // Log when map loads
        map.current.on('load', () => {
          console.log('Map loaded successfully');
          
          // Add subtle glow effect around the location
          map.current?.addSource('blondify-glow', {
            'type': 'geojson',
            'data': {
              'type': 'Point',
              'coordinates': [24.91028, 60.15371]
            }
          });

          map.current?.addLayer({
            'id': 'blondify-glow',
            'type': 'circle',
            'source': 'blondify-glow',
            'paint': {
              'circle-radius': 20,
              'circle-color': '#48BCFF',
              'circle-opacity': 0.2,
              'circle-blur': 1
            }
          });
        });

        // Log any errors
        map.current.on('error', (e) => {
          console.error('Map error:', e);
        });
      }, 100);

    } catch (error) {
      console.error('Error creating map:', error);
    }

    // Cleanup
    return () => {
      if (map.current) {
        console.log('Cleaning up map');
        map.current.remove();
      }
    };
  }, []);

  // Function to open Google Maps
  const openGoogleMaps = () => {
    const googleMapsUrl = 'https://www.google.com/maps?sca_esv=2d8cfefb39b54423&kgmid=/g/11kspzfm8t&shndl=30&shem=lcuae,uaasie&kgs=f5621cc4d660ed18&um=1&ie=UTF-8&fb=1&gl=fi&sa=X&geocode=KUFGe9oDC5JGMQ-lr-fBP_d-&daddr=Atlantinkatu+16,+00220+Helsinki';
    window.open(googleMapsUrl, '_blank');
  };

  return (
    <div 
      className="w-full h-full relative overflow-hidden rounded-[20px] bg-gray-900 cursor-pointer hover:opacity-90 transition-opacity duration-300"
      onClick={openGoogleMaps}
    >
      <div 
        ref={mapContainer} 
        className="absolute inset-0 rounded-[20px]"
        style={{ 
          width: '100%', 
          height: '100%', 
          minHeight: '250px' 
        }} 
      />
      {/* Enhanced location info overlay */}
      <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-sm px-4 py-3 rounded-xl shadow-xl z-20 border border-blondify-blue/20 pointer-events-none">
        <div className="font-bold text-blondify-blue text-sm">Blondify</div>
        <div className="text-xs text-gray-300 mt-1">Atlantinkatu 16, Helsinki</div>
        <div className="text-xs text-gray-400 mt-1">Jatkasaari</div>
      </div>
      
      {/* Click indicator overlay */}
      <div className="absolute bottom-4 right-4 bg-black/80 backdrop-blur-sm px-3 py-2 rounded-lg shadow-xl z-20 border border-blondify-blue/20 pointer-events-none">
        <div className="text-xs text-gray-300">Klikkaa avataksesi Google Maps</div>
      </div>
      
      {/* Gradient overlay for better integration */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none rounded-[20px]"></div>
    </div>
  );
};

export default FooterMap;
