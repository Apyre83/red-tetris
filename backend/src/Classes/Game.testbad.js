// const { NB_PIECES, LIST_OF_PIECES_SIZE } = require('../constants/numbers');
// const Game = require('./Game');
// const Player = require('./Player');
// const MyServer = require('./Server');
// const fs = require('fs');

// const { createServer } = require("node:http");
// const { Server } = require("socket.io");
// const ioc = require("socket.io-client");

// jest.useFakeTimers();
// jest.spyOn(global, 'setTimeout');

// function readDatabase() {
//     const data = fs.readFileSync('./databases/database.json', 'utf8');
//     return JSON.parse(data);
// }


// describe('Game class', () => {
//     let io, serverSocket, clientSocket;

//     beforeAll((done) => {
//         const httpServer = createServer();
//         io = new Server(httpServer);
//         httpServer.listen(() => {
//           const port = httpServer.address().port;
//           clientSocket = ioc(`http://localhost:${port}`);
//           io.on("connection", (socket) => {
//             serverSocket = socket;
//           });
//           clientSocket.on("connect", done);
//         });
//     });

//     afterAll(() => {
//         io.close();
//         clientSocket.disconnect();
//     });

//     describe('constructor', () => {
//         test('should throw an error if server is not an object', () => {
//             expect(() => new Game('server', 'gameName')).toThrow('Server must be an object');
//             expect(() => new Game(new MyServer(3000), 'gameName')).not.toThrow();
//             });
//     });

//     describe('startGame method', () => {
//         test('should throw an error if there is no player in the game', () => {
//             const game = new Game(new MyServer(3000), 'gameName');
//             expect(() => game.startGame()).toThrow('No player in the game');
//         });
//         test('should start the game', () => {
//             const game = new Game(new MyServer(3000), 'gameName');
//             const player = new Player(clientSocket, 'playerName', readDatabase());
//             game.players.push(player);
//             game.startGame();
//             expect(game.gameIsRunning).toBe(true);
//         });
//     });
// });
