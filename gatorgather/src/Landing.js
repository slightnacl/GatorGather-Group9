import React from "react";
import { Link } from "react-router-dom";
import "./Landing.css";

const LandingPage = () => {
    return (
        <div>
            <div class="flex-container header-bar">
                <h1 class="center-v" id="header-title">Gator<span style = {{ color: "rgb(14, 112, 237)"}}>Gather</span></h1>
                <div class="flex-container center-v header-button-box">
                    <Link to = "/login"><button class="header-button" id="header-login-button">Login</button></Link>
                    <Link to = "/register"><button class="header-button" id="header-register-button">Sign up</button></Link>
                </div>
            </div>
            <div class="flex-container front-image-box"/>
            <div class="main-body">
                <h1 class="center-h grabber-text">GATORS ARE BETTER</h1>
                <h1 class="center-h grabber-text" style = {{fontSize: 200, color: "rgb(231, 88, 34)"}}>TOGETHER</h1>
                <p>A student's most important tool is the connections they make while learning!</p>
            </div>
            <div class="flex-container center-v footer-bar">

            </div>
            
        </div>
    );
};

export default LandingPage;