import React from "react";
import { Link } from "react-router-dom";

const LandingPage = () => {
    return (
        <div style = {{ padding: "2rem" }}>
            <h1>Welcome to GatorGather</h1>
            <p> A social connection app for UF students</p>
            <div>
                <Link to = "/login"><button>Login</button></Link>
                <Link to = "/register"><button>Register</button></Link>
            </div>
        </div>
    );
};

export default LandingPage;