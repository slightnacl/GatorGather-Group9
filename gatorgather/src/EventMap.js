// // src/EventMap.js
// import React from 'react';
// // Assumes styles are in Home.css

// function EventMap() {
//     return (
//         <div className="placeholder-card map-placeholder">
//             <div className="placeholder-icon">[🗺️]</div> {/* Simple Map Icon */}
//             Google Map Placeholder (Event Map Integration)
//         </div>
//     );
// }

// export default EventMap;
import React, { useEffect, useRef } from 'react';

const mockEvents = [
  {
    id: 1,
    title: 'Study Jam',
    description: 'Marston Library',
    lat: 29.6504,
    lng: -82.3419,
  },
  {
    id: 2,
    title: 'Hackathon Meetup',
    description: 'Reitz Union',
    lat: 29.6467,
    lng: -82.3487,
  },
];

function EventMap() {
  const mapRef = useRef(null);

  useEffect(() => {
    if (!window.google || !mapRef.current) return;

    const map = new window.google.maps.Map(mapRef.current, {
      center: { lat: 29.6516, lng: -82.3248 },
      zoom: 14,
    });

    mockEvents.forEach(event => {
      const marker = new window.google.maps.Marker({
        position: { lat: event.lat, lng: event.lng },
        map,
        title: event.title,
      });

      const infoWindow = new window.google.maps.InfoWindow({
        content: `<strong>${event.title}</strong><br>${event.description}`,
      });

      marker.addListener('click', () => {
        infoWindow.open(map, marker);
      });
    });
  }, []);

  return (
    <div
      ref={mapRef}
      style={{ height: '400px', width: '100%', borderRadius: '12px', marginBottom: '20px' }}
    />
  );
}

export default EventMap;
