// src/Login.js
import React, { useState } from "react";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { Link, useNavigate } from "react-router-dom";
import './AuthForm.css'; // Import the new CSS file
// Remove or comment out: import './Login.css';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false); // Optional loading state
    const navigate = useNavigate();
    const auth = getAuth();

    const handleLogin = (e) => {
        e.preventDefault();
        setError(''); // Clear previous errors
        setLoading(true); // Set loading

        signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                // Signed in
                const user = userCredential.user;
                console.log("Logged in user:", user);
                navigate("/home"); // Redirect to home page
            })
            .catch((err) => {
                console.error("Login error code:", err.code);
                console.error("Login error message:", err.message);
                // Provide user-friendly error messages
                if (err.code === 'auth/invalid-email' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
                     setError("Invalid email or password.");
                } else {
                    setError("Failed to log in. Please try again.");
                }
            })
            .finally(() => {
                setLoading(false); // Reset loading state
            });
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                 {/* Optional: Add GatorGather Brand */}
                 <div className="auth-brand">
                    Gator<span>Gather</span>
                 </div>
                <h2 className="auth-title">Login</h2>
                <form onSubmit={handleLogin} className="auth-form">
                    <div>
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="your.email@ufl.edu"
                        />
                    </div>
                    <div>
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="••••••••"
                        />
                    </div>
                    {error && <p className="auth-error">{error}</p>}
                    <button type="submit" className="auth-button" disabled={loading}>
                        {loading ? 'Logging In...' : 'Login'}
                    </button>
                </form>
                <p className="auth-link">
                    Need an account? <Link to="/register">Register here</Link>
                </p>
            </div>
        </div>
    );
}

export default Login;