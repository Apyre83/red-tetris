import React, { useState } from 'react';
import './Modal.css';
import { useSelector } from "react-redux";

const SignUpForm = ( {setShowLogin} ) => {
    const socket = useSelector(state => state.socket.socket);
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');


    const handleSubmit = async (event) => {
        event.preventDefault();
        socket.emit('SIGNUP', { username, email, password }, (data) => {
            if (data.code !== 0) {
                setError(data.error || 'An error has occurred during registration.');
                return;
            }
            setShowLogin(true);
        });
    };

    return (
        <div className="form-container">
            <form onSubmit={handleSubmit}>
                <h1>Welcome to tetris</h1>
                {error && <div className="error-message">{error}</div>}
                <div>
                    <label htmlFor="username">Username</label>
                    <input
                        id="username"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="modal-input"
                        minLength={5}
                        maxLength={20}
                    />
                </div>
                <div>
                    <label htmlFor="email">Email</label>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="modal-input"
                        minLength={5}
                    />
                </div>
                <div>
                    <label htmlFor="password">Password</label>
                    <input
                        id="password"
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
