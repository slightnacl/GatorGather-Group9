import React, { useEffect, useRef } from 'react';

const Map = ({ events }) => {
  const mapRef = useRef(null);

  useEffect(() => {
    if (!window.google) return;

    const map = new window.google.maps.Map(mapRef.current, {
      center: { lat: 29.6516, lng: -82.3248 }, // UF center
      zoom: 14,
    });

    events.forEach((event) => {
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
  }, [events]);

  return <div ref={mapRef} style={{ height: '500px', width: '100%' }} />;
};

export default Map;
