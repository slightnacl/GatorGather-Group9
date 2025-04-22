// src/NavBar.js
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Use NavLink if you want active styling
import { getAuth, signOut, onAuthStateChanged } from 'firebase/auth';
import './NavBar.css'; // Import the CSS file

function NavBar() {
    const auth = getAuth();
    const navigate = useNavigate();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [userInitial, setUserInitial] = useState('');
    const dropdownRef = useRef(null); // Ref for detecting outside clicks

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user && user.email) {
                setUserInitial(user.email.charAt(0).toUpperCase());
            } else {
                setUserInitial('?'); // Fallback if no user or email
            }
        });
        return () => unsubscribe(); // Cleanup listener
    }, [auth]);

     // Close dropdown if clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        }
        // Bind the event listener
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            // Unbind the event listener on clean up
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [dropdownRef]);

    const handleLogout = () => {
        signOut(auth).then(() => {
            navigate("/login");
            console.log("Signed out successfully");
        }).catch((error) => {
            console.error("Sign out error:", error);
        });
        setDropdownOpen(false); // Close dropdown after action
    };

    const toggleDropdown = () => {
        setDropdownOpen(!dropdownOpen);
    };

     const goToProfile = () => {
        navigate("/profile");
        setDropdownOpen(false); // Close dropdown after action
    };

    // Consider using NavLink from react-router-dom for automatic active class styling
    // Example: <NavLink to="/home" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>Home</NavLink>
    return (
        <nav className="navbar">
            <Link to="/home" className="navbar-brand">
                Gator<span>Gather</span>
            </Link>
            <div className="navbar-links">
                <Link to="/home" className="nav-link">Home</Link>
                <Link to="/events" className="nav-link">Events</Link>
                <Link to="/map" className="nav-link">Map</Link>
                <Link to="/create-event" className="nav-link">Create Event</Link>
                {/* Profile link is now in the dropdown */}
            </div>
            <div className="navbar-right" ref={dropdownRef}>
                <button onClick={toggleDropdown} className="account-icon">
                    {userInitial} {/* Display first letter of email or ? */}
                </button>
                {dropdownOpen && (
                    <div className="dropdown-menu">
                        <button onClick={goToProfile} className="dropdown-item">Profile</button>
                        <button onClick={handleLogout} className="dropdown-item logout">Log Out</button>
                    </div>
                )}
            </div>
        </nav>
    );
}

export default NavBar;