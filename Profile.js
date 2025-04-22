import React, { useState, useEffect, useRef, useCallback } from 'react';
import { getAuth } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc, collection, query, where, getDocs, deleteDoc, updateDoc, serverTimestamp, Timestamp, orderBy } from "firebase/firestore"; // Import necessary Firestore functions
import NavBar from './NavBar';
import './Profile.css';

// Component for the modal used to edit an existing event
function EditEventModal({ event, isOpen, onClose, onSave }) {
    const [formData, setFormData] = useState({}); // State to hold the data entered in the edit form
    const [loading, setLoading] = useState(false); // State to track if the save operation is in progress
    const [modalError, setModalError] = useState(''); // State to store any error messages for the modal

    // useEffect hook runs when the 'event' prop changes
    useEffect(() => {
        if (event) { // Check if an event object is passed
            let formattedTime = '';
            // Check if meetingTime is a Firestore Timestamp object
            if (event.meetingTime instanceof Timestamp) {
                const date = event.meetingTime.toDate(); // Convert Timestamp to JavaScript Date object
                // Calculate the timezone offset in milliseconds
                const tzoffset = (new Date()).getTimezoneOffset() * 60000;
                // Adjust time to local and format as ISO string for datetime-local input
                const localISOTime = (new Date(date.getTime() - tzoffset)).toISOString().slice(0, 16);
                formattedTime = localISOTime;
            } else if (typeof event.meetingTime === 'string') { // Handle if meetingTime is already a string
                try {
                    const date = new Date(event.meetingTime);
                    const tzoffset = (new Date()).getTimezoneOffset() * 60000;
                    const localISOTime = (new Date(date.getTime() - tzoffset)).toISOString().slice(0, 16);
                    formattedTime = localISOTime;
                } catch {
                    // Fallback if string parsing fails, just use the string directly
                    formattedTime = event.meetingTime.slice(0,16);
                }
            }

            // Set the form data state with the event's current details
            setFormData({
                clubName: event.clubName || '',
                meetingPurpose: event.meetingPurpose || '',
                location: event.location || '',
                meetingTime: formattedTime, // Use the formatted time
                details: event.details || '',
                tags: event.tags || [],
            });
            setModalError(''); // Clear any previous modal errors
        }
    }, [event]); // Dependency array includes 'event', so this runs when 'event' changes

    // Predefined categories and tags for event classification
    const categorizedTags = {
        'Event Type': ['Study Group', 'Club Meeting', 'Social Event', 'Workshop/Seminar', 'Volunteer Opportunity', 'Guest Speaker', 'Performance/Show', 'Sports/Recreation'],
        'Event Format': ['In-Person', 'Online/Virtual', 'Hybrid'],
        'Academic Focus': ['College of Agricultural and Life Sciences', 'College of the Arts', 'Warrington College of Business', 'College of Dentistry', 'College of Design, Construction and Planning', 'College of Education', 'Herbert Wertheim College of Engineering', 'College of Health and Human Performance', 'College of Journalism and Communications', 'Levin College of Law', 'College of Liberal Arts and Sciences', 'College of Medicine', 'College of Nursing', 'College of Pharmacy', 'College of Public Health and Health Professions', 'College of Veterinary Medicine', 'General Interest'],
        'Miscellaneous': ['Free Food', 'Networking Opportunity', 'Skill Development', 'Fundraiser']
    };
    // Create a flat, sorted list of all available tags
    const allAvailableTags = Object.values(categorizedTags).flat().sort();


    // Function to handle changes in regular input fields
    const handleChange = (e) => {
        const { name, value } = e.target; // Get the name and value from the input that changed
        // Update the formData state, keeping previous values and updating the changed one
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Function to handle changes in tag checkboxes
    const handleTagChange = (e) => {
        const { value, checked } = e.target; // Get the tag value and whether it's checked
        setFormData(prev => {
            const currentTags = prev.tags || []; // Get current tags, or an empty array if none
            // Add the tag if checked, remove it if unchecked
            const newTags = checked
                ? [...currentTags, value]
                : currentTags.filter(tag => tag !== value);
            // Return the updated state with the new tags array
            return { ...prev, tags: newTags };
        });
    };

    // Function to handle the form submission (saving changes)
    const handleSave = async (e) => {
        e.preventDefault(); // Prevent default form submission behavior
        setLoading(true); // Set loading state to true
        setModalError(''); // Clear any previous errors
        try {
            // Call the onSave function passed as a prop, providing the event ID and new data
            await onSave(event.id, formData);
            onClose(); // Close the modal on successful save
        } catch (err) {
            console.error("Error saving event:", err); // Log the error
            // Set an error message to display in the modal
            setModalError('Failed to save changes. Please try again.');
        } finally {
            setLoading(false); // Set loading state back to false regardless of success or failure
        }
    };

    // If the modal is not open or no event is selected, render nothing
    if (!isOpen || !event) return null;

    // Render the modal JSX
    return (
        <div className="modal-overlay"> {/* Background overlay */}
            <div className="modal-content"> {/* Modal container */}
                <h2>Edit Event</h2>
                <form onSubmit={handleSave}> {/* Form element triggers handleSave on submit */}
                    {/* Input field for Club Name */}
                    <div>
                        <label htmlFor="edit-clubName">Club Name</label>
                        <input type="text" id="edit-clubName" name="clubName" value={formData.clubName} onChange={handleChange} required disabled={loading} />
                    </div>
                     {/* Input field for Meeting Purpose */}
                    <div>
                        <label htmlFor="edit-meetingPurpose">Meeting Purpose</label>
                        <input type="text" id="edit-meetingPurpose" name="meetingPurpose" value={formData.meetingPurpose} onChange={handleChange} required disabled={loading} />
                    </div>
                    {/* Input field for Location */}
                    <div>
                        <label htmlFor="edit-location">Location</label>
                        <input type="text" id="edit-location" name="location" value={formData.location} onChange={handleChange} required disabled={loading} />
                    </div>
                     {/* Input field for Meeting Time */}
                    <div>
                        <label htmlFor="edit-meetingTime">Time</label>
                        <input type="datetime-local" id="edit-meetingTime" name="meetingTime" value={formData.meetingTime} onChange={handleChange} required disabled={loading} />
                    </div>
                    {/* Textarea for Additional Details */}
                    <div>
                        <label htmlFor="edit-details">Additional Details</label>
                        <textarea id="edit-details" name="details" value={formData.details} onChange={handleChange} rows="3" disabled={loading}></textarea>
                    </div>

                    {/* Section for selecting tags */}
                    <div className="tags-section modal-tags-section">
                        <label className="tags-main-label">Tags</label>
                        <div className="modal-tags-container">
                            {/* Map through all available tags to create checkboxes */}
                            {allAvailableTags.map(tag => (
                                <div key={`edit-${tag}`} className="tag-checkbox-item modal-tag-item">
                                    <input
                                        type="checkbox"
                                        id={`edit-tag-${tag.replace(/\s+/g, '-')}`} // Create unique ID for label association
                                        value={tag}
                                        // Check if the current tag is included in the formData's tags array
                                        checked={formData.tags?.includes(tag) || false}
                                        onChange={handleTagChange} // Handle changes with handleTagChange
                                        disabled={loading} // Disable while loading
                                    />
                                    <label htmlFor={`edit-tag-${tag.replace(/\s+/g, '-')}`}>{tag}</label>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Display modal error message if it exists */}
                    {modalError && <p className="modal-error">{modalError}</p>}

                    {/* Action buttons for the modal */}
                    <div className="modal-actions">
                        <button type="submit" className="modal-save-button" disabled={loading}>
                            {/* Show 'Saving...' text when loading */}
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


// Main component for the user profile page
function Profile() {
    // State variables for profile data, loading status, and errors
    const [profileData, setProfileData] = useState(null); // Holds the user's profile information
    const [profileLoading, setProfileLoading] = useState(true); // Tracks if profile data is being loaded
    const [profileError, setProfileError] = useState(null); // Stores any error messages related to profile loading/saving
    const [isEditingProfile, setIsEditingProfile] = useState(false); // Tracks if the profile section is in edit mode

    // State variables for the profile editing form fields
    const [editName, setEditName] = useState(''); // Holds the name value during editing
    const [editMajor, setEditMajor] = useState(''); // Holds the major value during editing
    const [editBio, setEditBio] = useState(''); // Holds the bio value during editing
    const [editEmoji, setEditEmoji] = useState(''); // Holds the profile emoji during editing
    const [isSavingProfile, setIsSavingProfile] = useState(false); // Tracks if profile saving is in progress

    // State variables for user's created events
    const [userEvents, setUserEvents] = useState([]); // Holds the list of events created by the user
    const [eventsLoading, setEventsLoading] = useState(true); // Tracks if events are being loaded
    const [eventsError, setEventsError] = useState(null); // Stores errors related to event loading/management

    // State variables for the event editing modal
    const [editingEvent, setEditingEvent] = useState(null); // Holds the event object currently being edited
    const [isEditModalOpen, setIsEditModalOpen] = useState(false); // Tracks if the edit event modal is open

    // Firebase authentication and Firestore database instances
    const auth = getAuth();
    const db = getFirestore();
    const user = auth.currentUser; // Get the currently logged-in user

    // useEffect hook to fetch the user's profile data when the component mounts or user/db changes
    useEffect(() => {
        const fetchProfileData = async () => {
            if (user) { // Proceed only if a user is logged in
                setProfileLoading(true); // Start loading
                setProfileError(null); // Clear previous errors
                const profileDocRef = doc(db, "users", user.uid); // Reference to the user's document in Firestore
                try {
                    const docSnap = await getDoc(profileDocRef); // Fetch the document
                    let data;
                    if (docSnap.exists()) { // If the document exists
                        data = docSnap.data(); // Get the data
                        setProfileData(data); // Update profile data state
                        // Pre-fill editing fields with existing data or defaults
                        setEditName(data.name || user.displayName || '');
                        setEditMajor(data.major || '');
                        setEditBio(data.bio || '');
                        setEditEmoji(data.profileEmoji || '👤'); // Default emoji if none set
                    } else {
                        // If no profile doc exists, set default values
                        const defaultEmoji = '👤';
                        const defaultData = { name: user.displayName || '', major: '', bio: '', profileEmoji: defaultEmoji };
                        setProfileData(defaultData); // Set state with defaults
                        // Pre-fill editing fields with defaults
                        setEditName(user.displayName || '');
                        setEditMajor('');
                        setEditBio('');
                        setEditEmoji(defaultEmoji);
                    }
                } catch (err) {
                    console.error("Error fetching profile data:", err); // Log error
                    setProfileError("Failed to load profile. Please try again later."); // Set error message
                } finally {
                    setProfileLoading(false); // Stop loading
                }
            } else { // If no user is logged in
                setProfileError("User not authenticated.");
                setProfileLoading(false);
            }
        };
        fetchProfileData(); // Call the fetch function
    }, [user, db]); // Dependencies: run if user or db instance changes

    // useCallback hook to memoize the function for fetching user events
    const fetchUserEvents = useCallback(async () => {
        if (user) { // Proceed only if a user is logged in
            setEventsLoading(true); // Start loading events
            setEventsError(null); // Clear previous event errors
            try {
                const eventsRef = collection(db, "events"); // Reference to the 'events' collection
                // Create a query to get events created by the current user, ordered by creation time descending
                const q = query(eventsRef, where("createdBy", "==", user.uid), orderBy("createdAt", "desc"));
                const querySnapshot = await getDocs(q); // Execute the query
                // Map the document snapshots to event objects including their IDs
                const fetchedEvents = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setUserEvents(fetchedEvents); // Update the user events state
            } catch (err) {
                console.error("Error fetching user events:", err); // Log error
                setEventsError("Failed to load your events."); // Set error message
            } finally {
                setEventsLoading(false); // Stop loading events
            }
        } else { // If no user is logged in
            setEventsLoading(false);
            setEventsError("User not logged in.");
        }
    }, [user, db]); // Dependencies: run if user or db instance changes

    // useEffect hook to fetch user events when the fetchUserEvents function reference changes (which happens on user/db change)
    useEffect(() => {
        fetchUserEvents(); // Call the memoized fetch function
    }, [fetchUserEvents]);


    // Function to toggle the profile editing mode
    const handleEditToggle = () => {
        if (!profileData) return; // Don't do anything if profile data hasn't loaded
        if (!isEditingProfile) {
            // When entering edit mode, populate edit fields with current profile data
            setEditName(profileData.name || '');
            setEditMajor(profileData.major || '');
            setEditBio(profileData.bio || '');
            setEditEmoji(profileData.profileEmoji || '👤');
            setProfileError(null); // Clear any previous profile errors
        }
        // Toggle the editing state
        setIsEditingProfile(!isEditingProfile);
    };

    // Function to save the edited profile information
    const handleProfileSave = async () => {
        if (!user) { // Check if user is authenticated
            setProfileError("Authentication error.");
            return;
        }
        setIsSavingProfile(true); // Indicate saving is in progress
        setProfileError(null); // Clear previous errors

        // Basic validation for the emoji field
        if (!editEmoji.trim()) {
            setProfileError("Please enter a profile emoji.");
            setIsSavingProfile(false); // Stop saving process
            return; // Exit the function
        }

        // Prepare the data object with trimmed values
        const updatedData = {
            name: editName.trim(),
            major: editMajor.trim(),
            bio: editBio.trim(),
            profileEmoji: editEmoji.trim() // Save the trimmed emoji
        };

        try {
            const profileDocRef = doc(db, "users", user.uid); // Reference to the user's document
            // Use setDoc with merge: true to create the document if it doesn't exist, or update it if it does
            await setDoc(profileDocRef, updatedData, { merge: true });
            // Update the local profileData state immediately for a responsive UI
            setProfileData(prevData => ({ ...prevData, ...updatedData }));
            setIsEditingProfile(false); // Exit editing mode
        } catch (firestoreError) {
            console.error("Error saving profile data:", firestoreError); // Log error
            setProfileError("Failed to save profile data."); // Set error message
        } finally {
            setIsSavingProfile(false); // Indicate saving has finished
        }
    };

    // Function to permanently delete an event
    const handleDeleteEvent = async (eventId) => {
        // Show a confirmation dialog before deleting
        if (window.confirm("Are you sure you want to delete this event permanently?")) {
            setEventsLoading(true); // Indicate loading state
            try {
                const eventDocRef = doc(db, "events", eventId); // Reference to the specific event document
                await deleteDoc(eventDocRef); // Delete the document from Firestore
                // Update the local state to remove the deleted event
                setUserEvents(prevEvents => prevEvents.filter(event => event.id !== eventId));
            } catch (err) {
                console.error("Error deleting event:", err); // Log error
                setEventsError("Failed to delete event. Please try again."); // Set error message
            } finally {
                setEventsLoading(false); // Indicate loading has finished
            }
        }
    };

    // Function to toggle the 'cancelled' status of an event
     const handleCancelEvent = async (eventId, currentStatus) => {
         // Determine the new status and the confirmation message
         const newStatus = currentStatus === 'cancelled' ? 'active' : 'cancelled';
         const confirmationMessage = newStatus === 'cancelled'
             ? "Are you sure you want to mark this event as cancelled?"
             : "Are you sure you want to reactivate this event?";

         // Show a confirmation dialog
         if (window.confirm(confirmationMessage)) {
             setEventsLoading(true); // Indicate loading
             try {
                 const eventDocRef = doc(db, "events", eventId); // Reference to the event document
                 // Update the 'status' field in Firestore
                 await updateDoc(eventDocRef, {
                     status: newStatus
                 });
                 // Update the local state to reflect the status change
                 setUserEvents(prevEvents => prevEvents.map(event =>
                     event.id === eventId ? { ...event, status: newStatus } : event
                 ));
             } catch (err) {
                 console.error("Error updating event status:", err); // Log error
                 setEventsError("Failed to update event status."); // Set error message
             } finally {
                 setEventsLoading(false); // Indicate loading has finished
             }
         }
     };


    // Function to open the edit event modal and set the event to be edited
    const handleOpenEditModal = (event) => {
        setEditingEvent(event); // Set the event object to be edited
        setIsEditModalOpen(true); // Open the modal
    };

    // Function to close the edit event modal and clear the editing event state
    const handleCloseEditModal = () => {
        setIsEditModalOpen(false); // Close the modal
        setEditingEvent(null); // Clear the event object
    };

    // Function called by the EditEventModal to save changes to an event
    const handleSaveChanges = async (eventId, updatedData) => {
        setEventsLoading(true); // Indicate loading (affects the event list buttons)
         try {
             const eventDocRef = doc(db, "events", eventId); // Reference to the event document
             // Convert the meetingTime string back to a Firestore Timestamp if necessary
             const dataToSave = {
                 ...updatedData,
                 // Assuming updatedData.meetingTime is a string from datetime-local
                 meetingTime: updatedData.meetingTime ? Timestamp.fromDate(new Date(updatedData.meetingTime)) : null,
                 updatedAt: serverTimestamp() // Add/update the 'updatedAt' timestamp
             };
             await updateDoc(eventDocRef, dataToSave); // Update the document in Firestore
             await fetchUserEvents(); // Re-fetch the user's events to show the updated data
         } catch (err) {
             console.error("Error saving changes:", err); // Log error
             throw err; // Re-throw the error so the modal can catch it and display a message
         } finally {
             setEventsLoading(false); // Indicate loading finished
         }
     };


    // Helper function to format date and time from various possible inputs
    const formatDateTime = (timeInput) => {
        if (!timeInput) return 'Time not specified'; // Handle missing time
        let date;
        if (timeInput instanceof Timestamp) { // If it's a Firestore Timestamp
            date = timeInput.toDate(); // Convert to JS Date
        } else if (typeof timeInput === 'string') { // If it's a string
            date = new Date(timeInput); // Try parsing the string
        } else {
            return 'Invalid time format'; // If it's neither
        }

        try {
            // Format the date nicely using browser's locale settings
            return date.toLocaleString('en-US', {
                dateStyle: 'medium', // e.g., Jan 1, 2023
                timeStyle: 'short' // e.g., 1:30 PM
            });
        } catch (e) {
            console.error("Error formatting date:", e); // Log error if formatting fails
            // Fallback to returning the original string or a generic message
            return typeof timeInput === 'string' ? timeInput : 'Invalid time';
        }
    };

    // Display loading message while profile data is being fetched
    if (profileLoading) {
        return (
            <div>
                <NavBar />
                <div className="profile-container profile-loading">Loading Profile...</div>
            </div>
        );
    }

    // Render the main profile page content
    return (
        <div>
            <NavBar /> {/* Render the navigation bar */}
            <div className="profile-container"> {/* Main container for profile content */}

                {/* --- Redesigned Profile Info Section --- */}
                <div className="profile-info-header"> {/* Header containing emoji, name, major, edit button */}
                     {/* Display emoji or input field for editing emoji */}
                    <div className={`profile-emoji-display ${isEditingProfile ? 'editable' : ''}`} onClick={isEditingProfile ? null : undefined}>
                        {isEditingProfile ? (
                            <input
                                type="text"
                                id="edit-emoji"
                                className="emoji-input"
                                value={editEmoji}
                                onChange={(e) => setEditEmoji(e.target.value)} // Update emoji state on change
                                placeholder="👤" // Placeholder emoji
                                maxLength="2" // Limit input length (approximate for emojis)
                                disabled={isSavingProfile} // Disable while saving
                             />
                        ) : (
                             // Display the current profile emoji or default
                            <span>{profileData?.profileEmoji || '👤'}</span>
                        )}
                    </div>

                     {/* Display name/major or input fields for editing */}
                    <div className="profile-name-major">
                        {isEditingProfile ? (
                            <> {/* Use Fragment to group inputs */}
                                <input type="text" id="edit-name" className="name-input" value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Your Name" disabled={isSavingProfile} />
                                <input type="text" id="edit-major" className="major-input" value={editMajor} onChange={(e) => setEditMajor(e.target.value)} placeholder="Your Major" disabled={isSavingProfile}/>
                            </>
                        ) : (
                            <> {/* Use Fragment to group displayed info */}
                                <h2 className="profile-name">{profileData?.name || 'User Name'}</h2>
                                <p className="profile-major-text">{profileData?.major || 'Major Not Set'}</p>
                            </>
                        )}
                    </div>

                    {/* Show Edit/Cancel button unless saving is in progress */}
                     {!isSavingProfile && (
                        <button onClick={handleEditToggle} className="edit-profile-button">
                            {/* Change button text based on editing state */}
                            {isEditingProfile ? 'Cancel' : 'Edit Profile'}
                        </button>
                    )}
                </div>

                 {/* Section for displaying or editing the user's bio */}
                <div className="profile-bio-section">
                    {isEditingProfile ? (
                        <>
                            <label htmlFor="edit-bio">About Me</label>
                            <textarea id="edit-bio" className="bio-input" value={editBio} onChange={(e) => setEditBio(e.target.value)} placeholder="Tell us about yourself..." disabled={isSavingProfile}/>
                         </>
                    ) : (
                        <>
                            {/* Display bio if available, otherwise show a placeholder */}
                            {profileData?.bio ? (
                                <p className="profile-bio">{profileData.bio}</p>
                            ) : (
                                <p className="profile-bio placeholder">No bio information provided.</p>
                            )}
                        </>
                    )}
                </div>

                {/* Show save button and error message only when editing */}
                {isEditingProfile && (
                    <div className="profile-form-actions">
                        {/* Display profile error if it exists */}
                        {profileError && <p className="profile-error edit-error">{profileError}</p>}
                        <button onClick={handleProfileSave} className="save-button" disabled={isSavingProfile}>
                             {/* Show 'Saving...' text when saving */}
                            {isSavingProfile ? 'Saving...' : 'Save Profile Changes'}
                        </button>
                        {/* The Cancel button functionality is handled by the main toggle button */}
                    </div>
                )}

                {/* --- My Events Section --- */}
                 {/* Section to display events created by the user */}
                <div className="profile-section my-events-section">
                    <h3>My Created Events</h3>
                    {/* Show loading message while events are loading */}
                    {eventsLoading && !userEvents.length && <div className="events-loading">Loading your events...</div>}
                    {/* Show error message if event loading failed */}
                    {eventsError && <div className="events-error">{eventsError}</div>}
                    {/* Display the list of events or a message if none exist */}
                    {!eventsError && ( // Render list only if no error occurred
                        <div className="my-events-list">
                            {userEvents.length > 0 ? (
                                // Map through the user's events and render a card for each
                                userEvents.map(event => (
                                    <div key={event.id} className={`my-event-card ${event.status === 'cancelled' ? 'cancelled' : ''}`}> {/* Add 'cancelled' class if applicable */}
                                        <div className="my-event-card-header">
                                            {/* Display event title and purpose */}
                                            <h4>{event.clubName} - <span className="event-purpose-small">{event.meetingPurpose}</span></h4>
                                            {/* Show cancelled badge if event is cancelled */}
                                             {event.status === 'cancelled' && <span className="cancelled-badge">Cancelled</span>}
                                        </div>

                                        {/* Display event details */}
                                        <p><strong>Location:</strong> {event.location}</p>
                                        <p><strong>Time:</strong> {formatDateTime(event.meetingTime)}</p> {/* Use the formatting function */}
                                         {/* Display tags if they exist */}
                                        {event.tags && event.tags.length > 0 && (
                                            <div className="my-event-tags">
                                                {event.tags.map(tag => <span key={tag} className="my-event-tag">{tag}</span>)}
                                            </div>
                                        )}
                                        {/* Action buttons for each event */}
                                        <div className="my-event-actions">
                                            {/* Edit button: opens the edit modal */}
                                            <button onClick={() => handleOpenEditModal(event)} className="event-action-button edit" disabled={eventsLoading}>Edit</button>
                                            {/* Cancel/Reactivate button */}
                                            <button onClick={() => handleCancelEvent(event.id, event.status)} className={`event-action-button cancel ${event.status === 'cancelled' ? 'reactivate' : ''}`} disabled={eventsLoading}>
                                                {event.status === 'cancelled' ? 'Reactivate' : 'Cancel'}
                                            </button>
                                             {/* Delete button */}
                                            <button onClick={() => handleDeleteEvent(event.id)} className="event-action-button delete" disabled={eventsLoading}>Delete</button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                 // Show message if the user has no events and events are not loading
                                 !eventsLoading && <p className="no-events-message">You haven't created any events yet.</p>
                            )}
                        </div>
                    )}
                </div>

            </div>
             {/* Render the EditEventModal component, passing necessary props */}
             <EditEventModal
                event={editingEvent} // The event object being edited
                isOpen={isEditModalOpen} // Controls modal visibility
                onClose={handleCloseEditModal} // Function to close the modal
                onSave={handleSaveChanges} // Function to save changes
            />
        </div>
    );
}

export default Profile; // Export the Profile component for use in other parts of the application