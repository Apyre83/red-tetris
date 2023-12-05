const http = require('http');
const express = require('express');
const { Server: IOServer } = require('socket.io');
const fs = require('fs');
const path = require('path');
const Player = require('./Player');
const Game = require('./Game');

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
        this.games = []; /* TODO */
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
                for (const _game of this.games) {

                }
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
                    if (player.socket.id === socket.id) { player.name = data.username; }
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

                // const player = new Player; ?
                for (const player of this.players) {
                    if (player.socket.id === socket.id) { player.name = data.username; }
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

                for (const game of this.games) {
                    if (game.name === data.game) { callback({...data, code: 1, error: "Game already exists"}); return; }
                    if (game.players.includes(data.playerName)) { callback({...data, code: 2, error: "Player already in a game"}); return; }
                }

                const gameMaster = this.players.find(player => player.name === data.playerName);

                const newGame = new Game(this, data.gameName, gameMaster);
                this.games.push(newGame);

                callback({...data, code: 0});
            });

            socket.on('JOIN_GAME', (data, callback) => {
                console.log('JOIN_GAME', data);
                const _game = this.games.find(game => game.name === data.game);
                if (!_game) { callback({...data, code: 1, error: "Game does not exist"}); return; }
                if (_game.players.includes(data.playerName)) { callback({...data, code: 2, error: "Player already in a game"}); return; }

                const _player = this.players.find(player => player.name === data.playerName);
                if (!_player) { callback({...data, code: 3, error: "Player does not exist"}); return; }

                _game.addPlayer(_player)
                callback({...data, code: 0});
            });

            socket.on('ASK_INFORMATIONS_GAME_PAGE', (data, callback) => {
                console.log("ASK INFORMATIONS GAME PAGE", data);

                const _game = this.games.find(game => game.name === data.game);
                if (!_game) { callback({...data, code: 1, error: "Game does not exist"}); return; }
                if (!_game.hasPlayer(data.playerName)) { callback({...data, code: 2, error: "Player not in the game"}); return; }

                for (const player of _game.players) {
                    player.socket.emit('USER_JOIN_ROOM', {...data, players: _game.getNames(), creator: _game.players[0].name});
                }
                callback({...data, code: 0, players: _game.getNames(), creator: _game.players[0].name});
            });

            socket.on('START_GAME', (data) => {
                const _game = this.games.find(game => game.name === data.game);
                if (!_game) { return; }

                for (player of _game.players) {
                    player.startGame();
                }
            })

            socket.on('MOVEMENT', (data) => {
                const _player = this.players.find(player => player.name === data.playerName);
                if (!_player) { callback({...data, code: 3, error: "Player does not exist"}); return; }
                if (!_player.isInGame) { callback({...data, code: 4, error: "Player not playing"}); return;}
                // TODO movement has to be moveLeft || moveRight || moveDown ||  directBottom || rotateLeft || rotateRight
                _player[data.movement]();
            })

            socket.on('PLAYER_LEFT_GAME_PAGE', (data) => {
                console.log('PLAYER LEFT GAME PAGE', data);
                const _game = this.games.find(game => game.name === data.game);
                if (!_game) { return; }
                _game.removePlayer(data.playerName);
                if (_game.players.length === 0) { this.closeGame(_game.name); return; }

                for (const player of _game.players) {
                    console.log('PLAYER', player.name);
                    player.socket.emit('USER_LEAVE_ROOM', {...data, creator: _game.players[0].name});
                }
            });

        });
    }

    closeGame(gameName) {
        this.games = this.games.filter(game => game.name !== gameName);
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