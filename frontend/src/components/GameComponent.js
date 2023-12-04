import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './GameComponent.css';

function getGameFromHash() {
    const match = window.location.hash.match(/#([^[]+)(?:\[(.*?)\])?/);
    return match?.[1];
}

function getPlayerNameFromHash() {
    const match = window.location.hash.match(/#([^[]+)(?:\[(.*?)\])?/);
    return match?.[2];
}

function GameComponent() {
    const socket = useSelector(state => state.socket.socket);
    const isAuthenticated = useSelector(state => state.auth.isAuthenticated);
    const navigate = useNavigate();


    const game = getGameFromHash();
    const playerName = getPlayerNameFromHash();

    const [isCreator, setIsCreator] = useState(false);
    const [players, setPlayers] = useState([]);

    const [responseMessage, setResponseMessage] = useState('');


    useEffect(() => {
        if (!socket) { console.error('Socket not connected'); return; }
        if (!isAuthenticated) { navigate('/'); }

        const handleLeavePage = (event) => {
            socket.emit('PLAYER_LEFT_GAME_PAGE', { game, playerName });
            event.returnValue = "Are you sure you want to leave the game page?";
        };
        window.addEventListener("beforeunload", handleLeavePage);

        socket.on('USER_LEAVE_ROOM', (data) => {
            console.log('USER_LEAVE_ROOM', data);
            setPlayers(prev => prev.filter(player => player !== data.playerName));
            setIsCreator(data.creator === playerName);
        });
        socket.on('USER_JOIN_ROOM', (data) => {
            console.log('USER_JOIN_ROOM', data);
            setPlayers(prev => [...prev, data.playerName]);
        });

        socket.emit('ASK_INFORMATIONS_GAME_PAGE', { game, playerName }, (data) => {
            if (data.code !== 0) { console.error(data.error); navigate('/'); return; }

            setIsCreator(data.creator === playerName);
            setPlayers(data.players);
        });
        return () => {
            window.removeEventListener("beforeunload", handleLeavePage);
            socket.emit('PLAYER_LEFT_GAME_PAGE', { game, playerName });
        }
    }, [socket, game, playerName, isAuthenticated, navigate]);

    const handleGoHome = () => {
        navigate('/');
    };

    const handleStartGame = () => {
        if (socket && isCreator) {
            socket.emit('START_GAME', { game });
            setResponseMessage("Tentative de lancement de la partie...");
        }
        else {
            console.error('Socket not connected or not creator');
            setResponseMessage("Échec du lancement de la partie : socket non connecté ou non créateur");
        }
    };

    return (
        <>
            <header className="home-header">
                <h2 className="header-title">Authenticated as {playerName}</h2>
            </header>
            <div className="game-container">
                <h1 className="game-title">Game: {game}</h1>
                {isCreator && <h3 className="game-subtitle">You are the creator</h3>}
                <h3 className="game-subtitle">Players:</h3>
                <ul className="game-players-list">
                    {players.map((player, index) => <li key={index}>{player}</li>)}
                </ul>

                {responseMessage && <p className="game-response-message">{responseMessage}</p>}
                <button className="game-button" onClick={handleGoHome}>Retour à l'accueil</button>
                {isCreator && <button className="game-button" onClick={handleStartGame}>Lancer la partie</button>}
            </div>
        </>
    );
}

export default GameComponent;

