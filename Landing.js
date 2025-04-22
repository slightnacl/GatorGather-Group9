import React from "react";
import { Link } from "react-router-dom";
import "./Landing.css";

const LandingPage = () => {
    return (
        <div className="landing-page">
            <header className="landing-header">
                <Link to="/" className="landing-brand">
                    Gator<span>Gather</span>
                </Link>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <Link to="/login" 
                        style={{ 
                            padding: '5px 15px', 
                            backgroundColor: 'transparent', 
                            color: 'white', 
                            border: '1px solid white',
                            borderRadius: '4px',
                            textDecoration: 'none',
                            fontSize: '16px'
                        }}>
                        Login
                    </Link>
                    <Link to="/register" 
                        style={{ 
                            padding: '5px 15px', 
                            backgroundColor: '#FA4616', 
                            color: 'white',
                            border: '1px solid #FA4616',
                            borderRadius: '4px', 
                            textDecoration: 'none',
                            fontSize: '16px'
                        }}>
                        Sign Up
                    </Link>
                </div>
            </header>

            <main className="landing-hero">
                <h1 className="hero-title">
                    Gators Are Better <span className="orange">Together</span>
                </h1>
                <p className="hero-subtitle">
                    A student's most important tool is the connections they make while learning! With GatorGather, finding study groups, project partners, and campus events is simpler than ever.
                </p>
                <div className="hero-buttons">
                    <Link to="/register" className="cta-button">
                        Join Us!
                    </Link>
                </div>
            </main>

            <footer className="landing-footer">
                © {new Date().getFullYear()} GatorGather. Connecting Gators.
            </footer>
        </div>
    );
};

export default LandingPage;