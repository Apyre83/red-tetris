/*const http = require('http');
const express = require('express');
const cors = require('cors');
const path = require('path');
const { Server } = require('socket.io');

const fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});

app.use(express.json());


app.use(cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
}));


app.get('/', (req, res) => {
    res.status(200).sendFile(path.resolve(__dirname, './index.html'));
});

rooms = {

};


const DATABASE_FILE = './databases/database.json';

function readDatabase() {
    const data = fs.readFileSync(DATABASE_FILE, 'utf8');
    return JSON.parse(data);
}
function writeDatabase(data) {
    fs.writeFileSync(DATABASE_FILE, JSON.stringify(data, null, 2), 'utf8');
}

io.on('connection', (socket) => {
    //console.log('a user connected');

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
    });

    socket.on('PLAYER_LEFT_GAME_PAGE', (data) => {
        console.log('PLAYER LEFT GAME PAGE', data);
        if (!rooms[data.room]) { return; }
        rooms[data.room] = rooms[data.room].filter(player => player !== data.playerName);
        if (rooms[data.room].length === 0) { delete rooms[data.room]; return; }

        for (const user of io.sockets.adapter.rooms.get(data.room)) {
            io.to(user).emit('PLAYER_LEFT_GAME_PAGE', data);
        }
    });

    socket.on('disconnect', () => {
        //console.log('user disconnected');
    });
});

server.listen(8080, () => {
  console.log('server running at http://localhost:8080');
});*/

const Server = require('./src/Classes/Server');

const server = new Server(8080);
server.start();
