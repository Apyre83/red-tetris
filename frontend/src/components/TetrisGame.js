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


    useEffect(() => {
        socket.on('UPDATE_BOARD', (data) => {
            // console.log('UPDATE_BOARD', data);
            setGrid(data.board);
        });

        const handleKeyPress = (event) => {
            let movement;
            switch (event.key) {
                case 'ArrowLeft':
                    movement = 'moveLeft';
                    break;
                case 'ArrowRight':
                    movement = 'moveRight';
                    break;
                case 'ArrowDown':
                    movement = 'moveDown';
                    break;
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
    }, [socket, playerName]);

    function createEmptyGrid() {
        return Array.from({ length: 20 }, () => Array(10).fill([0, '#ffffff']));
    }

    return (
        <div className="tetris-container">
            {grid.map((row, rowIndex) => (
                <div key={rowIndex} className="tetris-row">
                    {row.map(([filled, color], cellIndex) => (
                        <div key={cellIndex} className="tetris-cell" style={{ backgroundColor: color }}></div>
                    ))}
                </div>
            ))}
        </div>
    );
}

export default TetrisGame;