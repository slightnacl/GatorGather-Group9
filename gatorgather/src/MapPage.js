// src/MapPage.js
import React from 'react';
import NavBar from './NavBar'; // Include NavBar on page components

function MapPage() {
     const pageStyle = { padding: '20px' };
     const mapContainerStyle = {
        height: '60vh', // Example height
        width: '100%',
        border: '1px solid #ccc',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#e9ecef',
         marginTop: '10px'
    };

    return (
        <div>
            <NavBar />
             <div style={pageStyle}>
                <h2>Full Map Page</h2>
                <p>A larger, dedicated map view for events will go here.</p>
                <div style={mapContainerStyle}>Large Map Placeholder</div>
            </div>
        </div>
    );
}

export default MapPage;