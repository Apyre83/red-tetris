 import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import './TetrisGame.css';

function getPlayerNameFromHash() {
    const match = window.location.hash.match(/#([^[]+)(?:\[(.*?)\])?/);
    return match ? match[2] : null;
}

function TetrisGame({ handlerGiveUp, leftPlayerName, rightPlayerName }) {
    const socket = useSelector(state => state.socket.socket);
    const [grid, setGrid] = useState(createEmptyGrid());

    const playerName = getPlayerNameFromHash();

    const [leftPlayerGrid, setLeftPlayerGrid] = useState(createEmptyGrid());
    const [rightPlayerGrid, setRightPlayerGrid] = useState(createEmptyGrid());

    useEffect(() => {
        if (!socket) { return; }

        socket.on('UPDATE_BOARD', (data) => {
            setGrid(data.board);
        });

        socket.on('UPDATE_SPECTRUM', (data) => {
            if (leftPlayerName === data.playerName) { setLeftPlayerGrid(data.spectrum); }
            else if (rightPlayerName === data.playerName) { setRightPlayerGrid(data.spectrum); }

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

	window.addEventListener('keydown', handleKeyPress);
        return () => {
            window.removeEventListener('keydown', handleKeyPress);
            socket.off('UPDATE_BOARD');
            socket.off('UPDATE_SPECTRUM');
        };
    }, [socket, playerName, leftPlayerName, rightPlayerName]);

    function createEmptyGrid() {
        return Array.from({ length: 21 }, () => Array(12).fill([0, '#ffffff']));
    }

    return (
        <div>
        <button className="game-button" onClick={handlerGiveUp}>GIVE UP</button>
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
                            <div key={cellIndex} data-testid={`main-grid-cell-${rowIndex}-${cellIndex}`}
                                 className="tetris-cell" style={{backgroundColor: color}}></div>))}

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
        </div>
    );
}

export default TetrisGame;
