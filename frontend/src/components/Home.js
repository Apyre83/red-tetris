import React, { useState } from 'react';

function Home() {
  const [room, setRoom] = useState('');
  const [playerName, setPlayerName] = useState('');

  const handleJoinGame = (e) => {
    e.preventDefault();
    window.location.href = `#${room}${playerName ? '[' + playerName + ']' : ''}`;
  };

  const handleCreateGame = (e) => {
    e.preventDefault();
    const uniqueRoomName = generateUniqueRoomName();
    window.location.href = `#${uniqueRoomName}${playerName ? '[' + playerName + ']' : ''}`;
  };

  function generateUniqueRoomName() {
    return Math.random().toString(36).substr(2, 9);
  }

  return (
    <div>
      <h1>Red Tetris</h1>
      <form>
        <input
          type="text"
          placeholder="Nom de la salle"
          value={room}
          onChange={(e) => setRoom(e.target.value)}
        />
        <input
          type="text"
          placeholder="Votre nom"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
        />
        <button onClick={handleJoinGame}>Rejoindre</button>
        <button onClick={handleCreateGame}>Créer une partie</button>
      </form>
    </div>
  );
}

export default Home;

