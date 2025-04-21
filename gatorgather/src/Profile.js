import React, { useState, useEffect, useRef, useCallback } from 'react';
import { getAuth } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc, collection, query, where, getDocs, deleteDoc, updateDoc, serverTimestamp, Timestamp, orderBy } from "firebase/firestore";
import NavBar from './NavBar';
import './Profile.css';

function EditEventModal({ event, isOpen, onClose, onSave }) {
    const [formData, setFormData] = useState({});
    const [loading, setLoading] = useState(false);
    const [modalError, setModalError] = useState('');

    useEffect(() => {
        if (event) {
            let formattedTime = '';
            if (event.meetingTime instanceof Timestamp) {
                const date = event.meetingTime.toDate();
                const tzoffset = (new Date()).getTimezoneOffset() * 60000;
                const localISOTime = (new Date(date.getTime() - tzoffset)).toISOString().slice(0, 16);
                formattedTime = localISOTime;
            } else if (typeof event.meetingTime === 'string') {
                try {
                     const date = new Date(event.meetingTime);
                     const tzoffset = (new Date()).getTimezoneOffset() * 60000;
                     const localISOTime = (new Date(date.getTime() - tzoffset)).toISOString().slice(0, 16);
                     formattedTime = localISOTime;
                } catch {
                     formattedTime = event.meetingTime.slice(0,16);
                }
            }

            setFormData({
                clubName: event.clubName || '',
                meetingPurpose: event.meetingPurpose || '',
                location: event.location || '',
                meetingTime: formattedTime,
                details: event.details || '',
                tags: event.tags || [],
            });
            setModalError('');
        }
    }, [event]);

     const categorizedTags = {
        'Event Type': ['Study Group', 'Club Meeting', 'Social Event', 'Workshop/Seminar', 'Volunteer Opportunity', 'Guest Speaker', 'Performance/Show', 'Sports/Recreation'],
        'Event Format': ['In-Person', 'Online/Virtual', 'Hybrid'],
        'Academic Focus': ['College of Agricultural and Life Sciences', 'College of the Arts', 'Warrington College of Business', 'College of Dentistry', 'College of Design, Construction and Planning', 'College of Education', 'Herbert Wertheim College of Engineering', 'College of Health and Human Performance', 'College of Journalism and Communications', 'Levin College of Law', 'College of Liberal Arts and Sciences', 'College of Medicine', 'College of Nursing', 'College of Pharmacy', 'College of Public Health and Health Professions', 'College of Veterinary Medicine', 'General Interest'],
        'Miscellaneous': ['Free Food', 'Networking Opportunity', 'Skill Development', 'Fundraiser']
    };
    const allAvailableTags = Object.values(categorizedTags).flat().sort();


    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

     const handleTagChange = (e) => {
        const { value, checked } = e.target;
        setFormData(prev => {
            const currentTags = prev.tags || [];
            const newTags = checked
                ? [...currentTags, value]
                : currentTags.filter(tag => tag !== value);
            return { ...prev, tags: newTags };
        });
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setLoading(true);
        setModalError('');
        try {
            await onSave(event.id, formData);
            onClose();
        } catch (err) {
            console.error("Error saving event:", err);
            setModalError('Failed to save changes. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen || !event) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>Edit Event</h2>
                <form onSubmit={handleSave}>
                     <div>
                        <label htmlFor="edit-clubName">Club Name</label>
                        <input type="text" id="edit-clubName" name="clubName" value={formData.clubName} onChange={handleChange} required disabled={loading} />
                    </div>
                     <div>
                        <label htmlFor="edit-meetingPurpose">Meeting Purpose</label>
                        <input type="text" id="edit-meetingPurpose" name="meetingPurpose" value={formData.meetingPurpose} onChange={handleChange} required disabled={loading} />
                    </div>
                     <div>
                        <label htmlFor="edit-location">Location</label>
                        <input type="text" id="edit-location" name="location" value={formData.location} onChange={handleChange} required disabled={loading} />
                    </div>
                     <div>
                        <label htmlFor="edit-meetingTime">Time</label>
                        <input type="datetime-local" id="edit-meetingTime" name="meetingTime" value={formData.meetingTime} onChange={handleChange} required disabled={loading} />
                    </div>
                    <div>
                        <label htmlFor="edit-details">Additional Details</label>
                        <textarea id="edit-details" name="details" value={formData.details} onChange={handleChange} rows="3" disabled={loading}></textarea>
                    </div>

                    <div className="tags-section modal-tags-section">
                         <label className="tags-main-label">Tags</label>
                         <div className="modal-tags-container">
                            {allAvailableTags.map(tag => (
                                <div key={`edit-${tag}`} className="tag-checkbox-item modal-tag-item">
                                    <input
                                        type="checkbox"
                                        id={`edit-tag-${tag.replace(/\s+/g, '-')}`}
                                        value={tag}
                                        checked={formData.tags?.includes(tag) || false}
                                        onChange={handleTagChange}
                                        disabled={loading}
                                    />
                                    <label htmlFor={`edit-tag-${tag.replace(/\s+/g, '-')}`}>{tag}</label>
                                </div>
                            ))}
                        </div>
                    </div>


                    {modalError && <p className="modal-error">{modalError}</p>}

                    <div className="modal-actions">
                        <button type="submit" className="modal-save-button" disabled={loading}>
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                        <button type="button" className="modal-cancel-button" onClick={onClose} disabled={loading}>
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function Profile() {
    const [profileData, setProfileData] = useState(null);
    const [profileLoading, setProfileLoading] = useState(true);
    const [profileError, setProfileError] = useState(null);
    const [isEditingProfile, setIsEditingProfile] = useState(false);

    const [editName, setEditName] = useState('');
    const [editMajor, setEditMajor] = useState('');
    const [editBio, setEditBio] = useState('');
    const [editEmoji, setEditEmoji] = useState(''); // State for emoji
    const [isSavingProfile, setIsSavingProfile] = useState(false);

    const [userEvents, setUserEvents] = useState([]);
    const [eventsLoading, setEventsLoading] = useState(true);
    const [eventsError, setEventsError] = useState(null);

    const [editingEvent, setEditingEvent] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const auth = getAuth();
    const db = getFirestore();
    const user = auth.currentUser;

    useEffect(() => {
        const fetchProfileData = async () => {
            if (user) {
                setProfileLoading(true);
                setProfileError(null);
                const profileDocRef = doc(db, "users", user.uid);
                try {
                    const docSnap = await getDoc(profileDocRef);
                    let data;
                    if (docSnap.exists()) {
                        data = docSnap.data();
                        setProfileData(data);
                        setEditName(data.name || user.displayName || '');
                        setEditMajor(data.major || '');
                        setEditBio(data.bio || '');
                        setEditEmoji(data.profileEmoji || '👤'); // Default emoji if none set
                    } else {
                         const defaultEmoji = '👤';
                        const defaultData = { name: user.displayName || '', major: '', bio: '', profileEmoji: defaultEmoji };
                        setProfileData(defaultData);
                        setEditName(user.displayName || '');
                        setEditMajor('');
                        setEditBio('');
                        setEditEmoji(defaultEmoji);
                    }
                } catch (err) {
                    console.error("Error fetching profile data:", err);
                    setProfileError("Failed to load profile. Please try again later.");
                } finally {
                    setProfileLoading(false);
                }
            } else {
                setProfileError("User not authenticated.");
                setProfileLoading(false);
            }
        };
        fetchProfileData();
    }, [user, db]);

     const fetchUserEvents = useCallback(async () => {
        if (user) {
            setEventsLoading(true);
            setEventsError(null);
            try {
                const eventsRef = collection(db, "events");
                const q = query(eventsRef, where("createdBy", "==", user.uid), orderBy("createdAt", "desc"));
                const querySnapshot = await getDocs(q);
                const fetchedEvents = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setUserEvents(fetchedEvents);
            } catch (err) {
                console.error("Error fetching user events:", err);
                setEventsError("Failed to load your events.");
            } finally {
                setEventsLoading(false);
            }
        } else {
             setEventsLoading(false);
             setEventsError("User not logged in.");
        }
    }, [user, db]);

    useEffect(() => {
        fetchUserEvents();
    }, [fetchUserEvents]);


    const handleEditToggle = () => {
        if (!profileData) return;
        if (!isEditingProfile) {
            setEditName(profileData.name || '');
            setEditMajor(profileData.major || '');
            setEditBio(profileData.bio || '');
            setEditEmoji(profileData.profileEmoji || '👤');
            setProfileError(null);
        }
        setIsEditingProfile(!isEditingProfile);
    };

    const handleProfileSave = async () => {
        if (!user) {
            setProfileError("Authentication error.");
            return;
        }
        setIsSavingProfile(true);
        setProfileError(null);

        // Validate emoji input (basic: ensure it's not empty, could add more complex checks)
        if (!editEmoji.trim()) {
             setProfileError("Please enter a profile emoji.");
             setIsSavingProfile(false);
             return;
        }


        const updatedData = {
            name: editName.trim(),
            major: editMajor.trim(),
            bio: editBio.trim(),
            profileEmoji: editEmoji.trim() // Save the emoji
        };

        try {
            const profileDocRef = doc(db, "users", user.uid);
            // Use setDoc with merge: true to create or update
            await setDoc(profileDocRef, updatedData, { merge: true });
            setProfileData(prevData => ({ ...prevData, ...updatedData })); // Update local state
            setIsEditingProfile(false);
        } catch (firestoreError) {
            console.error("Error saving profile data:", firestoreError);
            setProfileError("Failed to save profile data.");
        } finally {
            setIsSavingProfile(false);
        }
    };

    const handleDeleteEvent = async (eventId) => {
        if (window.confirm("Are you sure you want to delete this event permanently?")) {
            setEventsLoading(true);
            try {
                const eventDocRef = doc(db, "events", eventId);
                await deleteDoc(eventDocRef);
                setUserEvents(prevEvents => prevEvents.filter(event => event.id !== eventId));
            } catch (err) {
                console.error("Error deleting event:", err);
                setEventsError("Failed to delete event. Please try again.");
            } finally {
                setEventsLoading(false);
            }
        }
    };

    const handleCancelEvent = async (eventId, currentStatus) => {
         const newStatus = currentStatus === 'cancelled' ? 'active' : 'cancelled';
         const confirmationMessage = newStatus === 'cancelled'
            ? "Are you sure you want to mark this event as cancelled?"
            : "Are you sure you want to reactivate this event?";

         if (window.confirm(confirmationMessage)) {
            setEventsLoading(true);
            try {
                const eventDocRef = doc(db, "events", eventId);
                await updateDoc(eventDocRef, {
                    status: newStatus
                });
                 setUserEvents(prevEvents => prevEvents.map(event =>
                    event.id === eventId ? { ...event, status: newStatus } : event
                ));
             } catch (err) {
                 console.error("Error updating event status:", err);
                 setEventsError("Failed to update event status.");
            } finally {
                setEventsLoading(false);
            }
        }
    };

    const handleOpenEditModal = (event) => {
        setEditingEvent(event);
        setIsEditModalOpen(true);
    };

    const handleCloseEditModal = () => {
        setIsEditModalOpen(false);
        setEditingEvent(null);
    };

    const handleSaveChanges = async (eventId, updatedData) => {
        setEventsLoading(true);
         try {
             const eventDocRef = doc(db, "events", eventId);
             await updateDoc(eventDocRef, {
                ...updatedData,
                updatedAt: serverTimestamp()
             });
             await fetchUserEvents();
         } catch (err) {
             console.error("Error saving changes:", err);
             throw err;
         } finally {
            setEventsLoading(false);
        }
     };

    const formatDateTime = (timeInput) => {
        if (!timeInput) return 'Time not specified';
        let date;
        if (timeInput instanceof Timestamp) {
            date = timeInput.toDate();
        } else if (typeof timeInput === 'string') {
            date = new Date(timeInput);
        } else {
            return 'Invalid time format';
        }

        try {
             return date.toLocaleString('en-US', {
                dateStyle: 'medium',
                timeStyle: 'short'
            });
        } catch (e) {
             console.error("Error formatting date:", e);
            return typeof timeInput === 'string' ? timeInput : 'Invalid time';
        }
    };

    if (profileLoading) {
        return (
            <div>
                <NavBar />
                <div className="profile-container profile-loading">Loading Profile...</div>
            </div>
        );
    }

    return (
        <div>
            <NavBar />
            <div className="profile-container">

                {/* --- Redesigned Profile Info Section --- */}
                <div className="profile-info-header">
                     <div className={`profile-emoji-display ${isEditingProfile ? 'editable' : ''}`} onClick={isEditingProfile ? null : undefined}>
                         {isEditingProfile ? (
                             <input
                                type="text"
                                id="edit-emoji"
                                className="emoji-input"
                                value={editEmoji}
                                onChange={(e) => setEditEmoji(e.target.value)}
                                placeholder="👤"
                                maxLength="2" // Limit input length roughly
                                disabled={isSavingProfile}
                              />
                         ) : (
                             <span>{profileData?.profileEmoji || '👤'}</span>
                         )}
                     </div>

                     <div className="profile-name-major">
                         {isEditingProfile ? (
                            <>
                                <input type="text" id="edit-name" className="name-input" value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Your Name" disabled={isSavingProfile} />
                                <input type="text" id="edit-major" className="major-input" value={editMajor} onChange={(e) => setEditMajor(e.target.value)} placeholder="Your Major" disabled={isSavingProfile}/>
                            </>
                         ) : (
                             <>
                                 <h2 className="profile-name">{profileData?.name || 'User Name'}</h2>
                                 <p className="profile-major-text">{profileData?.major || 'Major Not Set'}</p>
                             </>
                         )}
                     </div>

                      {!isSavingProfile && (
                        <button onClick={handleEditToggle} className="edit-profile-button">
                            {isEditingProfile ? 'Cancel' : 'Edit Profile'}
                        </button>
                     )}
                </div>

                <div className="profile-bio-section">
                     {isEditingProfile ? (
                        <>
                            <label htmlFor="edit-bio">About Me</label>
                            <textarea id="edit-bio" className="bio-input" value={editBio} onChange={(e) => setEditBio(e.target.value)} placeholder="Tell us about yourself..." disabled={isSavingProfile}/>
                         </>
                     ) : (
                        <>
                            {profileData?.bio ? (
                                <p className="profile-bio">{profileData.bio}</p>
                            ) : (
                                <p className="profile-bio placeholder">No bio information provided.</p>
                            )}
                        </>
                     )}
                 </div>

                 {isEditingProfile && (
                     <div className="profile-form-actions">
                         {profileError && <p className="profile-error edit-error">{profileError}</p>}
                         <button onClick={handleProfileSave} className="save-button" disabled={isSavingProfile}>
                             {isSavingProfile ? 'Saving...' : 'Save Profile Changes'}
                         </button>
                         {/* Cancel button is now the main toggle button */}
                     </div>
                 )}

                {/* --- My Events Section (Remains Functionally Same) --- */}
                <div className="profile-section my-events-section">
                     <h3>My Created Events</h3>
                     {eventsLoading && <div className="events-loading">Loading your events...</div>}
                     {eventsError && <div className="events-error">{eventsError}</div>}
                     {!eventsLoading && !eventsError && (
                        <div className="my-events-list">
                            {userEvents.length > 0 ? (
                                userEvents.map(event => (
                                    <div key={event.id} className={`my-event-card ${event.status === 'cancelled' ? 'cancelled' : ''}`}>
                                        <div className="my-event-card-header">
                                             <h4>{event.clubName} - <span className="event-purpose-small">{event.meetingPurpose}</span></h4>
                                              {event.status === 'cancelled' && <span className="cancelled-badge">Cancelled</span>}
                                        </div>

                                        <p><strong>Location:</strong> {event.location}</p>
                                        <p><strong>Time:</strong> {formatDateTime(event.meetingTime)}</p>
                                        {event.tags && event.tags.length > 0 && (
                                            <div className="my-event-tags">
                                                 {event.tags.map(tag => <span key={tag} className="my-event-tag">{tag}</span>)}
                                            </div>
                                        )}
                                        <div className="my-event-actions">
                                             <button onClick={() => handleOpenEditModal(event)} className="event-action-button edit" disabled={eventsLoading}>Edit</button>
                                             <button onClick={() => handleCancelEvent(event.id, event.status)} className={`event-action-button cancel ${event.status === 'cancelled' ? 'reactivate' : ''}`} disabled={eventsLoading}>
                                                 {event.status === 'cancelled' ? 'Reactivate' : 'Cancel'}
                                            </button>
                                             <button onClick={() => handleDeleteEvent(event.id)} className="event-action-button delete" disabled={eventsLoading}>Delete</button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="no-events-message">You haven't created any events yet.</p>
                            )}
                        </div>
                     )}
                </div>

            </div>
             <EditEventModal
                event={editingEvent}
                isOpen={isEditModalOpen}
                onClose={handleCloseEditModal}
                onSave={handleSaveChanges}
            />
        </div>
    );
}

export default Profile;