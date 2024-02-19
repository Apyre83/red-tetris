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
        socket.emit('LOGIN', {
            username,
            password
        }, (data) => {
            if (data.code !== 0) {
                setError(data.error || 'Error while logging in, please try again.');
                return;
            }
            dispatch({ type: "LOGIN_SUCCESS", payload: data.username });
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
                <button type="submit" className="modal-button">Login</button>
            </form>
        </div>
    );
};

export default LoginForm;
