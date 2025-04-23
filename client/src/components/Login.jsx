import React, {useContext, useState} from 'react';
import axios from 'axios';
import '../css/Login.css';
import { ScreenContext } from '../contexts/ScreenContext';

function Login() {
    const { setCurrentScreen } = useContext(ScreenContext);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    

    function handleSignUp() {
        console.log(email, password);
        axios.post("http://localhost:5000/signUp", {email, password})
        .then(() => {
            setCurrentScreen("dashboard");
        })
        .catch();
    }

    return(
        <div className="login-container">
            <h1>Game Tracker</h1>

            <label htmlFor="email">Email</label>
            <input type="text" name='email' placeholder="type your email" onChange={e => setEmail(e.target.value)}/>

            <label htmlFor="password">Password</label>
            <input type="password" name='password' placeholder="type your password" onChange={e => setPassword(e.target.value)}/>

            <div className="proceed">
                <button onClick={handleSignUp}>Login</button> 
                <span>Or</span>
                <button onClick={handleSignUp}>Sign UP</button>
            </div>
        </div>
    )
}

export default Login;