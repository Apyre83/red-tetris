import React, { useState } from 'react';
import './Modal.css';
import { useSelector } from "react-redux";

const LoginForm = ({ onAuthentication }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const socket = useSelector(state => state.socket.socket);

    const handleSubmit = async (event) => {
        event.preventDefault();
        socket.emit('LOGIN', {
            username,
            password
        }, (data) => {
            if (data.code !== 0) {
                setError(data.error || 'Erreur de connexion. Veuillez réessayer.');
                return;
            }
            console.log("Logged in successfully: ", data);
            onAuthentication(true);
        });
    };

    return (
        <div className="form-container">
            <form onSubmit={handleSubmit}>
                <h2>Connexion</h2>
                {error && <div className="error-message">{error}</div>}
                <div>
                    <label>Nom d'utilisateur</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="modal-input"
                    />
                </div>
                <div>
                    <label>Mot de passe</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="modal-input"
                    />
                </div>
                <button type="submit" className="modal-button">Se connecter</button>
            </form>
        </div>
    );
};

export default LoginForm;
