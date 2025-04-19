
import React, { useState } from 'react';
import './EventFeed.css';
import { FaStar, FaHeart, FaSearch } from 'react-icons/fa';

const tabs = [
    { id: 'Recommended', icon: <FaStar /> },
    { id: 'Following', icon: <FaHeart /> },
    { id: 'Search', icon: <FaSearch /> },
];

const EventFeed = () => {
    const[activeTab, setActiveTab] = useState('Recommended');

    return (
        <div className="event-feed-sidebar">
            <div className="tab-header">
                {activeTab}
            </div>

            <div className="tabs">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab.id)}
                        title={tab.id}
                    >
                        {tab.icon}
                    </button>
                ))}
            </div>

            <div className="tab-content">
                {activeTab === 'Recommended' && <div>Recommended events go here...</div>}
                {activeTab === 'Following' && <div>Followed events go here...</div>}
                {activeTab === 'Search' && (
                    <div>
                        <input type="text" placeholder="Search events..." className="search-input"/>
                    </div>
                )}
            </div>
        </div>
    )
}

export default EventFeed;