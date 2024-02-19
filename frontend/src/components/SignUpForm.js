import React, { useState } from 'react';
import './Modal.css';
import { useSelector, useDispatch } from "react-redux";

const SignUpForm = () => {
    const socket = useSelector(state => state.socket.socket);
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const dispatch = useDispatch();


    const handleSubmit = async (event) => {
        event.preventDefault();
        socket.emit('SIGNUP', {
            username,
            email,
            password
        }, (data) => {
            if (data.code !== 0) {
                setError(data.error || 'An error has occured during registration.');
                return;
            }
            console.log("Signed up successfully: ", data);
            dispatch({ type: "LOGIN_SUCCESS", payload: data.user });
        });
    };

    return (
        <div className="form-container">
            <form onSubmit={handleSubmit}>
                <h1>Welcome to tetris</h1>
                {error && <div className="error-message">{error}</div>}
                <div>
                    <label>Username</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="modal-input"
                        minLength={5}
                        maxLength={20}
                    />
                </div>
                <div>
                    <label>Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="modal-input"
                        minLength={5}
                    />
                </div>
                <div>
                    <label>Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="modal-input"
                    />
                </div>
                <button type="submit" className="modal-button">Register</button>
            </form>
        </div>
    );
};

export default SignUpForm;
