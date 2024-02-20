import React, { useState } from 'react';
import './Modal.css';
import { useSelector, useDispatch } from "react-redux";

const LoginForm = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const socket = useSelector(state => state.socket.socket);
    const dispatch = useDispatch();

    const handleSubmit = async (event) => {
        event.preventDefault();
        socket.emit('LOGIN', { username, password }, (data) => {
            if (data.code !== 0) {
                setError(data.error || 'Error while logging in, please try again.');
                return;
            }
            console.log("LOGIN_SUCCESS", data);
            dispatch({ type: "LOGIN_SUCCESS", payload: data.username });
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
                <button type="submit" className="modal-button">Login</button>
            </form>
        </div>
    );
};

export default LoginForm;
