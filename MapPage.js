import React, { useEffect, useRef, useState } from 'react';
import { getFirestore, collection, query, where, getDocs, Timestamp } from 'firebase/firestore'; // Keep imports for future use
import NavBar from './NavBar';
import './MapPage.css'; // We'll create this CSS file

// Hardcoded mock events with coordinates (replace with real data + geocoding later)
const mockEventsWithCoords = [
  {
    id: 'mock1',
    clubName: 'Study Jam Session',
    meetingPurpose: 'Midterm Prep CS101',
    location: 'Marston Library, Collab Area 1',
    meetingTime: '2025-04-22T14:00:00', // Example time
    lat: 29.6504,
    lng: -82.3419,
  },
  {
    id: 'mock2',
    clubName: 'Hackathon Team Meetup',
    meetingPurpose: 'Project Brainstorming',
    location: 'Reitz Union, Room 2345',
    meetingTime: '2025-04-21T18:30:00',
    lat: 29.6467,
    lng: -82.3487,
  },
   {
    id: 'mock3',
    clubName: 'Gator Volleyball Club',
    meetingPurpose: 'Open Practice',
    location: 'Southwest Rec Center Courts',
    meetingTime: '2025-04-23T19:00:00',
    lat: 29.6398,
    lng: -82.3638,
  },
];

function MapPage() {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [activeInfoWindow, setActiveInfoWindow] = useState(null);

   // State for real events (fetched but not used for pins yet)
   // const [realEvents, setRealEvents] = useState([]);
   // const [loading, setLoading] = useState(true);
   // const [error, setError] = useState(null);

    // TODO: Fetch real events from Firestore later when geocoding is added
    // useEffect(() => { /* Fetching logic here */ }, []);

  // Initialize Map
  useEffect(() => {
    if (mapRef.current && !map && window.google) {
      const initializedMap = new window.google.maps.Map(mapRef.current, {
        center: { lat: 29.6458, lng: -82.3488 }, // Centered more on UF Campus
        zoom: 15, // Slightly more zoomed in
        mapId: 'GATORGATHER_MAP_ID' // Optional: Use Map ID for custom styling
      });
      setMap(initializedMap);
    }
  }, [mapRef, map]);


  // Add Markers for Mock Events
  useEffect(() => {
    if (map && window.google) {
        // Clear existing markers if any (optional)
        markers.forEach(marker => marker.setMap(null));
        setMarkers([]);
        setActiveInfoWindow(null);

        const newMarkers = mockEventsWithCoords.map(event => {
            const marker = new window.google.maps.Marker({
              position: { lat: event.lat, lng: event.lng },
              map,
              title: `${event.clubName}: ${event.meetingPurpose}`,
              // icon: 'path/to/custom/icon.png' // Optional custom marker
            });

             const infoWindowContent = `
                <div class="map-infowindow">
                    <h4>${event.clubName}</h4>
                    <p><strong>Purpose:</strong> ${event.meetingPurpose}</p>
                    <p><strong>Location:</strong> ${event.location}</p>
                    <p><strong>Time:</strong> ${new Date(event.meetingTime).toLocaleString()}</p>
                </div>
            `;

            const infoWindow = new window.google.maps.InfoWindow({
                content: infoWindowContent,
                ariaLabel: event.clubName,
            });

            marker.addListener('click', () => {
                 // Close previous info window if open
                 if (activeInfoWindow) {
                     activeInfoWindow.close();
                 }
                 infoWindow.open({
                     anchor: marker,
                     map,
                 });
                 setActiveInfoWindow(infoWindow);
            });
            return marker;
        });
        setMarkers(newMarkers);

         // Close info window if map is clicked
         map.addListener('click', () => {
            if (activeInfoWindow) {
                activeInfoWindow.close();
                setActiveInfoWindow(null);
            }
        });

    }
     // Clean up markers when component unmounts or map changes
     return () => {
         markers.forEach(marker => marker.setMap(null));
     };

  }, [map, mockEventsWithCoords]); // Depend on map and the mock data


    return (
        <div className="map-page">
            <NavBar />
             <div className="map-page-content">
                 {/* Map container div */}
                 <div ref={mapRef} className="map-container-full" />
                 {/* Potential sidebar or overlay could go here later */}
            </div>
        </div>
    );
}

export default MapPage;