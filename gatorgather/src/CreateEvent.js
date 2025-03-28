// src/CreateEvent.js
import React from 'react';
import NavBar from './NavBar'; // Include NavBar on page components

function CreateEvent() {
     const pageStyle = { padding: '20px' };
    return (
        <div>
            <NavBar />
             <div style={pageStyle}>
                <h2>Create Event Page</h2>
                <p>The form for creating new events will go here.</p>
            </div>
        </div>
    );
}

export default CreateEvent;