import React, { useEffect/*, useState*/ } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import Leaderboard from './components/Leaderboard';
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
            <Route path="/:idRoom" element={<GameComponent />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
        </Routes>
      </Router>
  );
}

export default App;
