import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

function GameComponent() {
  const location = useLocation();
  const navigate = useNavigate();
  const hash = location.hash;
  const match = hash.match(/#([^[]+)(?:\[(.*?)\])?/);
  const room = match?.[1];
  const playerName = match?.[2];

  // Implémentez ici votre logique pour déterminer si le joueur est le créateur
  // Pour l'instant, nous allons supposer que tous les joueurs sont des créateurs pour éviter l'erreur
  const isCreator = true; 

  const handleGoHome = () => {
    navigate('/');
  };

  const handleStartGame = () => {
    // Logique pour démarrer la partie
  };

  return (
    <div>
      <h1>Room: {room}</h1>
      <h2>Player Name: {playerName}</h2>
      <button onClick={handleGoHome}>Retour à l'accueil</button>
      {isCreator && <button onClick={handleStartGame}>Lancer la partie</button>}
    </div>
  );
}

export default GameComponent;

