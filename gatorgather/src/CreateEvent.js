import React, { useState } from 'react';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import NavBar from './NavBar';
import './CreateEvent.css';

function CreateEvent() {
    // State variables to manage form input and UI
    const [clubName, setClubName] = useState('');
    const [meetingPurpose, setMeetingPurpose] = useState('');
    const [location, setLocation] = useState('');
    const [meetingTime, setMeetingTime] = useState('');
    const [details, setDetails] = useState('');
    const [tags, setTags] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const db = getFirestore();
    const auth = getAuth();

    const categorizedTags = {
        // The type of event
        'Event Type': [
            'Study Group',
            'Club Meeting',
            'Social Event',
            'Workshop/Seminar',
            'Volunteer Opportunity',
            'Guest Speaker',
            'Performance/Show',
            'Sports/Recreation',
        ],
        // The medium for the event
        'Event Format': [
            'In-Person',
            'Online/Virtual',
            'Hybrid',
        ],
        // Tags specifiying a particular college/study within the University
        'Academic Focus': [
            'College of Agricultural and Life Sciences',
            'College of the Arts',
            'Warrington College of Business',
            'College of Dentistry',
            'College of Design, Construction and Planning',
            'College of Education',
            'Herbert Wertheim College of Engineering',
            'College of Health and Human Performance',
            'College of Journalism and Communications',
            'Levin College of Law',
            'College of Liberal Arts and Sciences',
            'College of Medicine',
            'College of Nursing',
            'College of Pharmacy',
            'College of Public Health and Health Professions',
            'College of Veterinary Medicine',
            'General Interest',
        ],
        // Extra tags
        'Miscellaneous': [
            'Free Food',
            'Networking Opportunity',
            'Skill Development',
            'Fundraiser'
        ]
    };

    // Handle updates to the tags list when checkboxes are toggled
    const handleTagChange = (event) => {
        const { value, checked } = event.target;
        setTags(prevTags =>
            checked ? [...prevTags, value] : prevTags.filter(tag => tag !== value)
        );
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();     // Prevent default form submission behavior
        setError('');
        setSuccess('');
        setLoading(true);

        const user = auth.currentUser;
        if (!user) {
            setError("You must be logged in to create an event.");
            setLoading(false);
            return;
        }

        // Input validation for required fields
        if (!clubName || !meetingPurpose || !location || !meetingTime) {
             setError("Please fill in all required fields (Club Name, Purpose, Location, Time).");
             setLoading(false);
             return;
        }

        try {
            // Add the event to Firestore
            const eventsCollectionRef = collection(db, 'events');
            await addDoc(eventsCollectionRef, {
                clubName: clubName,
                meetingPurpose: meetingPurpose,
                location: location,
                meetingTime: meetingTime,
                details: details,
                tags: tags,
                createdBy: user.uid,
                creatorEmail: user.email,
                createdAt: serverTimestamp()
            });

            // Reset form and show success message
            setSuccess('Event created successfully!');
            setClubName('');
            setMeetingPurpose('');
            setLocation('');
            setMeetingTime('');
            setDetails('');
            setTags([]);


        } catch (err) {
            console.error("Error adding document: ", err);
            setError('Failed to create event. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <NavBar />
            <div className="create-event-container">
                <div className="create-event-card">
                    <h2 className="create-event-title">Create New Event</h2>
                    <form onSubmit={handleSubmit} className="create-event-form">
                        <div>
                            <label htmlFor="clubName">Club Name</label>
                            <input
                                type="text"
                                id="clubName"
                                value={clubName}
                                onChange={(e) => setClubName(e.target.value)}
                                placeholder="e.g., Gator Programming Club"
                                required
                                disabled={loading}
                            />
                        </div>
                        <div>
                            <label htmlFor="meetingPurpose">Meeting Purpose</label>
                            <input
                                type="text"
                                id="meetingPurpose"
                                value={meetingPurpose}
                                onChange={(e) => setMeetingPurpose(e.target.value)}
                                placeholder="e.g., Weekly Meeting, Study Session"
                                required
                                disabled={loading}
                            />
                        </div>
                        <div>
                            <label htmlFor="location">Location</label>
                            <input
                                type="text"
                                id="location"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                placeholder="e.g., Marston Library Room 105, Reitz Union Lawn"
                                required
                                disabled={loading}
                            />
                        </div>
                         <div>
                            <label htmlFor="meetingTime">Time</label>
                            <input
                                type="datetime-local"
                                id="meetingTime"
                                value={meetingTime}
                                onChange={(e) => setMeetingTime(e.target.value)}
                                required
                                disabled={loading}
                            />
                        </div>
                        <div>
                            <label htmlFor="details">Additional Details (Optional)</label>
                            <textarea
                                id="details"
                                value={details}
                                onChange={(e) => setDetails(e.target.value)}
                                placeholder="e.g., Bring your laptops, snacks provided..."
                                rows="4"
                                disabled={loading}
                            />
                        </div>

                        <div className="tags-section">
                            <h3 className="tags-main-label">Tags (Select all that apply)</h3>
                            {Object.entries(categorizedTags).map(([category, categoryTags]) => (
                                <details key={category} className="tag-category">
                                    <summary className="tag-category-summary">{category}</summary>
                                    <div className="tag-category-content">
                                        {categoryTags.sort().map(tag => (
                                            <div key={tag} className="tag-checkbox-item">
                                                <input
                                                    type="checkbox"
                                                    id={`tag-${tag.replace(/\s+/g, '-')}`}
                                                    value={tag}
                                                    checked={tags.includes(tag)}
                                                    onChange={handleTagChange}
                                                    disabled={loading}
                                                />
                                                <label htmlFor={`tag-${tag.replace(/\s+/g, '-')}`}>{tag}</label>
                                            </div>
                                        ))}
                                    </div>
                                </details>
                            ))}
                        </div>


                        {error && <p className="form-error">{error}</p>}
                        {success && <p className="form-success">{success}</p>}

                        <button type="submit" className="submit-event-button" disabled={loading}>
                            {loading ? 'Creating Event...' : 'Create Event'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default CreateEvent;