const http          = require('http');
const express       = require('express');
const cors          = require('cors');
const path          = require('path');
const { Server }    = require('socket.io');
const Player        = require('./src/Classes/Player');
const Game          = require('./src/Classes/Game');

const fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000", /* TODO: Change localhost for the future frontend URL */
        methods: ["GET", "POST"]
    }
});

app.use(express.json());


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

    socket.on('LOGIN', (data, callback) => {
        if (data.username === '') { callback({...data, code: 1, error: "Username cannot be empty"}); return; }
        if (data.password === '') { callback({...data, code: 2, error: "Password cannot be empty"}); return; }

        const database = readDatabase();
        if (!database[data.username]) { callback({...data, code: 1, error: "Username does not exist"}); return; }
        if (database[data.username].password !== data.password) { callback({...data, code: 2, error: "Wrong password"}); return; }

        callback({...data, code: 0});
    });

    socket.on('SIGNUP', (data, callback) => {
        console.log('SIGNUP', data);
        const database = readDatabase();
        if (database[data.username]) { callback({...data, code: 1, error: "Username already exists"}); return; }
        if (database[data.email]) { callback({...data, code: 2, error: "Email already exists"}); return; }

        if (data.username === '') { callback({...data, code: 3, error: "Username cannot be empty"}); return; }
        if (data.email === '') { callback({...data, code: 4, error: "Email cannot be empty"}); return; }
        if (data.password === '') { callback({...data, code: 5, error: "Password cannot be empty"}); return; }

        // TODO: password hashing
        database[data.username] = {
            password: data.password,
            email: data.email
        };
        writeDatabase(database);

        callback({...data, code: 0});
    });

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