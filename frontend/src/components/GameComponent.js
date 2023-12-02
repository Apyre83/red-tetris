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

    const [isCreator, setIsCreator] = useState(false);
    const [players, setPlayers] = useState([]);

    const [responseMessage, setResponseMessage] = useState('');


    useEffect(() => {
        if (!socket) { console.error('Socket not connected'); return; }

        socket.emit('WHO_IS_CREATOR', room, (data) => {
            if (data.players[0] === playerName) {
                console.log("You are the creator");
            }
            setPlayers(data.players);
            setIsCreator(data.players[0] === playerName);
        });
        return () => {
            socket.off('WHO_IS_CREATOR');
        }
    }, [socket, room, playerName]);

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
            <h2 className="game-subtitle">You are: {playerName}</h2>
            {isCreator && <h3 className="game-subtitle">You are the creator</h3>}
            <h3 className="game-subtitle">Players:</h3>
            <ul className="game-players-list">
                {players.map((player, index) => <li key={index}>{player}</li>)}
            </ul>

            {responseMessage && <p className="game-response-message">{responseMessage}</p>}
            <button className="game-button" onClick={handleGoHome}>Retour à l'accueil</button>
            {isCreator && <button className="game-button" onClick={handleStartGame}>Lancer la partie</button>}
        </div>
    );
}

export default GameComponent;

