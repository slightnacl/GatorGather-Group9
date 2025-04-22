/* src/Register.js */
import React, { useState } from "react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth"; // Import updateProfile
import { auth } from "./firebase";
import { useNavigate, Link } from "react-router-dom";
// Remove the old CSS import: import "./Register.css"
import './AuthForm.css'; // Import the shared AuthForm CSS

function Register() {
    const [name, setName] = useState(""); // Add state for name
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [passwordConfirm, setPasswordConfirm] = useState("");
    const [error, setError] = useState(""); // Renamed for consistency
    const [loading, setLoading] = useState(false); // Optional loading state
    const navigate = useNavigate();

    const passwordValidation = (password) => {
        const digitsCheck = password.match(/\d/g) || [];
        return (digitsCheck.length >= 2 && password.length >= 8);
    }

    const handleRegister = async (e) => {
        e.preventDefault();
        setError(""); // Clear previous errors
        setLoading(true); // Set loading

        // Validation Checks 
        if (!name.trim()) {
            setError("Please enter your name.");
            setLoading(false);
            return;
        }
        if (!email.endsWith("@ufl.edu")) {
            setError("E-mail address must end in @ufl.edu");
            setLoading(false);
            return;
        }
        if (password !== passwordConfirm) {
            setError("Passwords do not match");
            setLoading(false);
            return;
        }
        if (!passwordValidation(password)) {
            setError("Password must be at least 8 characters long and contain 2 numbers");
            setLoading(false);
            return;
        }
        // End Validation

        try {
            // Create the user
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            // Update the user's profile with their name
            await updateProfile(userCredential.user, {
                displayName: name
            });
            console.log("User registered and profile updated:", userCredential.user);
            alert("Registration successful! You may now log in.");
            navigate("/login"); // Redirect to login page after successful registration
        } catch (err) {
            console.error("Registration error code:", err.code);
            console.error("Registration error message:", err.message);
            if (err.code === "auth/email-already-in-use") {
                setError("This email address is already registered.");
            } else if (err.code === 'auth/weak-password') {
                 setError("Password is too weak."); // Firebase might provide this
            } else {
                setError("Failed to register. Please try again.");
            }
        } finally {
            setLoading(false); // Reset loading state
        }
    };

    return (
        // Use the same container and card structure as Login.js
        <div className="auth-container">
            <div className="auth-card">
                 {/* Optional: Add GatorGather Brand */}
                 <div className="auth-brand">
                    Gator<span>Gather</span>
                 </div>
                <h2 className="auth-title">Register</h2>
                <form onSubmit={handleRegister} className="auth-form">
                     {/* Name Field */}
                    <div>
                        <label htmlFor="name">Name</label>
                        <input
                            type="text"
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            placeholder="Your Full Name"
                            disabled={loading}
                        />
                    </div>
                    {/* Email Field */}
                    <div>
                        <label htmlFor="email">UF Email</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="your.email@ufl.edu"
                            disabled={loading}
                        />
                    </div>
                     {/* Password Field */}
                    <div>
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="Create a password"
                            disabled={loading}
                        />
                    </div>
                    {/* Confirm Password Field */}
                    <div>
                        <label htmlFor="passwordConfirm">Confirm Password</label>
                        <input
                            // Use "password" type for confirmation as well to mask input
                            type="password"
                            id="passwordConfirm"
                            value={passwordConfirm}
                            onChange={(e) => setPasswordConfirm(e.target.value)}
                            required
                            placeholder="Re-enter your password"
                            disabled={loading}
                        />
                    </div>
                    {/* Display Errors */}
                    {error && <p className="auth-error">{error}</p>}
                    {/* Submit Button */}
                    <button type="submit" className="auth-button" disabled={loading}>
                        {loading ? 'Registering...' : 'Register'}
                    </button>
                </form>
                {/* Link to Login Page */}
                <p className="auth-link">
                    Already have an account? <Link to="/login">Login here</Link>
                </p>
            </div>
        </div>
    );
}

export default Register;