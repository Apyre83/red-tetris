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

    const [error, setError] = useState('');
    const [errorCount, setErrorCount] = useState(0);

    useEffect(() => {
        if (!socket) { /*console.error('Socket not connected'); */return; }

        return () => {
        }
    }, [socket]);

    const socketJoinGame = (game, playerName, callback) => {
        socket.emit('JOIN_GAME', {
            game,
            playerName
        }, (data) => {
            if (data.code !== 0) {
                setError(data.error);
                setErrorCount(prev => prev + 1);
                return;
            }
            console.log("Game joined successfully: ", data);
            window.location.href = `#${data.game}[${data.playerName}]`;
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
        if (!game) {
            setError('Veuillez choisir une salle pour rejoindre.');
            setErrorCount(prev => prev + 1);
            return;
        }
        setError('');
        socketJoinGame(game, playerName);
    };

    const handleCreateGame = (e) => {
        if (!socket) { console.error('Socket not connected'); return; }

        e.preventDefault();
        if (!playerName) {
            setError('Veuillez saisir un nom.');
            return;
        }
        setError('');
        const uniqueGameName = generateUniqueGameName();

        socket.emit('CREATE_GAME',{
            gameName: uniqueGameName,
            playerName
        }, (data) => {
            console.log("Game created successfully: ", data);
            if (data.code !== 0) {
                setError(data.error);
                setErrorCount(prev => prev + 1);
                return;
            }
            else {
                socketJoinGame(uniqueGameName, playerName);
            }
        });
    };

    function generateUniqueGameName() {
        return Math.random().toString(36).substr(2, 9);
    }

    const onAuthentication = (status) => {
        dispatch({ type: 'LOGOUT', payload: status });
    }

    return (
        <div className="home-container">
            {!isAuthenticated && (
                <Modal>
                    {showLogin ? (
                        <>
                            <LoginForm />
                            <button onClick={() => setShowLogin(false)} className="modal-button">S'inscrire</button>
                        </>
                    ) : (
                        <>
                            <SignUpForm />
                            <button onClick={() => setShowLogin(true)} className="modal-button">Se connecter</button>
                        </>
                    )}
                </Modal>
            )}
            {isAuthenticated && (
                <>
                    <header className="home-header">
                        <h2 className="header-title">Authenticated as {playerName}</h2>
                    </header>
                    <div className="home-container">

                        {error && <div key={errorCount} className="error-message">{error}</div>}
                        {/*<h2 className="connectedAs">Connecté en tant que {playerName}</h2>*/}
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
                        </form>
                    </div>
                </>
            )}
        </div>
    );
}

export default Home;
