const http = require('http');
const express = require('express');
const { Server: IOServer } = require('socket.io');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const Player = require('./Player');

class Server {
    constructor(port) {
        this.app = express();
        this.server = http.createServer(this.app);
        this.io = new IOServer(this.server, {
            cors: {
                origin: "http://localhost:3000", // ou utiliser '*' pour autoriser toutes les origines
                methods: ["GET", "POST"],
                allowedHeaders: ["my-custom-header"],
                credentials: true
            }
        });
        this.port = port;
        this.rooms = {}; /* TODO */
        /* this.players is a list of Players from Player.js */
        this.players = [];

        this.DATABASE_FILE = './databases/database.json';
    }

    start() {
        this.configureApp();
        this.handleRoutes();
        this.handleSocketConnections();
        this.server.listen(this.port, () => {
            console.log(`server running at http://localhost:${this.port}`);
        });
    }

    configureApp() {
        this.app.use(express.json());
        this.app.use(express.static(path.join(__dirname, 'public')));
    }

    handleRoutes() {
        this.app.get('/', (req, res) => {
            res.status(200).sendFile(path.resolve(__dirname, './index.html'));
        });
    }

    handleSocketConnections() {
        this.io.on('connection', (socket) => {
            this.players.push(new Player(this.io, socket, '')); /* '' is the username but since the user is not logged in yet, it is empty */

            socket.on('disconnect', () => {
                this.players = this.players.filter(player => player.socket.id !== socket.id);
            });

            socket.on('LOGIN', (data, callback) => {
                console.log('LOGIN', data);
                if (data.username === '') { callback({...data, code: 1, error: "Username cannot be empty"}); return; }
                if (data.password === '') { callback({...data, code: 2, error: "Password cannot be empty"}); return; }

                const database = this.readDatabase();
                if (!database[data.username]) { callback({...data, code: 1, error: "Username does not exist"}); return; }
                if (database[data.username].password !== data.password) { callback({...data, code: 2, error: "Wrong password"}); return; }

                /* Change the username of the player */
                for (const player of this.players) {
                    if (player.socket.id === socket.id) { player.username = data.username; }
                }
                callback({...data, code: 0});
            });

            socket.on('SIGNUP', (data, callback) => {
                console.log('SIGNUP', data);
                const database = this.readDatabase();
                if (database[data.username]) { callback({...data, code: 1, error: "Username already exists"}); return; }
                if (database[data.email]) { callback({...data, code: 2, error: "Email already exists"}); return; }

                if (data.username === '') { callback({...data, code: 3, error: "Username cannot be empty"}); return; }
                if (data.email === '') { callback({...data, code: 4, error: "Email cannot be empty"}); return; }
                if (data.password === '') { callback({...data, code: 5, error: "Password cannot be empty"}); return; }

                for (const player of this.players) {
                    if (player.socket.id === socket.id) { player.username = data.username; }
                }

                // TODO: password hashing
                database[data.username] = {
                    password: data.password,
                    email: data.email
                };
                this.writeDatabase(database);

                callback({...data, code: 0});
            });

            socket.on('CREATE_GAME', (data, callback) => {
                console.log('CREATE GAME', data);
                if (this.rooms[data.room]) { callback({...data, code: 1, error: "Room already exists"}); return; } /* TODO: replace room by class Room */

                this.rooms[data.room] = []; /* TODO: replace room by class Room */
                callback({...data, code: 0, players: this.rooms[data.room]}); /* TODO: replace room by class Room */
            });

            socket.on('JOIN_GAME', (data, callback) => {
                console.log("JOIN GAME", data);
                if (!this.rooms[data.room]) { callback({...data, code: 1, error: "Room does not exist"}); return; } /* TODO: replace room by class Room */
                for (const room in this.rooms) { /* TODO: replace room by class Room */
                    if (this.rooms[room].includes(data.playerName)) { callback({...data, code: 2, error: "Player already in a room"}); return; }
                }

                this.rooms[data.room].push(data.playerName); /* TODO: replace room by class Room */
                callback({...data, code: 0, players: this.rooms[data.room]}); /* TODO: replace room by class Room */
            });

            socket.on('ASK_INFORMATIONS_GAME_PAGE', (data, callback) => {
                console.log("ASK INFORMATIONS GAME PAGE", data);
                if (!this.rooms[data.room]) { callback({...data, code: 1, error: "Room does not exist"}); return; } /* TODO: replace room by class Room */
                if (!this.rooms[data.room].includes(data.playerName)) { callback({...data, code: 2, error: "Player not in the room"}); return; } /* TODO: replace room by class Room */

                /* Pour chaque user, envoyer l'event USER_JOIN_ROOM */
                for (const player of this.rooms[data.room]) { /* TODO: replace room by class Room */
                    const playerSocket = this.players.find(p => p.username === player).socket;
                    playerSocket.emit('USER_JOIN_ROOM', {...data, players: this.rooms[data.room], creator: this.rooms[data.room][0]}); /* TODO: replace room by class Room */
                }

                callback({...data, code: 0, players: this.rooms[data.room], creator: this.rooms[data.room][0]}); /* TODO: replace room by class Room */
            });

            socket.on('PLAYER_LEFT_GAME_PAGE', (data) => {
                console.log('PLAYER LEFT GAME PAGE', data);
                if (!this.rooms[data.room]) { return; } /* TODO: replace room by class Room */
                this.rooms[data.room] = this.rooms[data.room].filter(player => player !== data.playerName); /* TODO: replace room by class Room */
                if (this.rooms[data.room].length === 0) { delete this.rooms[data.room]; return; } /* TODO: replace room by class Room */

                for (const player of this.rooms[data.room]) { /* TODO: replace room by class Room */
                    const playerSocket = this.players.find(p => p.username === player).socket;
                    playerSocket.emit('USER_LEAVE_ROOM', {...data, creator: this.rooms[data.room][0]}); /* TODO: replace room by class Room */
                }
            });

        });
    }

    readDatabase() {
        const data = fs.readFileSync(this.DATABASE_FILE, 'utf8');
        return JSON.parse(data);
    }

    writeDatabase(data) {
        fs.writeFileSync(this.DATABASE_FILE, JSON.stringify(data, null, 2), 'utf8');
    }

}

module.exports = Server;