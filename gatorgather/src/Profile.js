// src/Profile.js
import React, { useState, useEffect, useRef } from 'react';
import { getAuth } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import NavBar from './NavBar';
import './Profile.css'; // Ensure CSS is imported

function Profile() {
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

    // State for form inputs during editing
    const [editName, setEditName] = useState(''); // Added state for name
    const [editMajor, setEditMajor] = useState('');
    const [editBio, setEditBio] = useState('');
    const [editImageFile, setEditImageFile] = useState(null);
    const [editImagePreview, setEditImagePreview] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    const fileInputRef = useRef(null);

    useEffect(() => {
        const fetchProfileData = async () => {
            setLoading(true); // Ensure loading state is true at start
            setError(null); // Clear previous errors
            const auth = getAuth();
            const user = auth.currentUser;

            if (user) {
                const db = getFirestore();
                const profileDocRef = doc(db, "users", user.uid);

                try {
                    const docSnap = await getDoc(profileDocRef);
                    let data;
                    if (docSnap.exists()) {
                        data = docSnap.data();
                        setProfileData(data);
                        // Initialize edit state here only after data is fetched
                        setEditName(data.name || ''); // Initialize name
                        setEditMajor(data.major || '');
                        setEditBio(data.bio || '');
                        setEditImagePreview(data.profilePictureUrl || null);
                    } else {
                        console.log("No profile document found for this user.");
                        // Set default structure if no profile exists
                        const defaultData = { name: '', major: '', bio: '', profilePictureUrl: null };
                        setProfileData(defaultData);
                        setEditName(''); // Initialize name
                        setEditMajor('');
                        setEditBio('');
                        setEditImagePreview(null);
                    }
                } catch (err) {
                    console.error("Error fetching profile data:", err);
                    setError("Failed to load profile. Please try again later.");
                } finally {
                    setLoading(false);
                }
            } else {
                setError("User not authenticated.");
                setLoading(false);
            }
        };

        fetchProfileData();
    }, []);

    // --- Edit Mode Handlers ---

    const handleEditToggle = () => {
        if (!profileData) return;

        if (!isEditing) {
            // Entering edit mode: Reset form fields from potentially stale profileData state
            setEditName(profileData.name || '');
            setEditMajor(profileData.major || '');
            setEditBio(profileData.bio || '');
            setEditImagePreview(profileData.profilePictureUrl || null);
            setEditImageFile(null);
            setError(null); // Clear errors when entering edit mode
        } else {
            // Exiting edit mode (Cancel): Reset preview if a file was selected but not saved
             setEditImagePreview(profileData.profilePictureUrl || null);
        }
        setIsEditing(!isEditing);
    };

     const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setEditImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setEditImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

     const triggerFileInput = () => {
        if (isEditing) { // Only allow triggering file input in edit mode
             fileInputRef.current.click();
        }
     };

    const handleSave = async () => {
        const auth = getAuth();
        const user = auth.currentUser;
        if (!user) {
            setError("Authentication error. Please log in again.");
            return;
        }

        setIsSaving(true);
        setError(null);

        // Use existing image URL unless a new file is uploaded
        let imageUrl = isEditing ? editImagePreview : profileData?.profilePictureUrl; // Start with preview if editing, else current data
        if (editImageFile) { // Check if a NEW file was selected for upload
             imageUrl = profileData?.profilePictureUrl; // Default to old URL in case upload fails
            try {
                const storage = getStorage();
                const imageRef = ref(storage, `profilePictures/${user.uid}/${editImageFile.name}`);
                console.log(`Uploading to: ${imageRef.fullPath}`);
                const snapshot = await uploadBytes(imageRef, editImageFile);
                imageUrl = await getDownloadURL(snapshot.ref); // Get NEW URL after successful upload
                console.log(`Image uploaded: ${imageUrl}`);
            } catch (uploadError) {
                 console.error("Error uploading image:", uploadError);
                 setError("Failed to upload image. Profile text data might still be saved.");
                 // Decide if you want to proceed saving text data or stop
                 // For now, we'll let it proceed to save text data
            }
        } else if (isEditing && !editImagePreview && profileData?.profilePictureUrl) {
             // Handle case where user clears the image preview in edit mode (optional: set to null or don't change)
             // For now, we assume clearing preview means keep the old URL, unless specifically set to null
             imageUrl = profileData.profilePictureUrl;
        }

        // Prepare data, ensuring imageUrl reflects the potentially new URL
        const updatedData = {
            name: editName, // Save name
            major: editMajor,
            bio: editBio,
            profilePictureUrl: imageUrl // Use the final imageUrl (new or old)
        };

        try {
            // Update Firestore
            const db = getFirestore();
            const profileDocRef = doc(db, "users", user.uid);
            await setDoc(profileDocRef, updatedData, { merge: true }); // Use merge to avoid overwriting other fields
            console.log("Profile updated successfully in Firestore.");

            // Update local state and exit edit mode
            setProfileData(updatedData);
            setIsEditing(false);
            setEditImageFile(null); // Clear selected file state after successful save
             // Ensure preview reflects the saved state
            setEditImagePreview(updatedData.profilePictureUrl);

        } catch (firestoreError) {
            console.error("Error saving profile text data:", firestoreError);
            setError("Failed to save profile data. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    // --- Render Logic ---

    // Display Loading state
    if (loading) {
        return (
            <div>
                <NavBar />
                <div className="profile-container">
                    <div className="profile-loading">Loading Profile...</div>
                </div>
            </div>
        );
    }

     // Display Error state (only when not editing, or handle within form)
    if (error && !isEditing) {
         return (
            <div>
                <NavBar />
                <div className="profile-container">
                     {/* Show Edit button even on error if data exists */}
                     {profileData && <button onClick={handleEditToggle} className="edit-profile-button">Edit Profile</button>}
                    <div className="profile-error">{error}</div>
                     {/* Optionally display existing data even if there was an error */}
                </div>
            </div>
        );
    }

    // Display No Data state (should ideally be covered by default data now)
    if (!profileData && !loading) {
         return (
            <div>
                <NavBar />
                <div className="profile-container">
                    <div className="profile-error">Profile data could not be loaded or initialized.</div>
                </div>
            </div>
        );
    }

    // Determine image URL to display (handles edit preview)
    const displayImageUrl = isEditing ? (editImagePreview || null) : (profileData?.profilePictureUrl || null);

    return (
        <div>
            <NavBar />
            <div className="profile-container">
                {/* Header: Picture, Name, Edit Button */}
                <div className="profile-header">
                     {!isSaving && ( // Only show button if not saving
                        <button onClick={handleEditToggle} className="edit-profile-button">
                            {isEditing ? 'Cancel' : 'Edit Profile'}
                        </button>
                     )}
                    <div className="profile-picture-container" onClick={triggerFileInput}>
                        <div className={`profile-picture ${isEditing ? 'editable' : ''}`}>
                            {displayImageUrl ? (
                                <img src={displayImageUrl} alt="Profile" />
                            ) : (
                                <div className="profile-picture-placeholder">[👤]</div>
                            )}
                             {isEditing && (
                                <div className="profile-picture-overlay">
                                    Click to<br/>Change
                                </div>
                             )}
                        </div>
                    </div>
                     {/* Hidden Input */}
                     <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden-file-input"
                        disabled={!isEditing || isSaving} // Disable if not editing or while saving
                    />

                    {/* Text Area next to Picture */}
                    <div className="profile-header-text">
                        {isEditing ? (
                             <div>
                                <label htmlFor="name">Name</label>
                                <input
                                    type="text"
                                    id="name"
                                    className="name-input" // Optional specific class
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    placeholder="Your Name"
                                    disabled={isSaving}
                                />
                            </div>
                        ) : (
                            <h2 className="profile-name">{profileData?.name || 'User Name'}</h2>
                        )}
                    </div>
                </div>

                {/* Major Section */}
                 <div className="profile-section">
                    <h3>Major</h3>
                     {isEditing ? (
                         <div className="profile-form">
                            {/* Removed label as it's implied by section heading */}
                            <input
                                type="text"
                                id="major" // keep id for potential label association if needed later
                                value={editMajor}
                                onChange={(e) => setEditMajor(e.target.value)}
                                placeholder="Your Major"
                                disabled={isSaving}
                            />
                         </div>
                    ) : (
                        <p className="profile-major-text">{profileData?.major || 'Major Not Set'}</p>
                    )}
                </div>


                {/* Bio Section */}
                <div className="profile-section">
                    <h3>About Me</h3>
                    {isEditing ? (
                         <div className="profile-form">
                             {/* Removed label as it's implied by section heading */}
                            <textarea
                                id="bio" // keep id for potential label association if needed later
                                value={editBio}
                                onChange={(e) => setEditBio(e.target.value)}
                                placeholder="Tell us about yourself..."
                                disabled={isSaving}
                            />

                             {/* Display error message during editing if any */}
                             {error && <p className="profile-error" style={{ textAlign: 'left', padding: '10px 0', color: '#f87171' }}>Error: {error}</p>}

                            {/* Save/Cancel Buttons */}
                            <div className="form-actions">
                                <button onClick={handleSave} className="save-button" disabled={isSaving}>
                                    {isSaving ? 'Saving...' : 'Save Changes'}
                                </button>
                                <button onClick={handleEditToggle} className="cancel-button" disabled={isSaving}>
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        <p className="profile-bio">{profileData?.bio || 'No bio information provided.'}</p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Profile;