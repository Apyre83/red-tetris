import React, { useEffect/*, useState*/ } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import GameComponent from './components/GameComponent';
import { useDispatch } from 'react-redux';


import { connectWebSocket } from './actions/socketActions';
//import { ConnectionState } from './components/ConnectionState';
//import { ConnectionManager } from './components/ConnectionManager';
//import { socket } from './socket';


function App() {

	//const [isConnected, setIsConnected] = useState(socket.connected);
	//const [fooEvents, setFooEvents] = useState([]);
	
	
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(connectWebSocket());
  
	/*function onConnect() {
		console.log("onConnect");
		setIsConnected(true);
	}
	function onDisconnect() {
		setIsConnected(false);
	}
	function onFooEvent(data) {
		setFooEvents(previous => [...previous, data]);
	}

	  socket.on('connect', onConnect);
	  socket.on('disconnect', onDisconnect);
	  socket.on('foo', onFooEvent);

	  return () => {
		  socket.off('connect', onConnect);
		  socket.off('disconnect', onDisconnect);
		  socket.off('foo', onFooEvent);
	  }*/

  }, [dispatch]);

  return (
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/:roomId" element={<GameComponent />} />
          {/* autres routes */}
        </Routes>
      </Router>
  );
}

export default App;
