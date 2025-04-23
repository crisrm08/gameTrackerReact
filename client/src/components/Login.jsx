import React, {useContext, useState} from 'react';
import axios from 'axios';
import '../css/Login.css';
import { ScreenContext } from '../contexts/ScreenContext';

function Login() {
    const { setCurrentScreen } = useContext(ScreenContext);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [wrongPassword, setWrongPassword] = useState(false);
    const [errorMessage, setErrorMessage] = useState();

    

    function handleSignUp() {
        axios
        .post("http://localhost:5000/signUp", {email, password})
        .then(() => {setCurrentScreen("dashboard")})
        .catch();
    }

    function handleLogIn() {
        axios.post("http://localhost:5000/logIn", {email, password})
        .then((response) => {
            if (response.data === true) {
                setCurrentScreen("dashboard");
            } else { 
                setWrongPassword(true);
                setErrorMessage("Wrong password");
            }
        })
        .catch((err) => {
            console.error("Error de red o servidor:", err);
            setErrorMessage("Ocurrió un error inesperado. Intenta de nuevo.");
        });
    }

    return(
        <div className="login-container">
            <h1>Game Tracker</h1>

            <label htmlFor="email">Email</label>
            <input type="text" name='email' placeholder="type your email" onChange={e => setEmail(e.target.value)}/>

            <label htmlFor="password">Password</label>
            <input type="password" name='password' placeholder="type your password" onChange={e => setPassword(e.target.value)}/>

            <div className="proceed">
                <button onClick={handleLogIn}>Login</button> 
                <span>Or</span>
                <button onClick={handleSignUp}>Sign UP</button>
            </div>

            {wrongPassword === true && (<p>{errorMessage}</p>)}
        </div>
    )
}

export default Login;