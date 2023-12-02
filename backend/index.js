const http = require('http');
const express = require('express');
const cors = require('cors');
const path = require('path');
const { Server } = require('socket.io');


const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000", /* TODO: Change localhost for the future frontend URL */
        methods: ["GET", "POST"]
    }
});

app.use(cors({
    origin: "http://localhost:3000", /* TODO: Change localhost for the future frontend URL */
    methods: ["GET", "POST"]
}));



app.get('/', (req, res) => {
    res.status(200).sendFile(path.resolve(__dirname, './index.html'));
});

rooms = {
    /* name: [players], first player is the creator */
};

io.on('connection', (socket) => {
    console.log('a user connected');

    socket.on('CREATE_GAME', (data) => {
        console.log(data);
        if (rooms[data.room]) {
            socket.emit('GAME_CREATED_KO', {
                error: 'Room already exists'
            });
            return;
        }
        rooms[data.room] = [data.playerName];
        socket.emit('GAME_CREATED_OK', data);
    });

    socket.on('JOIN_GAME', (data) => {
        console.log(data);
        if (!rooms[data.room]) {
            socket.emit('GAME_JOINED_KO', {
                error: 'Room does not exist'
            });
            return;
        }
        /* TODO: check if player name already exists */
        /* TODO: check if room is full */
        /* TODO: check if player is already in a room */
        rooms[data.room].push(data.playerName);
        socket.emit('GAME_JOINED_OK', data);
    });

    socket.on('START_GAME', (data) => {
        console.log(data);
        if (!rooms[data.room]) {
            socket.emit('GAME_STARTED_KO', {
                error: 'Room does not exist'
            });
            return;
        }
        if (rooms[data.room][0] !== data.playerName) {
            socket.emit('GAME_STARTED_KO', {
                error: 'Only the creator can start the game'
            });
            return;
        }
        socket.emit('GAME_STARTED_OK', data);
        /* TODO: start the game */
    });

    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});

server.listen(8080, () => {
  console.log('server running at http://localhost:8080');
});
