import React, {useContext, useState} from 'react';
import axios from 'axios';
import '../css/Login.css';
import { ScreenContext } from '../contexts/ScreenContext';
import { LoggedContext } from '../contexts/LoggedContext';

function Login() {
    const { setCurrentScreen } = useContext(ScreenContext);
    const { setIsLoggedIn } = useContext(LoggedContext);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [wrongPassword, setWrongPassword] = useState(false);
    const [errorMessage, setErrorMessage] = useState();

    function handleSignUp() {
        axios
        .post("http://localhost:5000/signUp", {email, password}, { withCredentials: true })
        .then((response) => {
            if (response.data.success) {
                setCurrentScreen("games");
                setIsLoggedIn(true);
            }
           })
        .catch();
    }

    function handleLogIn() {
        axios.post("http://localhost:5000/logIn", {email, password}, { withCredentials: true })
        .then((response) => {
            if (response.data.success === true) {
                console.log("succes");
                setIsLoggedIn(true);
            } else { 
                console.log("wrong");
                setWrongPassword(true);
                setErrorMessage(response.data.message);
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