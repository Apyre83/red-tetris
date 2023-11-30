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

  // Vous pouvez ajouter ici une fonction pour générer un nom de salle unique
  // Par exemple, en utilisant une combinaison de date/heure et un identifiant aléatoire

  return (
    <form onSubmit={handleJoinGame}>
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
      <button type="submit">Rejoindre</button>
      <button onClick={handleCreateGame}>Créer une partie</button>
    </form>
  );
}

export default Home;

// Exemple de fonction pour générer un nom de salle unique
function generateUniqueRoomName() {
  return Math.random().toString(36).substr(2, 9);
}

