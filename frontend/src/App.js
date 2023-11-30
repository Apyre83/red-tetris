import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import GameComponent from './components/GameComponent'; // Assurez-vous d'importer GameComponent

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/:room/:playerName" element={<GameComponent />} />
        {/* Autres routes ici */}
      </Routes>
    </Router>
  );
}

export default App;

