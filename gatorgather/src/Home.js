// src/Home.js
import React, { useState } from 'react';
import NavBar from './NavBar';
import EventFeed from './EventFeed';
import EventMap from './EventMap';
import EventDetails from './EventDetails';
import './Home.css'; // Import the CSS file

function Home() {
    const [selectedEvent, setSelectedEvent] = useState(null);

    return (
        <div>
            <NavBar /> {/* NavBar is already styled via NavBar.css */}
            <div className="home-container"> {/* Use container class */}
                <h2 className="dashboard-title">Dashboard</h2> {/* Use title class */}

                {/* Render placeholder components */}
                {/* These will pick up styles via their own CSS class */}
                <EventMap />
                <EventDetails event={selectedEvent} />
            </div>
            <EventFeed />
        </div>
    );
}

export default Home;