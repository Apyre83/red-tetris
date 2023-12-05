import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './GameComponent.css';
import TetrisGame from './TetrisGame';

function getGameNameFromHash() {
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

    const gameName = getGameNameFromHash();
    const playerName = getPlayerNameFromHash();

    const [isCreator, setIsCreator] = useState(false);
    const [players, setPlayers] = useState([]);

    const [responseMessage, setResponseMessage] = useState('');
    const [gameIsPlaying, setGameIsPlaying] = useState(false);


    useEffect(() => {
        if (!socket) { console.error('Socket not connected'); return; }
        if (!isAuthenticated) { navigate('/'); }

        const handleLeavePage = (event) => {
            socket.emit('PLAYER_LEFT_GAME_PAGE', { gameName: gameName, playerName: playerName });
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

        socket.on('GAME_STARTED', (data) => {
            console.log('GAME_STARTED', data);
            setGameIsPlaying(true);
        });

        socket.emit('ASK_INFORMATIONS_GAME_PAGE', { gameName: gameName, playerName: playerName }, (data) => {
            if (data.code !== 0) { console.error(data.error); navigate('/'); return; }

            setIsCreator(data.creator === playerName);
            setPlayers(data.players);
        });
        return () => {
            window.removeEventListener("beforeunload", handleLeavePage);
            socket.emit('PLAYER_LEFT_GAME_PAGE', { gameName: gameName, playerName: playerName });
        }
    }, [socket, gameName, playerName, isAuthenticated, navigate]);

    const handleGoHome = () => {
        navigate('/');
    };

    const handleStartGame = () => {
        if (!isAuthenticated) { console.error('Not authenticated'); return; }
        if (!socket) { console.error('Socket not connected'); return; }
        if (!isCreator) { console.error('Not creator'); return; }

        socket.emit('START_GAME', { gameName, playerName }, (data) => {
            if (data.code !== 0) {
                setResponseMessage(data.error);
                return;
            }
            setResponseMessage('');
        });
    };

    return (
        <>
            <header className="home-header">
                <h2 className="header-title">Authenticated as {playerName}</h2>
            </header>
            {gameIsPlaying && <TetrisGame />}
            {!gameIsPlaying &&
                <div className="game-container">
                    <h1 className="game-title">Game: {gameName}</h1>
                    {isCreator && <h3 className="game-subtitle">You are the creator</h3>}
                    <h3 className="game-subtitle">Players:</h3>
                    <ul className="game-players-list">
                        {players.map((player, index) => <li key={index}>{player}</li>)}
                    </ul>

                    {responseMessage && <p className="game-response-message">{responseMessage}</p>}
                    <button className="game-button" onClick={handleGoHome}>Retour à l'accueil</button>
                    {isCreator && <button className="game-button" onClick={handleStartGame}>Lancer la partie</button>}
                </div>
            }
        </>
    );
}

export default GameComponent;

