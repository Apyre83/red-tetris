const { NB_PIECES, LIST_OF_PIECES_SIZE }      = require('../constants/numbers');
const Game = require('./Game');
const Player = require('./Player');
const Server = require('./Server');

describe ('Game class', () => {
    describe('constructor', () => {
        test('should throw an error if server is not an object', () => {
            expect(() => new Game('server', 'gameName')).toThrow('Server must be an object');
            expect(() => new Game(new Server(3000), 'gameName')).not.toThrow();
        })
    })
});