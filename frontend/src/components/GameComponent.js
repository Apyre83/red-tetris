import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import './GameComponent.css';
import TetrisGame from './TetrisGame';

function getGameNameFromHash() {
    const match = window.location.hash.match(/#([^[]+)(?:\[(.*?)\])?/);
    return match ? match[1] : null;
}

function getPlayerNameFromHash() {
    const match = window.location.hash.match(/#([^[]+)(?:\[(.*?)\])?/);
    return match ? match[2] : null;
}

function GameComponent() {
    const socket = useSelector(state => state.socket.socket);
    const isAuthenticated = useSelector(state => state.auth.isAuthenticated);
    const navigate = useNavigate();

    const gameName = getGameNameFromHash();
    const playerName = getPlayerNameFromHash();

    const [isCreator, setIsCreator] = useState(false);
    const [players, setPlayers] = useState([]);
    const [playerScore, setPlayerScore] = useState(-1);
    const [playerRank, setPlayerRank] = useState(null);
    const [gameIsPlaying, setGameIsPlaying] = useState(false);
    const [responseMessage, setResponseMessage] = useState('');

    const [score, setScore] = useState(0);

    const [leftPlayerName, setLeftPlayerName] = useState('');
    const [rightPlayerName, setRightPlayerName] = useState('');


	const [isAlive, setIsAlive] = useState(false);

    useEffect(() => {
        if (!socket) { console.error('Socket not connected'); return; }
        if (!isAuthenticated) { navigate('/'); }

        socket.emit('GET_SCORE', { playerName: playerName }, (data) => {
            console.log("GET_SCORE", data);
            if (data.code !== 0) {
                console.error('Error while getting score', data.error);
            }
            else setScore(data.score);
        });

        const handleLeavePage = (event) => {
            if (!isAuthenticated) { console.error('Not authenticated'); return; }
            if (!socket) { console.error('Socket not connected'); return; }

            event.preventDefault();
			event.returnValue = '';
			socket.emit('PLAYER_LEAVE_ROOM', { gameName: gameName, playerName: playerName }, (data) => {
				if (data.code !== 0) { console.error(data.error); return; }
			});
        };
        window.addEventListener("beforeunload", handleLeavePage);

        socket.on('USER_LEAVE_GAME', (data) => {
            console.log('USER_LEAVE_GAME', data);
            setPlayers(prev => prev.filter(player => player !== data.playerName));
            setIsCreator(data.creator === playerName);
        });
        
        socket.on('USER_JOIN_GAME', (data) => {
            console.log('USER_JOIN_GAME', data);
            setPlayers(prev => [...prev, data.playerName]);
			setIsCreator(data.creator === playerName);
        });

        socket.on('GAME_STARTED', (data) => {
            console.log('GAME_STARTED', data);
            setLeftPlayerName(data.leftPlayerName);
            setRightPlayerName(data.rightPlayerName);
            setGameIsPlaying(true);
			setIsAlive(true);
        });

		socket.on('PLAYER_GAME_OVER', (data) => {
			console.log('PLAYER_GAME_OVER', data);
            if (data.playerName === playerName) {
                setPlayerScore(data.score);
                setPlayerRank(data.rank);
				setIsAlive(false);
            }
        });

		socket.on('PLAYER_WINNER', (data) => {
			console.log('PLAYER_WINNER', data);
			if (!data) { /* Game was played alone */
			}

			else if (data.playerName === playerName) {
				setPlayerScore(data.score);
				setPlayerRank(data.rank);
			}
			setIsAlive(false);
			setGameIsPlaying(false);

            socket.emit('GET_SCORE', { playerName: playerName }, (data) => {
                console.log("GET_SCORE", data);
                if (data.code !== 0) {
                    console.error('Error while getting score', data.error);
                }
                else setScore(data.score);
            });
		});



        socket.emit('ASK_INFORMATIONS_GAME_PAGE', { gameName: gameName, playerName: playerName }, (data) => {
            if (data.code !== 0) { console.error(data.error); navigate('/'); return; }

            setIsCreator(data.creator === playerName);
            setPlayers(data.players);
        });
        return () => {
            window.removeEventListener("beforeunload", handleLeavePage);
            socket.off('PLAYER_WINNER');
            socket.off('PLAYER_GAME_OVER');
            socket.off('GAME_STARTED');
            socket.off('USER_JOIN_GAME');
            socket.off('USER_LEAVE_GAME');
        }
    }, [socket, gameName, playerName, isAuthenticated, navigate, isCreator]);

    const handleGoHome = () => {
		if (!isAuthenticated) { console.error('Not authenticated'); return; }
		if (!socket) { console.error('Socket not connected'); return; }

		console.log('PLAYER_LEAVE_ROOM', { gameName: gameName, playerName: playerName });
		socket.emit('PLAYER_LEAVE_ROOM', { gameName: gameName, playerName: playerName }, (data) => {
			if (data.code !== 0) { console.error(data.error); return; }
		});
        navigate('/');
    };

	const handleGiveUp = () => {
		if (!isAuthenticated) { console.error('Not authenticated'); return; }
		if (!socket) { console.error('Socket not connected'); return; }

		socket.emit('PLAYER_GIVE_UP', { gameName: gameName, playerName: playerName }, (data) => {
			if (data.code !== 0) { console.error(data.error); return; }
			console.log('PLAYER_GIVE_UP', data);
			setIsAlive(false);
			setPlayerScore(data.score);
			setPlayerRank(data.rank);
		});
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
                <div className="score-display">Score: {score}</div>
            </header>
			{isAlive && <TetrisGame handlerGiveUp={handleGiveUp} leftPlayerName={leftPlayerName} rightPlayerName={rightPlayerName} />}
            {!isAlive &&
                <div className="game-container">
                    <h1 className="game-title">Game: {gameName}</h1>
                    {isCreator && <h3 className="game-subtitle">You are the creator</h3>}
                    <h3 className="game-subtitle">Players:</h3>
                    <ul className="game-players-list">
                        {players.map((player, index) => <li key={index}>{player}</li>)}
                    </ul>

					{playerScore !== -1 && (
                        <div className="player-score">
                            <p>Your score: {playerScore}</p>
                            <p>Your rank: {playerRank}</p>
                        </div>
                    )}

                    {responseMessage && <p className="game-response-message">{responseMessage}</p>}
                    <button className="game-button" onClick={handleGoHome}>Home</button>
                    {isCreator && !gameIsPlaying && <button className="game-button" onClick={handleStartGame}>Start</button>}
                </div>
            }
        </>
    );
}

export default GameComponent;

