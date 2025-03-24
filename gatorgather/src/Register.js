import React, { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "./firebase";
import { useNavigate } from "react-router-dom";

function Register() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            await createUserWithEmailAndPassword(auth, email, password);

            navigate("/login");
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div>
            <h2>Register on GatorGather</h2>
            <form onSubmit = {handleRegister}>
                <input
                    type = "email"
                    value = {email}
                    onChange = {(e) => setEmail(e.target.value)}
                    placeholder = "E-mail"
                />
                <input
                    type = "password"
                    value = {password}
                    onChange = {(e) => setPassword(e.target.value)}
                    placeholder = "Password"                
                />
                <button type = "submit">Register</button>
            </form>
            {error && <p>{error}</p>}
        </div>
    );
}

export default Register;