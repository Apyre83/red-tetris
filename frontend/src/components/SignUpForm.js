import React, { useState } from 'react';
import './Modal.css';
import { useSelector } from "react-redux";

const SignUpForm = ({ onSignUp }) => {
    const socket = useSelector(state => state.socket.socket);
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault();
        socket.emit('SIGNUP', {
            username,
            email,
            password
        }, (data) => {
            if (data.code !== 0) {
                setError(data.error || 'Une erreur s’est produite lors de l’inscription.');
                return;
            }
            console.log("Signed up successfully: ", data);
            onSignUp(true);
        });
    };

    return (
        <div className="form-container">
            <form onSubmit={handleSubmit}>
                <h2>Inscription</h2>
                {error && <div className="error-message">{error}</div>}
                <div>
                    <label>Nom d'utilisateur</label>
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
                    <label>Mot de passe</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="modal-input"
                    />
                </div>
                <button type="submit" className="modal-button">S'inscrire</button>
            </form>
        </div>
    );
};

export default SignUpForm;
