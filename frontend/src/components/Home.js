import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Modal from './Modal';
import LoginForm from './LoginForm';
import SignUpForm from './SignUpForm';
import './Home.css';


function Home() {
    const socket = useSelector(state => state.socket.socket);
    const isAuthenticated = useSelector(state => state.auth.isAuthenticated);
    const dispatch = useDispatch();

    const [showLogin, setShowLogin] = useState(true);

    const [game, setGame] = useState('');

    const user = useSelector(state => state.auth);
    const playerName = user.isAuthenticated ? user.user : '';
    const [score, setScore] = useState(0);

    const [error, setError] = useState('');
    useEffect(() => {
        if (!socket) { return; }

        socket.emit('GET_SCORE', { playerName: playerName }, (data) => {
            if (data.code !== 0) {}
            else setScore(data.score);
        });

        return () => {
        }
    }, [socket, playerName]);

    const socketJoinGame = (gameName, playerName, callback) => {
        socket.emit('JOIN_GAME', { gameName: gameName, playerName: playerName }, (data) => {
            if (data.code !== 0) {
                setError(data.error);
                return;
            }
            window.location.href = `#${data.gameName}[${data.playerName}]`;
        });
    }

    const handleJoinGame = (e) => {
        if (!socket) { return; }

        e.preventDefault();
        if (!playerName) {
            setError('Please enter a room name.');
            return;
        }

        if (!game) {
            setError('Please enter a valid room name.');
            return;
        }
        setError('');
        socketJoinGame(game, playerName);
    };

    const handleCreateGame = (e) => {
        if (!socket) { return; }

        e.preventDefault();
        if (!playerName) {
            setError('Please enter a room name.');
            return;
        }
        setError('');
        const uniqueGameName = Math.random().toString(36).substr(2, 9);

        socket.emit('CREATE_GAME', { gameName: uniqueGameName, playerName: playerName }, (data) => {
            if (data.code !== 0) {
                setError(data.error);
                return;
            }
            socketJoinGame(uniqueGameName, playerName);
        });
    };

    const onAuthentication = (status) => {
        if (status === false) {
            dispatch({ type: 'LOGOUT', payload: status });
            socket.emit('LOGOUT', { playerName: playerName }, (data) => {});
        }
    }

    const goToLeaderboard = (e) => {
        e.preventDefault();
        window.location.href = '#leaderboard';
    }

    return (
        <div className="home-container">
            {!isAuthenticated && (
                <Modal>
                    {showLogin ? (
                        <>
                            <LoginForm/>
                            <button onClick={() => setShowLogin(false)} className="modal-button">Register</button>
                        </>
                    ) : (
                        <>
                            <SignUpForm setShowLogin={setShowLogin} />
                            <button onClick={() => setShowLogin(true)} className="modal-button">Login</button>
                        </>
                    )}
                </Modal>
            )}
            {isAuthenticated && (
                <>
                    <header className="home-header">
                        <h2 className="header-title">Authenticated as {playerName}</h2>
                        <div className="score-display">Score: {score}</div>
                    </header>
                    <div className="home-container">
                        {error && <div className="error-message">{error}</div>}
                        <h1 className="title">Tetris Game</h1>
                        <form className="home-form">
                            <input
                                className="input-field"
                                type="text"
                                placeholder="Game name"
                                value={game}
                                onChange={(e) => setGame(e.target.value)}
                            />
                            <button className="home-button" onClick={handleJoinGame}>Join</button>
                            <button className="home-button" onClick={handleCreateGame}>Create game</button>
                            <button className="home-button" onClick={() => onAuthentication(false)}>Logout</button>
                            <button className="home-button" onClick={goToLeaderboard}>Leaderboard</button>
                        </form>
                    </div>
                </>
            )}
        </div>
    );
}


export default Home;
