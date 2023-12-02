import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import './Home.css';

function Home() {
    const socket = useSelector(state => state.socket.socket); // Assurez-vous que le chemin est correct


    const [room, setRoom] = useState('');
    const [playerName, setPlayerName] = useState('');
    const [error, setError] = useState('');
    const [errorCount, setErrorCount] = useState(0);

    useEffect(() => {
        console.log("Socket: ", socket);
        if (socket) {
            return () => {
            };
        }
    }, [socket]);

    const socketJoinGame = (room, playerName, callback) => {
        socket.emit('JOIN_GAME', {
            room,
            playerName
        }, (data) => {
            if (data.code !== 0) {
                setError(data.error);
                setErrorCount(prev => prev + 1);
                return;
            }
            console.log("Game joined successfully: ", data);
            window.location.href = `#${data.room}[${data.playerName}]`;
        });
    }

    const handleJoinGame = (e) => {
        if (!socket) { console.error('Socket not connected'); return; }

        e.preventDefault();
        if (!playerName) {
            setError('Veuillez saisir un nom.');
            setErrorCount(prev => prev + 1);
            return;
        }
        if (!room) {
            setError('Veuillez choisir une salle pour rejoindre.');
            setErrorCount(prev => prev + 1);
            return;
        }
        setError('');
        socketJoinGame(room, playerName);
    };

    const handleCreateGame = (e) => {
        if (!socket) { console.error('Socket not connected'); return; }

        e.preventDefault();
        if (!playerName) {
            setError('Veuillez saisir un nom.');
            return;
        }
        setError('');
        const uniqueRoomName = generateUniqueRoomName();

        socket.emit('CREATE_GAME',{
            room: uniqueRoomName,
            playerName
        }, (data) => {
            console.log("Game created successfully: ", data);
            if (data.code !== 0) {
                setError(data.error);
                setErrorCount(prev => prev + 1);
                return;
            }
            else {
                socketJoinGame(uniqueRoomName, playerName);
            }
        });
    };

    function generateUniqueRoomName() {
        return Math.random().toString(36).substr(2, 9);
    }

    return (
        <div className="home-container">
          {error && <div key={errorCount} className="error-message">{error}</div>}
            <h1 className="title">Tetris Game</h1>
            <form className="home-form">
                <input
                    className="input-field"
                    type="text"
                    placeholder="Nom de la salle"
                    value={room}
                    onChange={(e) => setRoom(e.target.value)}
                />
                <input
                    className="input-field"
                    type="text"
                    placeholder="Votre nom"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                />
                <button className="home-button" onClick={handleJoinGame}>Rejoindre</button>
                <button className="home-button" onClick={handleCreateGame}>Créer une partie</button>
            </form>
        </div>
    );
}

export default Home;
