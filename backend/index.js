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
    //console.log('a user connected');

    socket.on('CREATE_GAME', (data, callback) => {
        console.log('CREATE GAME', data);
        if (rooms[data.room]) { callback({...data, code: 1, error: "Room already exists"}); return; }

        rooms[data.room] = [];
        callback({...data, code: 0, players: rooms[data.room]});
    });

    socket.on('JOIN_GAME', (data, callback) => {
        console.log("JOIN GAME", data);
        if (!rooms[data.room]) { callback({...data, code: 1, error: "Room does not exist"}); return; }
        for (const room in rooms) {
            if (rooms[room].includes(data.playerName)) { callback({...data, code: 2, error: "Player already in a room"}); return; }
        }

        /* TODO: check if room is full */
        rooms[data.room].push(data.playerName);
        callback({...data, code: 0, players: rooms[data.room]});
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
        //socket.emit('GAME_STARTED_OK', data);
        /* TODO: start the game */
    });

    socket.on('WHO_IS_CREATOR', (room, callback) => {
        console.log('WHO IS CREATOR', room);
        if (!rooms[room]) { callback({room, players: [], creator: null}); return; }

        callback({room, players: rooms[room], creator: rooms[room][0]});
    });


    socket.on('disconnect', () => {
        //console.log('user disconnected');
    });
});

server.listen(8080, () => {
  console.log('server running at http://localhost:8080');
});