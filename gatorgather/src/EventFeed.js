import React, { useState, useEffect } from 'react';
import { getFirestore, collection, query, where, orderBy, limit, getDocs, Timestamp, doc, getDoc, documentId } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import './Home.css';

function EventFeed() {
    const [followedEvents, setFollowedEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const auth = getAuth();
    const db = getFirestore();
    const user = auth.currentUser;

    useEffect(() => {
        const fetchFollowedEventsDetails = async () => {
            if (!user) {
                //setError("Please log in to see followed events."); // Keep error state silent if not logged in
                setFollowedEvents([]); // Show empty state if not logged in
                setLoading(false);
                return;
            }

            setLoading(true);
            setError(null);

            try {
                const userDocRef = doc(db, "users", user.uid);
                const docSnap = await getDoc(userDocRef);

                let followedIds = [];
                if (docSnap.exists()) {
                    followedIds = docSnap.data().followedEvents || [];
                }

                if (followedIds.length === 0) {
                    setFollowedEvents([]);
                    setLoading(false);
                    return;
                }

                if (followedIds.length > 30) {
                     console.warn("Fetching more than 30 followed events, implementing batching needed for full support.");
                     followedIds = followedIds.slice(0, 30);
                }


                const eventsRef = collection(db, 'events');
                // Corrected line: using 'where' instead of 'firestoreWhere'
                const q = query(eventsRef, where(documentId(), 'in', followedIds));

                const eventDocsSnapshot = await getDocs(q);
                let fetchedEventsData = eventDocsSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

                fetchedEventsData.sort((a, b) => {
                     const timeA = a.meetingTime instanceof Timestamp ? a.meetingTime.toMillis() : (new Date(a.meetingTime)).getTime();
                     const timeB = b.meetingTime instanceof Timestamp ? b.meetingTime.toMillis() : (new Date(b.meetingTime)).getTime();
                     if (isNaN(timeA) && isNaN(timeB)) return 0;
                     if (isNaN(timeA)) return 1;
                     if (isNaN(timeB)) return -1;
                     return timeA - timeB;
                 });


                setFollowedEvents(fetchedEventsData);

            } catch (err) {
                console.error("Error fetching followed events details: ", err);
                 if (err.code === 'permission-denied') {
                     setError("Permission denied fetching events. Check Firestore rules.");
                 } else {
                     setError("Failed to load followed events.");
                 }
            } finally {
                setLoading(false);
            }
        };

        fetchFollowedEventsDetails();
    }, [user, db]);

    const formatDateTime = (timeInput) => {
        if (!timeInput) return 'Time TBD';
        let date;
        if (timeInput instanceof Timestamp) {
            date = timeInput.toDate();
        } else if (typeof timeInput === 'string') {
            try { date = new Date(timeInput); } catch { date = null; }
        } else { date = null; }

        if (!date || isNaN(date.getTime())) return 'Invalid Time';

        const today = new Date();
        const isToday = date.getDate() === today.getDate() &&
                      date.getMonth() === today.getMonth() &&
                      date.getFullYear() === today.getFullYear();

        if (isToday) {
            return `Today at ${date.toLocaleTimeString('en-US', { timeStyle: 'short' })}`;
        } else {
             return date.toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            });
        }
    };

    return (
        <div className="event-feed-container">
            <h3 className="feed-title">Followed Events</h3>
            {loading && <div className="feed-loading">Loading...</div>}
            {error && <div className="feed-error">{error}</div>}
            {!loading && !error && (
                <ul className="event-feed-list">
                    {followedEvents.length > 0 ? (
                        followedEvents.map(event => (
                            <li key={event.id} className={`event-feed-item ${event.status === 'cancelled' ? 'feed-item-cancelled' : ''}`}>
                                <div className="feed-item-time">{formatDateTime(event.meetingTime)}</div>
                                <div className="feed-item-details">
                                    <span className="feed-item-club">{event.clubName}</span>
                                    <span className="feed-item-purpose">{event.meetingPurpose}</span>
                                    <span className="feed-item-location">📍 {event.location}</span>
                                     {event.status === 'cancelled' && <span className="feed-item-cancelled-badge">Cancelled</span>}
                                </div>
                            </li>
                        ))
                    ) : (
                        <li className="feed-no-events">
                             {user ? "You haven't followed any events yet. Find events on the Events page!" : "Please log in to see followed events."}
                        </li>
                    )}
                </ul>
            )}
        </div>
    );
}

export default EventFeed;