import React from 'react';
import './EventDetails.css';

function EventDetails({ event }) {
    return (
        <div className="event-details">
            <div className="event-banner">
                {event
                ? `${event.name} - ${event.date} at ${event.time}`
                : "Select an event to see what's happening!"}
            </div>
            {event && (
                <div className="event-body">
                    <p>{event.details}</p>
                </div>
            )}
        </div>
    )
}

export default EventDetails;