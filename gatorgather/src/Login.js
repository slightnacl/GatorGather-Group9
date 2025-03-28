import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "./firebase";
import { useNavigate, Link } from "react-router-dom";
import "./Login.css"

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errorText, setErrorText] = useState("");
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setErrorText("");

        try {
            await signInWithEmailAndPassword(auth, email, password);
            navigate("/home");
        } catch (error) {
            console.log(error);
            if (error.code === "auth/invalid-email") {
                setErrorText("No account found with this email");
            } else if (error.code === "auth/missing-password" || error.code === "auth/invalid-credential") {
                setErrorText("Incorrect password");
            } else {
                setErrorText(error.code);
            }
        }
    };

    return (
        <div>
            <div class="header-bar">
            <Link to = "/"><button class="center-v landing-button" id="header-title-log">Gator<span style = {{ color: "rgb(14, 112, 237)"}}>Gather</span></button></Link>
            </div>
            <div class="flex-container login-container">
                <h2>Login to GatorGather</h2>
                <p>E-mail</p>
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
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder = "Password"
                />
                <button id="login-button" type = "submit" onClick={handleLogin}>Log In</button>
                {errorText && <p>{errorText}</p>}
            </div>
        </div>
    );
}

export default Login;