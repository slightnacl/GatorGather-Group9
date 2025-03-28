import React, { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "./firebase";
import { useNavigate, Link } from "react-router-dom";
import "./Register.css"

function Register() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [passwordConfirm, setPasswordConfirm] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        
        if (!email.endsWith("@ufl.edu")) {
            setError("E-mail address must end in @ufl.edu");
            return;
        }
        const countNumbers = (str) => (String(str).match(/\d/g) || []).length;
        if (password.length < 8 || countNumbers(password < 2)) {
            setError("Password must be at least 8 characters long and contain 2 numbers");
            return;
        }
        if (password !== passwordConfirm) {
            setError("Passwords do not match");
            return;
        }

        try {
            await createUserWithEmailAndPassword(auth, email, password);
            alert("Registration successful! You may log in.");
            navigate("/login");
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div>
            <div class="header-bar">
            <Link to = "/"><button class="center-v landing-button" id="header-title">Gator<span style = {{ color: "rgb(14, 112, 237)"}}>Gather</span></button></Link>
            </div>
            <div class="flex-container registration-container">
                <h2 class="welcome-flair" style={{marginBottom: 0}}>Welcome to GatorGather!</h2>
                <p class="regcon-text">Please enter your details below.</p>
                <p>UF Student E-mail Address</p>
                <input
                    type = "email"
                    value = {email}
                    onChange = {(e) => setEmail(e.target.value)}
                    placeholder = "E-mail"
                />
                <p>Password</p>
                <input
                    type = "password"
                    value = {password}
                    onChange = {(e) => setPassword(e.target.value)}
                    placeholder = "Password"                
                />
                <p>Confirm Password</p>
                <input
                    type = "passwordConfirmation"
                    value = {passwordConfirm}
                    onChange = {(e) => setPasswordConfirm(e.target.value)}
                    placeholder = "Re-enter your password"                
                />
                <button id="register-button" type = "submit" onClick={handleRegister}>Register</button>
                {error && <p>{error}</p>}
            </div>
        </div>
    );
}

export default Register;