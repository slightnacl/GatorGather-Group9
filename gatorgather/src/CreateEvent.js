// // src/CreateEvent.js
// import React from 'react';
// import NavBar from './NavBar'; // Include NavBar on page components

// function CreateEvent() {
//      const pageStyle = { padding: '20px' };
//     return (
//         <div>
//             <NavBar />
//              <div style={pageStyle}>
//                 <h2>Create Event Page</h2>
//                 <p>The form for creating new events will go here.</p>
//             </div>
//         </div>
//     );
// }

// export default CreateEvent;
import React, { useEffect, useRef, useState } from 'react';

function EventMap() {
  const mapRef = useRef(null);
  const [events, setEvents] = useState([]);

  // Fetch event data (replace with Firebase or backend URL)
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch('http://localhost:3000/api/events'); // Replace if needed
        const data = await res.json();
        setEvents(data);
      } catch (err) {
        console.error('Failed to load events:', err);
      }
    };
    fetchEvents();
  }, []);

  // Render map and event markers
  useEffect(() => {
    if (!window.google || !mapRef.current) return;

    const map = new window.google.maps.Map(mapRef.current, {
      center: { lat: 29.6516, lng: -82.3248 }, // UF campus
      zoom: 14,
    });

    events.forEach(event => {
      if (!event.lat || !event.lng) return;

      const marker = new window.google.maps.Marker({
        position: { lat: event.lat, lng: event.lng },
        map,
        title: event.title,
      });

      const infoWindow = new window.google.maps.InfoWindow({
        content: `<strong>${event.title}</strong><br>${event.description || ''}`,
      });

      marker.addListener('click', () => {
        infoWindow.open(map, marker);
      });
    });
  }, [events]);

  return (
    <div
      ref={mapRef}
      style={{
        height: '400px',
        width: '100%',
        borderRadius: '12px',
        marginBottom: '20px',
      }}
    />
  );
}

export default EventMap;
