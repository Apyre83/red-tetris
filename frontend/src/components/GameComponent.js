import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import './GameComponent.css';

function getRoomFromHash() {
    const match = window.location.hash.match(/#([^[]+)(?:\[(.*?)\])?/);
    return match?.[1];
}

function getPlayerNameFromHash() {
    const match = window.location.hash.match(/#([^[]+)(?:\[(.*?)\])?/);
    return match?.[2];
}

function GameComponent() {
    const socket = useSelector(state => state.socket.socket);
    const navigate = useNavigate();
    const room = getRoomFromHash();
    const playerName = getPlayerNameFromHash();
    const isCreator = true; // TODO: Mettre à jour en fonction de la logique de votre jeu

    const [responseMessage, setResponseMessage] = useState('');

    useEffect(() => {
        // ...autres configurations d'écouteurs d'événements

        if (socket) {
            socket.on('GAME_STARTED_OK', (data) => {
                setResponseMessage("La partie a commencé !");
                console.log("Game started successfully: ", data);
                // Naviguez vers l'écran de jeu ou effectuez d'autres actions
            });

            socket.on('GAME_STARTED_KO', (error) => {
                setResponseMessage("Échec du lancement de la partie : " + error);
                console.error("Failed to start game: ", error);
            });
        }

        return () => {
            if (socket) {
                socket.off('GAME_STARTED_OK');
                socket.off('GAME_STARTED_KO');
            }
        };
    }, [socket, navigate]);

    const handleGoHome = () => {
        navigate('/');
    };

    const handleStartGame = () => {
        if (socket && isCreator) {
            socket.emit('START_GAME', { room });
            setResponseMessage("Tentative de lancement de la partie...");
        }
        else {
            console.error('Socket not connected or not creator');
            setResponseMessage("Échec du lancement de la partie : socket non connecté ou non créateur");
        }
    };

    return (
        <div className="game-container">
            <h1 className="game-title">Room: {room}</h1>
            <h2 className="game-subtitle">Player Name: {playerName}</h2>
            {responseMessage && <p className="game-response-message">{responseMessage}</p>}
            <button className="game-button" onClick={handleGoHome}>Retour à l'accueil</button>
            {isCreator && <button className="game-button" onClick={handleStartGame}>Lancer la partie</button>}
        </div>
    );
}

export default GameComponent;

