import React from "react";
import { getAuth, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";

function Home() {
    const auth = getAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        signOut(auth).then(() => {
            navigate("/login");
        });
    };

    return (
        <div>
            <h2>GatorGather | Home</h2>
            <button onClick = {handleLogout}>Log Out</button>
        </div>
    );
}

export default Home;