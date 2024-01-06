import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import './TetrisGame.css';

function getPlayerNameFromHash() {
    const match = window.location.hash.match(/#([^[]+)(?:\[(.*?)\])?/);
    return match?.[2];
}

function getGameNameFromHash() {
    const match = window.location.hash.match(/#([^[]+)(?:\[(.*?)\])?/);
    return match?.[1];
}

function TetrisGame() {
    const socket = useSelector(state => state.socket.socket);
    const navigate = useNavigate();
    const [grid, setGrid] = useState(createEmptyGrid());

    const playerName = getPlayerNameFromHash();

    const [leftPlayerName, setLeftPlayerName] = useState('');
    const [rightPlayerName, setRightPlayerName] = useState('');
    const [leftPlayerGrid, setLeftPlayerGrid] = useState(createEmptyGrid());
    const [rightPlayerGrid, setRightPlayerGrid] = useState(createEmptyGrid());

	const [isAlive, setIsAlive] = useState(true);
    const [playerScore, setPlayerScore] = useState(0);
    const [playerPosition, setPlayerPosition] = useState(null);
    const [gameResults, setGameResults] = useState(null); // Pour stocker les résultats finaux

    useEffect(() => {
        if (!socket) { console.error('Socket not connected'); return; }

		socket.on('PLAYER_GAVE_UP', (data) => {
			console.log('PLAYER_GAVE_UP', data);
            setIsAlive(false);
            setPlayerPosition(data.rank);
            setPlayerScore(data.score);
        });

        socket.on('PLAYER_GAME_OVER', (data) => {
			console.log('PLAYER_GAME_OVER', data);
            setIsAlive(false);
            setPlayerPosition(data.position);
            setPlayerScore(data.score);
        });

        socket.on('PLAYER_WINNER', (data) => {
			console.log('PLAYER_WINNER', data);
            setIsAlive(false);
            setGameResults(data.results);
        });

        socket.on('GAME_CLOSED', () => {
			console.log('GAME_CLOSED');
            // Nettoyer et rediriger si nécessaire
            setIsAlive(false);
            setPlayerScore(0);
            setPlayerPosition(null);
            setGameResults(null);
            // Rediriger au lobby ou à l'écran principal
        });


        socket.on('UPDATE_BOARD', (data) => {
            setGrid(data.board);
        });

        socket.on('UPDATE_SPECTRUM', (data) => {
            if (leftPlayerName === '' || leftPlayerName === data.playerName) {
                setLeftPlayerName(data.playerName);
                setLeftPlayerGrid(data.spectrum);
            }
            else if (rightPlayerName === '' || rightPlayerName === data.playerName) {
                setRightPlayerName(data.playerName);
                setRightPlayerGrid(data.spectrum);
            }
        });

        const handleKeyPress = (event) => {
            let movement;
            switch (event.key) {
                case 'ArrowLeft':
                case 'a':
                    movement = 'moveLeft';
                    break;
                case 'ArrowRight':
                case 'd':
                    movement = 'moveRight';
                    break;
                case 'ArrowDown':
                case 's':
                    movement = 'moveDown';
                    break;
                case ' ':
                    movement = 'directBottom';
                    break;
                case 'q':
                    movement = 'rotateLeft';
                    break;
                case 'e':
                case 'ArrowUp':
                    movement = 'rotateRight';
                    break;
                default:
                    return;
            }
            socket.emit('MOVEMENT', {playerName: playerName, movement: movement}, (data) => {
                if (data.code !== 0) console.error(data.error);
            });
        };

        socket.on('GAME_OVER', (data) => {
            console.log('GAME_OVER', data);
            window.removeEventListener('keydown', handleKeyPress);
            // TODO
        });
        
        window.addEventListener('keydown', handleKeyPress);
        return () => {
            window.removeEventListener('keydown', handleKeyPress);
        };
    }, [socket, playerName, leftPlayerName, rightPlayerName]);

    function createEmptyGrid() {
        return Array.from({ length: 21 }, () => Array(12).fill([0, '#ffffff']));
    }

    
	const handleGiveUp = () => {
		socket.emit('PLAYER_GIVE_UP', {playerName: playerName, gameName: getGameNameFromHash()}, (data) => {
			console.log('PLAYER_GIVE_UP', data);
			if (data.code !== 0) console.error(data.error); return;
			setIsAlive(false);
		});
	};

    return (
        <div>
        <button className="game-button" onClick={handleGiveUp}>ABANDONNER</button>
		{isAlive && (
			<div className="tetris-game-container">
				<div className="side-player">
					{leftPlayerGrid.map((row, rowIndex) => (
						<div key={rowIndex} className="tetris-row">
							{row.map(([filled, color], cellIndex) => (
								<div key={cellIndex} className="tetris-cell small" style={{ backgroundColor: color }}></div>
							))}
						</div>
					))}
				</div>
				<div className="main-player">
					{grid.map((row, rowIndex) => (
						<div key={rowIndex} className="tetris-row">
							{row.map(([filled, color], cellIndex) => (
								<div key={cellIndex} className="tetris-cell" style={{ backgroundColor: color }}></div>
							))}
						</div>
					))}
				</div>
				<div className="side-player">
					{rightPlayerGrid.map((row, rowIndex) => (
						<div key={rowIndex} className="tetris-row">
							{row.map(([filled, color], cellIndex) => (
								<div key={cellIndex} className="tetris-cell small" style={{ backgroundColor: color }}></div>
							))}
						</div>
					))}
				</div>
			</div>
		)}
		{!isAlive && (
                <div className="game-over-display">
                    {gameResults ? (
                        <div>
                            {/* Afficher les résultats de la partie pour tous les joueurs */}
                            {gameResults.map((result, index) => (
                                <p key={index}>{result.playerName}: Position - {result.position}, Score - {result.score}</p>
                            ))}
                        </div>
                    ) : (
                        <div>
                            {/* Afficher les résultats pour le joueur actuel */}
                            <p>Votre position: {playerPosition}</p>
                            <p>Votre score: {playerScore}</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default TetrisGame;
