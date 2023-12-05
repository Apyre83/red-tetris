// TetrisGame.js

import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import './TetrisGame.css'; // Assurez-vous de créer ce fichier CSS pour le style

function TetrisGame() {
    const socket = useSelector(state => state.socket.socket);
    const [grid, setGrid] = useState(createEmptyGrid());

    useEffect(() => {
        socket.on('UPDATE_BOARD', newGrid => {
            setGrid(newGrid);
        });

        // Nettoyage des listeners lors du démontage du composant
        return () => {
            socket.off('UPDATE_BOARD');
        };
    }, [socket]);

    function createEmptyGrid() {
        // Créez et retournez une grille vide pour Tetris
        return Array.from({ length: 20 }, () => Array(10).fill(0));
    }

    return (
        <div className="tetris-container">
            {grid.map((row, rowIndex) => (
                <div key={rowIndex} className="tetris-row">
                    {row.map((cell, cellIndex) => (
                        <div key={cellIndex} className={`tetris-cell ${cell ? 'filled' : ''}`}></div>
                    ))}
                </div>
            ))}
        </div>
    );
}

export default TetrisGame;