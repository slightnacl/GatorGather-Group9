import React from "react";
import { Link } from "react-router-dom";
import "./Landing.css";

const LandingPage = () => {
    return (
        <div>
            <div class="flex-container header-bar">
                <Link to = "/"><button class="center-v landing-button" id="header-title">Gator<span style = {{ color: "rgb(14, 112, 237)"}}>Gather</span></button></Link>
                <div class="flex-container center-v header-button-box">
                    <Link to = "/login"><button class="header-button" id="header-login-button">Login</button></Link>
                    <Link to = "/register"><button class="header-button" id="header-register-button">Sign up</button></Link>
                </div>
            </div>
            <div class="flex-container front-image-box"/>
            <div class="flex-container main-body">
                <h2 class="center-h grabber-text">GATORS ARE BETTER</h2>
                <h1 class="center-h grabber-text" id="grabber-large">TOGETHER</h1>
                <p class="para-1">A student's most important tool is the connections they make while learning! While we often look to build these connections with industry veterans, alumni, and professionals, we tend to forget that some of the best connections we can make as students are with our peers. With GatorGather, that process is as simple as a click!</p>
                <Link to="/register"><button id="cta-register">Join Us!</button></Link>
            </div>
            <div style={{marginTop: 80}}/>
            <div class="flex-container center-v footer-bar">

            </div>
            
        </div>
    );
};

export default LandingPage;