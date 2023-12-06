import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import './TetrisGame.css'; // Assurez-vous de créer ce fichier CSS pour le style

function getPlayerNameFromHash() {
    const match = window.location.hash.match(/#([^[]+)(?:\[(.*?)\])?/);
    return match?.[2];
}

function TetrisGame() {
    const socket = useSelector(state => state.socket.socket);
    const [grid, setGrid] = useState(createEmptyGrid());

    const playerName = getPlayerNameFromHash();

    const [leftPlayerName, setLeftPlayerName] = useState('');
    const [rightPlayerName, setRightPlayerName] = useState('');
    const [leftPlayerGrid, setLeftPlayerGrid] = useState(createEmptyGrid());
    const [rightPlayerGrid, setRightPlayerGrid] = useState(createEmptyGrid());


    useEffect(() => {
        socket.on('UPDATE_BOARD', (data) => {
            // console.log('UPDATE_BOARD', data);
            setGrid(data.board);
        });

        socket.on('UPDATE_SPECTRUM', (data) => {
            // console.log('UPDATE_SPECTRUM', data);
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
            socket.emit('MOVEMENT', {playerName: playerName, movement: movement});
        };
        window.addEventListener('keydown', handleKeyPress);
        return () => {
            window.removeEventListener('keydown', handleKeyPress);
        };
    }, [socket, playerName, leftPlayerName, rightPlayerName]);

    function createEmptyGrid() {
        return Array.from({ length: 21 }, () => Array(12).fill([0, '#ffffff']));
    }

    return (
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
    );
}

export default TetrisGame;