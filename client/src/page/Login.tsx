import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {supabase} from "../supabase";

import { User } from '@supabase/supabase-js';

const Login = ({ setUser } : {setUser: (value: User) => void}) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleLogin = async () => {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });

        if (error) {
            setError(error.message);
        } else {
            // await chrome.storage.local.set({ session: data.session });
            localStorage.setItem('session', JSON.stringify(data.session));
            console.log(data);
            
            setUser(data.session.user);
            navigate("/dashboard");
        }
    };

    return (
        <div>
            <h2>Login</h2>
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <button onClick={handleLogin}>Login</button>
            {error && <p style={{ color: "red" }}>{error}</p>}
        </div>
    );
};

export default Login;