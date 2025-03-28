// src/Events.js
import React from 'react';
import NavBar from './NavBar'; // Include NavBar on page components

function Events() {
     const pageStyle = { padding: '20px' };
    return (
        <div>
            <NavBar />
             <div style={pageStyle}>
                <h2>Events Page</h2>
                <p>A detailed view for Browse, searching, and filtering events will go here.</p>
            </div>
        </div>
    );
}

export default Events;