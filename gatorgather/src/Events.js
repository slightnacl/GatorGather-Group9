import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { getFirestore, collection, getDocs, query, orderBy, doc, getDoc, updateDoc, arrayUnion, arrayRemove, documentId, where as firestoreWhere } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import NavBar from './NavBar';
import './Events.css';

function Events() {
    const [events, setEvents] = useState([]);                               // All events
    const [loading, setLoading] = useState(true);                           // Page loading state
    const [error, setError] = useState(null);
    const [selectedTags, setSelectedTags] = useState([]);                   // Currently selected tags for filtering
    const [allTags, setAllTags] = useState([]);
    const [isFilterVisible, setIsFilterVisible] = useState(false);          // Toggle filter panel
    const [followedEventIds, setFollowedEventIds] = useState(new Set());    // Event IDs the user has followed
    const [profileError, setProfileError] = useState(null);

    const auth = getAuth();
    const db = getFirestore();
    const user = auth.currentUser;

    // Fetches the user's followed events once, reused across useEffect
    const fetchFollowedEvents = useCallback(async () => {
        if (user) {
            setProfileError(null);
            const userDocRef = doc(db, "users", user.uid);
            try {
                const docSnap = await getDoc(userDocRef);
                if (docSnap.exists()) {
                    const userData = docSnap.data();
                    setFollowedEventIds(new Set(userData.followedEvents || []));
                } else {
                    setFollowedEventIds(new Set());
                }
            } catch (err) {
                console.error("Error fetching user profile for follows:", err);
                setProfileError("Could not load your followed events status.");
            }
        }
    }, [user, db]);

    // Initial load: get events and user's followed status
    useEffect(() => {
        const fetchInitialData = async () => {
            setLoading(true);
            setError(null);
            await fetchFollowedEvents();

            const eventsCollectionRef = collection(db, 'events');
            const q = query(eventsCollectionRef, orderBy('createdAt', 'desc'));

            try {
                const querySnapshot = await getDocs(q);
                const eventsData = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setEvents(eventsData);

                const uniqueTags = new Set();
                eventsData.forEach(event => {
                    if (event.tags && Array.isArray(event.tags)) {
                        event.tags.forEach(tag => uniqueTags.add(tag));
                    }
                });
                setAllTags(Array.from(uniqueTags).sort());

            } catch (err) {
                console.error("Error fetching events: ", err);
                setError("Failed to load events. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchInitialData();
    }, [fetchFollowedEvents]);

    // Handler used to follow an event
    const handleFollow = async (eventId) => {
        if (!user) return;
        const userDocRef = doc(db, "users", user.uid);
        try {
            await updateDoc(userDocRef, {
                followedEvents: arrayUnion(eventId)
            });
            setFollowedEventIds(prev => new Set(prev).add(eventId));
        } catch (err) {
            console.error("Error following event:", err);
        }
    };

    // Handler used to unfollow an event
    const handleUnfollow = async (eventId) => {
        if (!user) return;
        const userDocRef = doc(db, "users", user.uid);
        try {
            await updateDoc(userDocRef, {
                followedEvents: arrayRemove(eventId)
            });
            setFollowedEventIds(prev => {
                const newSet = new Set(prev);
                newSet.delete(eventId);
                return newSet;
            });
        } catch (err) {
            console.error("Error unfollowing event:", err);
        }
    };

    // Handle tag selection toggle
    const handleTagFilterChange = (event) => {
        const { value, checked } = event.target;
        setSelectedTags(prevTags =>
            checked ? [...prevTags, value] : prevTags.filter(tag => tag !== value)
        );
    };

    const clearFilters = () => {
        setSelectedTags([]);
    };

    const filteredEvents = useMemo(() => {
        if (selectedTags.length === 0) {
            return events;
        }
        return events.filter(event =>
            selectedTags.every(selectedTag =>
                event.tags && event.tags.includes(selectedTag)
            )
        );
    }, [events, selectedTags]);

     const formatDateTime = (isoString) => {
        if (!isoString) return 'Time not specified';
        try {
             const date = new Date(isoString);
             return date.toLocaleString('en-US', {
                dateStyle: 'medium',
                timeStyle: 'short'
            });
        } catch (e) {
             console.error("Error formatting date:", e);
            return isoString;
        }
    };

    return (
        <div>
            <NavBar />
            <div className="events-page-container">
                <div className="events-header">
                    <h1>Browse Events</h1>
                    <button
                        className="filter-toggle-button"
                        onClick={() => setIsFilterVisible(!isFilterVisible)}
                    >
                        {isFilterVisible ? 'Hide Filters' : 'Show Filters'}
                    </button>
                </div>

                {isFilterVisible && (
                    <div className="filter-panel">
                        <h2>Filter by Tags</h2>
                        <div className="filter-tags-container">
                            {allTags.length > 0 ? (
                                allTags.map(tag => (
                                    <div key={tag} className="filter-tag-checkbox">
                                        <input
                                            type="checkbox"
                                            id={`filter-tag-${tag.replace(/\s+/g, '-')}`}
                                            value={tag}
                                            checked={selectedTags.includes(tag)}
                                            onChange={handleTagFilterChange}
                                        />
                                        <label htmlFor={`filter-tag-${tag.replace(/\s+/g, '-')}`}>{tag}</label>
                                    </div>
                                ))
                            ) : (
                                <p>No tags available to filter by.</p>
                            )}
                        </div>
                        {selectedTags.length > 0 && (
                             <button onClick={clearFilters} className="clear-filters-button">
                                Clear All Filters
                            </button>
                        )}
                    </div>
                )}

                {loading && <div className="loading-message">Loading events...</div>}
                {error && <div className="error-message">{error}</div>}
                {profileError && <div className="error-message">{profileError}</div>}

                {!loading && !error && (
                    <div className="events-list">
                        {filteredEvents.length > 0 ? (
                            filteredEvents.map(event => {
                                const isFollowing = followedEventIds.has(event.id);
                                const isCancelled = event.status === 'cancelled';
                                return (
                                <div key={event.id} className={`event-card ${isCancelled ? 'event-cancelled-card' : ''}`}>
                                    {user && !isCancelled && (
                                         <button
                                             onClick={() => isFollowing ? handleUnfollow(event.id) : handleFollow(event.id)}
                                             className={`follow-icon-button ${isFollowing ? 'followed' : ''}`}
                                             aria-label={isFollowing ? 'Unfollow event' : 'Follow event'}
                                             title={isFollowing ? 'Unfollow event' : 'Follow event'}
                                         >
                                            {isFollowing ? '✓' : '+'}
                                         </button>
                                    )}
                                    <div className="event-card-content">
                                        <div className="event-card-header">
                                            <h3>{event.clubName}</h3>
                                            {isCancelled && <span className="event-cancelled-badge">Cancelled</span>}
                                        </div>
                                        <p className="event-purpose">{event.meetingPurpose}</p>
                                        <div className="event-details">
                                             <p><strong>Location:</strong> {event.location}</p>
                                             <p><strong>Time:</strong> {formatDateTime(event.meetingTime)}</p>
                                            {event.details && <p><strong>Details:</strong> {event.details}</p>}
                                        </div>
                                        {event.tags && event.tags.length > 0 && (
                                            <div className="event-tags">
                                                <strong>Tags:</strong>
                                                {event.tags.map(tag => (
                                                    <span key={tag} className="event-tag">{tag}</span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                );
                            })
                        ) : (
                             <div className="no-events-message">
                                {selectedTags.length > 0 ? "No events match the selected filters." : "No events found."}
                             </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Events;