const Player = require('./Player');
const Game   = require('./Game');
const Server = require('./Server');
const Socket = require('socket.io-client');

describe('Piece class', () => {
    const server = new Server(8080);
    const game = new Game(server, 'gameName');
    const socket = new Socket('http://localhost:3000');
    const player = new Player(socket, 'playerName', 'database');
    describe('constructor', () => {
        test('should throw an error if isPlaying is true', () => {  
            expect(player.isPlaying).toBe(false);
        });
    });
    describe('player methods', () => {
        test('startGame', () => {
            player.startGame();
            expect(player.isPlaying).toBe(true);
        })
    });
});