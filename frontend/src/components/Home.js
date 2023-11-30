import React, {useState} from 'react';
import './Home.css';

function Home() {
    const [room, setRoom] = useState('');
    const [playerName, setPlayerName] = useState('');
    const [error, setError] = useState('');
    const [errorCount, setErrorCount] = useState(0);


    const handleJoinGame = (e) => {
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
        window.location.href = `#${room}[${playerName}]`;
    };

    const handleCreateGame = (e) => {
        e.preventDefault();
        if (!playerName) {
            setError('Veuillez saisir un nom.');
            return;
        }
        setError('');
        const uniqueRoomName = generateUniqueRoomName();
        window.location.href = `#${uniqueRoomName}[${playerName}]`;
    };

    function generateUniqueRoomName() {
        return Math.random().toString(36).substr(2, 9);
    }

    return (
        <div className="home-container">
          {error && <div key={errorCount} className="error-message">{error}</div>}
            {/*<h1 className="title">TETRIS</h1>*/}
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
