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
                origin:"*",
                methods: ["GET", "POST"],
                allowedHeaders: ["my-custom-header"],
                credentials: true
            }
        });
        this.port = port;
        this.games = [];
        this.players = [];

        this.DATABASE_FILE = './databases/database.json';
    }

    start() {
        this.configureApp();
        this.handleSocketConnections();
        this.server.listen(this.port, () => {
            console.log(`server running at http://localhost:${this.port}`);
        });
    }

    configureApp() {
        this.app.use(express.json());
        this.app.use(express.static(path.join(__dirname, 'public')));
    }

    handleSocketConnections() {
        this.io.on('connection', (socket) => {
            this.players.push(new Player(socket, '', this.readDatabase())); /* '' is the username but since the user is not logged in yet, it is empty */

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

                // if players already connected cannot login
                for (const player of this.players) {
                    if (player.playerName === data.username) { callback({...data, code: 3, error: "Player already connected"}); return; }
                }

                /* Change the username of the player */
                for (const player of this.players) {
                    if (player.socket.id === socket.id) {
                        player.playerName = data.username;
                    }
                }
                callback({...data, code: 0});
            });

            socket.on('LOGOUT', (data, callback) => {
                console.log('LOGOUT', data);
                for (const player of this.players) {
                    if (player.socket.id === socket.id) {
                        player.playerName = '';
                    }
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

                // TODO: password hashing
                database[data.username] = {
                    password: data.password,
                    email: data.email,
                    allTimeScores: 0,
                };
                this.writeDatabase(database);

                callback({...data, code: 0});
            });

            socket.on('GET_SCORE', (data, callback) => {
                console.log('GET_SCORE', data);
                const database = this.readDatabase();
                if (!database[data.playerName]) { callback({...data, code: 1, error: "Player does not exist"}); return; }
                callback({...data, code: 0, score: database[data.playerName].allTimeScores});
            });

            socket.on('CREATE_GAME', (data, callback) => {
                console.log('CREATE GAME', data);

                for (const game of this.games) {
                    if (game.gameName === data.gameName) { callback({...data, code: 1, error: "Game already exists"}); return; }
                    if (game.hasPlayer(data.playerName)) { callback({...data, code: 2, error: "Can't create game : Player already in this game"}); return; }
                }
                const newGame = new Game(this, data.gameName);
                this.games.push(newGame);

                callback({...data, code: 0});
            });

            socket.on('JOIN_GAME', (data, callback) => {
                console.log('JOIN_GAME', data);
                const _game = this.games.find(game => game.gameName === data.gameName);
                if (!_game) { callback({...data, code: 1, error: "Game does not exist"}); return; }
                if (_game.players.includes(data.playerName)) { callback({...data, code: 2, error: "Player already in this game"}); return; }
                
                const _player = this.players.find(player => player.playerName === data.playerName);
                if (!_player) { callback({...data, code: 3, error: "Player does not exist"}); return; }

                console.log("ADD PLAYER: ", _player.playerName, _player.socket.id);

                _game.addPlayer(_player, (callback_add) => {
                    if (callback_add.code === 1) {
                        console.log(`Error game running cannot join`);
                        callback({...data, code: 4, error: "Game is already running, wait until it's finished"});
                    }
                })
                callback({...data, code: 0});
            });

            socket.on('ASK_INFORMATIONS_GAME_PAGE', (data, callback) => {
                console.log("ASK INFORMATIONS GAME PAGE", data);

                const _game = this.games.find(game => game.gameName === data.gameName);
                if (!_game) { callback({...data, code: 1, error: "Game does not exist"}); return; }
                if (!_game.hasPlayer(data.playerName)) { callback({...data, code: 2, error: "Player not in the game"}); return; }

                console.log("--------------");
                for (const player of _game.players) {
                    console.log(`PLAYER ${player.playerName} --> ${player.socket.id}`);
                }
                console.log(data);
                console.log(" ");

                for (const player of _game.players) {
                    console.log(`PLAYER ${player.playerName} --> ${player.socket.id}`);
                    player.socket.emit('USER_JOIN_GAME', {...data, players: _game.getNames(), creator: _game.players[0].playerName});
                }
                callback({...data, code: 0, players: _game.getNames(), creator: _game.players[0].playerName});
            });

            socket.on('START_GAME', (data, callback) => {
                const _game = this.games.find(game => game.gameName === data.gameName);
                if (!_game) { callback({...data, code: 1, error: "Game does not exist"}); return; }
                if (_game.players[0].playerName !== data.playerName) { callback({...data, code: 2, error: "Only the creator can start the game"}); return; }

                _game.startGame();

                for (let i = 0; i < _game.players.length; i++) {
                    const leftPlayerIndex = (i - 1 + _game.players.length) % _game.players.length;
                    const rightPlayerIndex = (i + 1) % _game.players.length;

                    const leftPlayerName = _game.players[leftPlayerIndex].playerName;
                    const rightPlayerName = _game.players[rightPlayerIndex].playerName;

                    _game.players[i].socket.emit('GAME_STARTED', {
                        ...data,
                        leftPlayerName: leftPlayerName,
                        rightPlayerName: rightPlayerName
                    });
                }
                callback({...data, code: 0});
            })

            socket.on('MOVEMENT', (data, callback) => {
                console.log('MOVEMENT', data);
                const _player = this.players.find(player => player.playerName === data.playerName);
                if (!_player) { callback({...data, code: 3, error: "Player does not exist"}); return; }
                if (_player.isPlaying === false) { callback({...data, code: 4, error: "Player not playing"}); return;}
                _player[data.movement]();
                callback({...data, code: 0});
            })

            socket.on('PLAYER_LEAVE_ROOM', (data, callback) => {
                console.log('PLAYER LEAVE ROOM', data);

                const _game = this.games.find(game => game.gameName === data.gameName);
                if (!_game) { callback({...data, code: 1, error: "Game does not exist"}); return; }

                const gamePlayer = _game.players.find(player => player.playerName === data.playerName);
				if (!gamePlayer) { callback({...data, code: 2, error: "Player does not exist"}); return; }

                _game.removePlayer(gamePlayer);

                if (_game.players.length === 0) {
                    this.closeGame(_game.gameName);
                }
				else {
					for (const player of _game.players) {
						player.socket.emit('USER_LEAVE_GAME', {playerName: data.playerName, creator: _game.players[0].playerName});
					}
				}
				callback({...data, code: 0});
            });

            socket.on('PLAYER_GIVE_UP', (data, callback) => {
                console.log('PLAYER GIVE UP', data);

                const _game = this.games.find(game => game.gameName === data.gameName);
				if (!_game) { callback({...data, code: 1, error: "Game does not exist"}); return; }

                const gamePlayer = _game.players.find(player => player.playerName === data.playerName);
				if (!gamePlayer) { callback({...data, code: 2, error: "Player does not exist"}); return; }
                let result = gamePlayer.giveUp();
				callback({...data, code: 0, ...result});
            })

        });
    }

    closeGame(gameName) {
        this.games = this.games.filter(game => game.gameName !== gameName);
        console.log(`Closing game ${gameName}, there is ${this.games.length} game(s) running`);
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
