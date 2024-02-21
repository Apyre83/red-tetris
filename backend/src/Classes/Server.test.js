const Server = require('./Server');
const ioClient = require('socket.io-client');
const Player = require('./Player');
const e = require('express');
const Game = require('./Game');

describe('Server', () => {
    let server;
    const port = 8080;
    let clientSocket;

    beforeAll((done) => {
        server = new Server(port);
        server.start();
        done();
    });

    afterAll((done) => {
        server.server.close();
        done();
    });

    beforeEach((done) => {
        clientSocket = ioClient(`http://localhost:${port}`, {
            transports: ['websocket'],
            'force new connection': true
        });
        clientSocket.on('connect', done);
    });

    afterEach((done) => {
        if (clientSocket.connected) {
            clientSocket.disconnect();
        }
        jest.restoreAllMocks();
        done();
    });

    test('should handle disconnect event', (done) => {
        const playersBefore = server.players.length;

        clientSocket.on('disconnect', () => {
        });

        clientSocket.disconnect();

        setTimeout(() => {
            expect(server.players.length).toBe(playersBefore - 1);
            done();
        }, 100);
    });

    test('LOGIN event with valid credentials should succeed', (done) => {
        jest.spyOn(server, 'readDatabase').mockReturnValue({
            'testUser': { password: 'testPassword' }
        });

        clientSocket.emit('LOGIN', { username: 'testUser', password: 'testPassword' }, (response) => {
            expect(response.code).toBe(0);
            done();
        });
    });

    test('LOGIN event with incorrect password should fail', (done) => {
        jest.spyOn(server, 'readDatabase').mockReturnValue({
            'testUser': { password: 'testPassword' }
        });

        clientSocket.emit('LOGIN', { username: 'testUser', password: 'wrongPassword' }, (response) => {
            expect(response.code).toBe(2);
            done();
        });
    });

    test('LOGIN event with non-existing username should fail', (done) => {
        jest.spyOn(server, 'readDatabase').mockReturnValue({});

        clientSocket.emit('LOGIN', { username: 'nonExistingUser', password: 'testPassword' }, (response) => {
            expect(response.code).toBe(1);
            done();
        });
    });

    test('LOGOUT event should clear username for the disconnected player', (done) => {
        const testSocketId = clientSocket.id;
        const testUsername = 'testUser2';
        server.players.push({ socket: { id: testSocketId }, playerName: testUsername });
    
        expect(server.players.some(player => player.playerName === testUsername)).toBe(true);
    
        clientSocket.emit('LOGOUT', {}, () => {
            const player = server.players.find(player => player.socket.id === testSocketId);
            expect(player.playerName).toBe('');
            done();
        });

    });

    test('should successfully register a new user', (done) => {
        jest.spyOn(server, 'readDatabase').mockReturnValue({});
        const writeDbSpy = jest.spyOn(server, 'writeDatabase').mockImplementation(() => {});

        clientSocket.emit('SIGNUP', { username: 'newUser', password: 'newPassword', email: 'newEmail@example.com' }, (response) => {
            expect(response.code).toBe(0); 
            expect(writeDbSpy).toHaveBeenCalled();
            done();
        });
    });

    test('should fail if the username already exists', (done) => {
        jest.spyOn(server, 'readDatabase').mockReturnValue({
            'newUser': { password: 'newPassword', email: 'newEmail@example.com' }
        });

        clientSocket.emit('SIGNUP', { username: 'newUser', password: 'newPassword', email: 'anotherEmail@example.com' }, (response) => {
            expect(response.code).toBe(1); 
            done();
        });
    });

    test('GET_SCORE event should return the correct score for an existing player', (done) => {
        const testPlayerName = 'existingUser';
        const testScore = 100;
    
        jest.spyOn(server, 'readDatabase').mockReturnValue({
            [testPlayerName]: { allTimeScores: testScore }
        });
    
        clientSocket.emit('GET_SCORE', { playerName: testPlayerName }, response => {
            expect(response.code).toBe(0);
            expect(response.score).toBe(testScore);
            done();
        });
    });

    test('CREATE_GAME event should create a new game', (done) => {
        const gameName = 'testGame';
        clientSocket.emit('CREATE_GAME', { gameName }, (response) => {
            expect(response.code).toBe(0);
            done();
        })
    });

    test('CREATE_GAME event should return errors', (done) => {
        const newGame = new Game(server, 'testGame');
        const gameCreator = 'creatorName';
        const newPlayer = new Player('', gameCreator, '');

    
        server.games.push(newGame);
        newGame.addPlayer(newPlayer, () => {});

        const gameName = 'testGame';

        clientSocket.emit('CREATE_GAME', { gameName: gameName }, (response) => {
            expect(response.code).toBe(1);
        })

        clientSocket.emit('CREATE_GAME', { gameName: 'validGameName', playerName: gameCreator }, (response) => {
            expect(response.code).toBe(2);
            done();
        })

    });

    test('JOIN_GAME event should let a player join an existing game', done => {
        const gameName = 'TestGame';
        const playerName = 'TestPlayer';
        const playerSocketId = clientSocket.id;
    
        server.games.push(new Game(server, gameName));
        server.players.push(new Player({id: playerSocketId}, playerName, {}));
    
        clientSocket.emit('JOIN_GAME', { gameName: gameName, playerName: playerName }, (response) => {
            expect(response.code).toBe(0);
            const game = server.games.find(g => g.gameName === gameName);
            expect(game.players.some(p => p.playerName === playerName)).toBe(true);
            done();
        });
    });
    
    test('JOIN_GAME event should not allow joining a running game', done => {
        const gameName = 'RunningGame';
        const playerName = 'TestPlayer';
        const playerSocketId = clientSocket.id;
    
        const newGame = new Game(server, gameName);
        server.games.push(newGame);
    
        newGame.gameIsRunning = true;
    
        server.players.push(new Player({id: playerSocketId}, playerName, {}));
    
        clientSocket.emit('JOIN_GAME', { gameName: gameName, playerName: playerName }, response => {
            expect(response.code).toBe(4);
            done();
        });
    });
    
    test('ASK_INFORMATIONS_GAME_PAGE event should return game details for a player in the game', (done) => {
        const gameName = 'ExistingGame';
        const playerName = 'PlayerInGame';
    
        const newGame = new Game(server, gameName);
        server.games.push(newGame);
    
        const newPlayer = new Player(clientSocket, playerName, {});
        server.players.push(newPlayer);
        newGame.addPlayer(newPlayer, () => {});
    
        jest.spyOn(newGame, 'getNames').mockReturnValue([playerName]);
    
        clientSocket.emit('ASK_INFORMATIONS_GAME_PAGE', { gameName: gameName, playerName: playerName }, response => {
            expect(response.code).toBe(0);
            expect(response.players).toContain(playerName);
            expect(response.creator).toBe(playerName); 
    
            done();
        });
    });

    test('START_GAME event should start the game if initiated by the creator', done => {
        const gameName = 'GameToStart';
        const creatorName = 'CreatorPlayer';
    
        const newGame = new Game(server, gameName);
        server.games.push(newGame);

        const creatorPlayer = new Player(clientSocket, creatorName, {});        server.players.push(creatorPlayer);
        newGame.addPlayer(creatorPlayer, () => {});

        jest.spyOn(newGame, 'startGame').mockImplementation(() => {
            newGame.gameIsRunning = true; 
        });
    
        // faire un seul client !
        clientSocket.emit('START_GAME', { gameName: gameName, playerName: creatorName }, (response) => {
            expect(game.players.length).toBe(1);
            
            // expect(response.code).toBe(0);
        //     expect(newGame.gameIsRunning).toBe(true);
        //     expect(newGame.startGame).toHaveBeenCalled();
    
            done();
        });
        done();
    });
    
    

    
});
