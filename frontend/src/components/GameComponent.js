import React from 'react';
import {useNavigate} from 'react-router-dom';

function getRoomFromHash() {
    const match = window.location.hash.match(/#([^[]+)(?:\[(.*?)\])?/);
    return match?.[1];
}

function getPlayerNameFromHash() {
    const match = window.location.hash.match(/#([^[]+)(?:\[(.*?)\])?/);
    return match?.[2];
}

function GameComponent() {
    const navigate = useNavigate();
    const room = getRoomFromHash();
    const playerName = getPlayerNameFromHash();

    const isCreator = true; /* To Change */

    const handleGoHome = () => {
        navigate('/');
    };

    const handleStartGame = () => {
        // Logique pour démarrer la partie
    };

    return (
        <div>
            <h1>Room: {room}</h1>
            <h2>Player Name: {playerName}</h2>
            <button onClick={handleGoHome}>Retour à l'accueil</button>
            {isCreator && <button onClick={handleStartGame}>Lancer la partie</button>}
        </div>
    );
}

export default GameComponent;

