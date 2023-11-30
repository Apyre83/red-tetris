import React, { useEffect } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import GameComponent from './components/GameComponent';
import { useDispatch } from 'react-redux';
import { connectWebSocket } from './actions/socketActions';

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(connectWebSocket());
  }, [dispatch]);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/:room/:playerName" element={<GameComponent />} />
        {/* Ajoutez d'autres routes si nécessaire */}
      </Routes>
    </Router>
  );
}

export default App;

