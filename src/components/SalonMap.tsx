
import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

interface SalonLocation {
  id: string;
  name: string;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  phone?: string;
}

interface SalonMapProps {
  locations: SalonLocation[];
}

const SalonMap: React.FC<SalonMapProps> = ({ locations }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current || locations.length === 0) return;

    // Initialize map
    mapboxgl.accessToken = 'pk.eyJ1IjoiYmxvbmRpZnkiLCJhIjoiY20ydzJ6azZ6MDB1bDJqcHlzd3J3NGNiNCJ9.YhV3_3qjKhSz0RFFV5Vdow';
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [locations[0].longitude, locations[0].latitude],
      zoom: 12
    });

    // Add markers for each location
    locations.forEach((location) => {
      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
        <div class="p-2">
          <h3 class="font-bold text-lg">${location.name}</h3>
          <p class="text-sm">${location.address}</p>
          <p class="text-sm">${location.city}</p>
          ${location.phone ? `<p class="text-sm font-medium">${location.phone}</p>` : ''}
        </div>
      `);

      const marker = new mapboxgl.Marker({
        color: '#3B82F6'
      })
        .setLngLat([location.longitude, location.latitude])
        .setPopup(popup)
        .addTo(map.current!);
    });

    // Fit map to show all markers if multiple locations
    if (locations.length > 1) {
      const bounds = new mapboxgl.LngLatBounds();
      locations.forEach(location => {
        bounds.extend([location.longitude, location.latitude]);
      });
      map.current.fitBounds(bounds, { padding: 50 });
    }

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, [locations]);

  if (locations.length === 0) {
    return (
      <div className="h-96 bg-gray-900 rounded-lg flex items-center justify-center">
        <p className="text-gray-400">Ei sijainteja saatavilla</p>
      </div>
    );
  }

  return (
    <div 
      ref={mapContainer} 
      className="h-96 w-full rounded-lg"
      style={{ minHeight: '400px' }}
    />
  );
};

export default SalonMap;
