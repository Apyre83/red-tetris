const http        = require('http'); 
const express     = require('express'); 
const path        = require('path');
const { Server }  = require('socket.io');

const app       = express();
const server    = http.createServer(app);
const io        = new Server(server, {
    connectionStateRecoverty: {}
});

app.get('/', (req, res) => {
    res.status(200).sendFile(path.resolve(__dirname, './index.html'));
});

io.on('connection', (socket) => {
    console.log('a user connected');
    socket.on('disconnect', () => {
      console.log('user disconnected');
    });
})

server.listen(3000, () => {
  console.log('server running at http://localhost:3000');
});