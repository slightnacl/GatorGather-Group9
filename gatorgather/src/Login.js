import React, { useState } from "react";
import { createUserWithEmailAndPassword, signInAnonymously, signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "./firebase";
import { useNavigate } from "react-router-dom";

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
            <h2>Login to GatorGather</h2>
            <form onSubmit = {handleLogin}>
                <input
                    type = "email"
                    value = {email}
                    onChange = {(e) => setEmail(e.target.value)}
                    placeholder = "E-mail"
                />
                <input
                    type = "password"
                    value = {password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder = "Password"
                />
                <button type = "submit">Log In</button>
            </form>
            {error && <p>{error}</p>}
        </div>
    );
}

export default Login;