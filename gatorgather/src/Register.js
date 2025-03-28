import React, { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "./firebase";
import { useNavigate, Link } from "react-router-dom";
import "./Register.css"

function Register() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [passwordConfirm, setPasswordConfirm] = useState("");
    const [errorText, setErrorText] = useState("");
    const navigate = useNavigate();

    const passwordValidation = (password) => {
        const digitsCheck = password.match(/\d/g) || [];
        // console.log(digitsCheck.length);
        // console.log(password.length);
        // console.log(digitsCheck.length >=2 && password.length >= 8)
        return (digitsCheck.length >=2 && password.length >= 8);
    }

    const handleRegister = async (e) => {
        e.preventDefault();
        setErrorText("");
        
        if (!email.endsWith("@ufl.edu")) {
            setErrorText("E-mail address must end in @ufl.edu");
            return;
        } else if (password !== passwordConfirm) {
            setErrorText("Passwords do not match");
            return;
        } else if (!passwordValidation(password)) {
            setErrorText("Password must be at least 8 characters long and contain 2 numbers");
            return;
        }

        try {
            await createUserWithEmailAndPassword(auth, email, password);
            alert("Registration successful! You may log in.");
            navigate("/login");
        } catch (error) {
            console.log(error);
            if (error.code === "auth/email-already-in-use") {
                setErrorText("E-mail already in use");
            }
        }
    };

    return (
        <div>
            <div class="header-bar">
            <Link to = "/"><button class="center-v landing-button" id="header-title-reg">Gator<span style = {{ color: "rgb(14, 112, 237)"}}>Gather</span></button></Link>
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
                {errorText && <p>{errorText}</p>}
            </div>
        </div>
    );
}

export default Register;