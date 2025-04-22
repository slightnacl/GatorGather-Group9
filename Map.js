import React, { useEffect, useRef } from 'react';

const Map = ({ events }) => {
  // Create a ref to hold the DOM element where the map will be rendered
  const mapRef = useRef(null);

  // useEffect hook runs after mount and when 'events' change to update the map
  useEffect(() => {
    if (!window.google || !window.google.maps) {
        console.error("Google Maps script not loaded yet.");
        return;
    }

    // Initialize the Google Map instance in the referenced div
    const map = new window.google.maps.Map(mapRef.current, {
      center: { lat: 29.6516, lng: -82.3248 }, // UF center (adjust as needed)
      zoom: 14,
    });

    // Loop through events to create markers and info windows
    events.forEach((event) => {
        if (event.lat == null || event.lng == null) {
            console.warn(`Event "${event.title || 'Untitled'}" missing coordinates.`);
            return; // Skip events without coordinates
        }
      const marker = new window.google.maps.Marker({
        position: { lat: event.lat, lng: event.lng },
        map,
        title: event.title,
      });

      const infoWindow = new window.google.maps.InfoWindow({
        content: `<strong>${event.title || 'Event'}</strong><br>${event.description || 'No description.'}`,
      });

      marker.addListener('click', () => {
        infoWindow.open(map, marker);
      });
    });
  }, [events]); // Re-run effect if the events array changes

  // Return the div element that will contain the map, linked via the ref
  return <div ref={mapRef} style={{ height: '500px', width: '100%' }} />;
};

export default Map;