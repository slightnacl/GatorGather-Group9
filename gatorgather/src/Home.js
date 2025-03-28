// src/Home.js
import React from 'react';
import NavBar from './NavBar';
import EventFeed from './EventFeed';
import EventMap from './EventMap';
import './Home.css'; // Import the CSS file

function Home() {
    return (
        <div>
            <NavBar /> {/* NavBar is already styled via NavBar.css */}
            <div className="home-container"> {/* Use container class */}
                 <h2 className="dashboard-title">Dashboard</h2> {/* Use title class */}

                {/* Render placeholder components */}
                {/* These will pick up styles via their own CSS class */}
                <EventMap />
                <EventFeed />
            </div>
        </div>
    );
}

export default Home;