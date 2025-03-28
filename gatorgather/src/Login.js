import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "./firebase";
import { useNavigate, Link } from "react-router-dom";
import "./Login.css"

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            await signInWithEmailAndPassword(auth, email, password);

            navigate("/home");
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div>
            <div class="header-bar">
            <Link to = "/"><button class="center-v landing-button" id="header-title">Gator<span style = {{ color: "rgb(14, 112, 237)"}}>Gather</span></button></Link>
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
                <button type = "submit" onClick={handleLogin}>Log In</button>
                {error && <p>{error}</p>}
            </div>
        </div>
    );
}

export default Login;