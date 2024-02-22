const Game = require('./Game');
const Player = require('./Player');

jest.mock('./Player', () => {
    return jest.fn().mockImplementation(() => {
        return {
            winner: jest.fn(),
            startGame: jest.fn(),
            isPlaying: false,
            listOfPieces: [],
            game: null
        };
    });
});

describe('Game', () => {
    let serverMock, game, playerMock;

    beforeEach(() => {
        serverMock = {};
        game = new Game(serverMock, "TestGame");
    });

    test('should create a game instance correctly', () => {
        expect(game).toBeInstanceOf(Game);
        expect(game.gameName).toBe("TestGame");
        expect(game.gameIsRunning).toBe(false);
    });

    test('should generate list of pieces correctly', () => {
        const listOfPieces = game.generateListOfPieces();
        expect(listOfPieces.length).toBe(require('../constants/numbers').LIST_OF_PIECES_SIZE);
        listOfPieces.forEach(piece => {
            expect(piece).toBeGreaterThanOrEqual(0);
            expect(piece).toBeLessThanOrEqual(require('../constants/numbers').NB_PIECES - 1);
        });
    });

    test('should start game with one player', () => {
        const playerMock = new Player();
        game.players.push(playerMock); 
        game.startGame();
        expect(game.gameIsRunning).toBe(true);
        expect(game.rank).toBe(1);
        expect(game.alivePlayers.length).toBe(1);
        expect(playerMock.startGame).toHaveBeenCalled();
    });

    test('should add player to game if game is not running', () => {
        let mockCallback;
        mockCallback = jest.fn();
        const player = { playerName: 'Riri' };
        
        game.addPlayer(player, mockCallback);
        
        expect(game.players).toContain(player);
        expect(mockCallback).toHaveBeenCalledWith({ code: 0 });
    });

    test('should not add player and return error if game is already running', () => {
        let mockCallback;
        mockCallback = jest.fn();
        const player = { playerName: 'Fifi' }; 
        game.gameIsRunning = true;
        
        game.addPlayer(player, mockCallback);
        
        expect(game.players).not.toContain(player);
        expect(mockCallback).toHaveBeenCalledWith({ code: 1, error: "Game is already running" });
    });

    test('should reset the game correctly', () => {
        playerMock = new Player();
        game.players.push(playerMock); 
        game.startGame(); 
        game.resetGame(); 

        expect(game.gameIsRunning).toBe(false);
        expect(game.rank).toBe(0);
        expect(game.scores).toEqual({});
        expect(game.alivePlayers).toEqual([]);
        expect(game.listOfPieces.length).toBe(require('../constants/numbers').LIST_OF_PIECES_SIZE);
        game.listOfPieces.forEach(piece => {
            expect(piece).toBeGreaterThanOrEqual(0);
            expect(piece).toBeLessThanOrEqual(require('../constants/numbers').NB_PIECES - 1);
        });
    });

    test('returns correct score for rank', () => {
        game.scores = {1: 100, 2: 50, 3: 25};
        expect(game.giveScore(1)).toBe(100);
        expect(game.giveScore(2)).toBe(50);
        expect(game.giveScore(3)).toBe(25);
        expect(game.giveScore(4)).toBe(0);
    });

    test('applies penalty to all players except the one who sent it', () => {
        let playerMock1, playerMock2;
        playerMock1 = { playerName: 'Player1', penalty: jest.fn() };
        playerMock2 = { playerName: 'Player2', penalty: jest.fn() };
        game.alivePlayers.push(playerMock1, playerMock2);
        game.penalty('Player1', 2);
        expect(playerMock1.penalty).not.toHaveBeenCalled();
        expect(playerMock2.penalty).toHaveBeenCalledWith(2);
    });

    test('sends spectrum to all players except the one who sent it', () => {
        let playerMock1, playerMock2;
        playerMock1 = { playerName: 'Player1', socket: { emit: jest.fn() } };
        playerMock2 = { playerName: 'Player2', socket: { emit: jest.fn() } };
        game.alivePlayers.push(playerMock1, playerMock2);
        const spectrum = [1, 2, 3];
        game.sendSpectrum('Player1', spectrum);
        expect(playerMock1.socket.emit).not.toHaveBeenCalled();
        expect(playerMock2.socket.emit).toHaveBeenCalledWith('UPDATE_SPECTRUM', { spectrum, playerName: 'Player1' });
    });

    test('returns true if player is in the game', () => {
        game.players = [{ playerName: 'Riri' }, { playerName: 'Fifi' }];
        expect(game.hasPlayer('Riri')).toBe(true);
    });

    test('returns false if player is not in the game', () => {
        game.players = [{ playerName: 'Riri' }, { playerName: 'Fifi' }];
        expect(game.hasPlayer('Charlie')).toBe(false);
    });

    test('returns names of all players', () => {
        game.players = [{ playerName: 'Riri' }, { playerName: 'Fifi' }];
        expect(game.getNames()).toEqual(['Riri', 'Fifi']);
    });

    test('playerGameOver decreases rank and calls playerFinishedGame', () => {
        game.rank = 3;
        player = { playerName: 'Riri' };
        game.playerFinishedGame = jest.fn();
        game.playerGameOver(player);
        expect(game.rank).toBe(2);
        expect(game.playerFinishedGame).toHaveBeenCalledWith(player);
    });

    test('playerGiveUp decreases rank and calls playerFinishedGame', () => {
        game.rank = 3; 
        player = { playerName: 'Riri' };
        game.playerFinishedGame = jest.fn();
        game.playerGiveUp(player);
        expect(game.rank).toBe(2);
        expect(game.playerFinishedGame).toHaveBeenCalledWith(player);
    });

    test('updates player score and modifies alive players list', () => {
        serverMock = {
            readDatabase: jest.fn().mockReturnValue({ "Riri": { allTimeScores: 0 } }),
            writeDatabase: jest.fn()
        };
        game = new Game(serverMock, "TestGame");
        playerMock = { playerName: 'Riri', isPlaying: true, actualScore: 100, resetPlayer: jest.fn() };
        game.alivePlayers = [playerMock];
        game.checkIfSomeoneIsAlive = jest.fn();
        game.playerFinishedGame(playerMock);
        expect(serverMock.readDatabase).toHaveBeenCalled();
        expect(serverMock.writeDatabase).toHaveBeenCalled();
        expect(game.alivePlayers).toEqual([]);
        expect(playerMock.resetPlayer).toHaveBeenCalled();
        expect(game.checkIfSomeoneIsAlive).toHaveBeenCalled();
    });

    test('removes player from game and resets it', () => {
        playerMock = { playerName: 'Riri', resetPlayer: jest.fn() };
        game.players = [playerMock];
        game.removePlayer(playerMock);
        expect(game.players).toEqual([]);
        expect(playerMock.resetPlayer).toHaveBeenCalled();
    });

    test('calls winner if one player is alive', () => {
        serverMock = { closeGame: jest.fn() };
        game = new Game(serverMock, "TestGame");
        game.resetGame = jest.fn();
        game.winner = jest.fn();
        game.alivePlayers = [{ playerName: 'Riri' }];
        game.checkIfSomeoneIsAlive();
        expect(game.winner).toHaveBeenCalled();
    });

    test('resets game if no one is alive and players are still in the game', () => {
        serverMock = { closeGame: jest.fn() };
        game = new Game(serverMock, "TestGame");
        game.resetGame = jest.fn();
        game.winner = jest.fn();
        game.alivePlayers = [];
        game.players = [{ playerName: 'Riri' }, { playerName: 'Fifi' }];
        game.checkIfSomeoneIsAlive();
        expect(game.resetGame).toHaveBeenCalledTimes(2);
    });

    test('closes game if no one is alive and no players are in the game', () => {
        serverMock = { closeGame: jest.fn() };
        game = new Game(serverMock, "TestGame");
        game.resetGame = jest.fn();
        game.winner = jest.fn();
        game.alivePlayers = [];
        game.players = [];
        game.checkIfSomeoneIsAlive();
        expect(serverMock.closeGame).toHaveBeenCalledWith(game.gameName);
    });

    test('emits PLAYER_WINNER when no players are alive', () => {
        playerMock1 = { playerName: 'Player1', socket: { emit: jest.fn() } };
        playerMock2 = { playerName: 'Player2', socket: { emit: jest.fn() } };
        game.players.push(playerMock1, playerMock2);
        game.alivePlayers = [];
        game.checkIfSomeoneIsAlive();
        expect(playerMock1.socket.emit).toHaveBeenCalledWith('PLAYER_WINNER');
        expect(playerMock2.socket.emit).toHaveBeenCalledWith('PLAYER_WINNER');
    });

    test('correctly handles winner', () => {
        let playerWinnerMock;
        
        mockServer = { closeGame: jest.fn(), readDatabase: jest.fn(), writeDatabase: jest.fn() };
        game = new Game(mockServer, "TestGame");
        playerWinnerMock = { playerName: 'Winner', actualScore: 100, winner: jest.fn(), socket: { emit: jest.fn() } };
        playerMock = { playerName: 'Player', socket: { emit: jest.fn() } };

        game.alivePlayers.push(playerWinnerMock);
        game.players.push(playerWinnerMock, playerMock);
        game.playerFinishedGame = jest.fn();
        game.resetGame = jest.fn();

        game.winner();
        expect(playerWinnerMock.winner).toHaveBeenCalled();
        expect(playerWinnerMock.socket.emit).toHaveBeenCalledWith('PLAYER_WINNER', expect.objectContaining({
            playerName: 'Winner',
            rank: 1,
            score: 100
        }));
        expect(playerMock.socket.emit).toHaveBeenCalledWith('PLAYER_WINNER', expect.objectContaining({
            playerName: 'Winner',
            rank: 1,
            score: 100
        }));

        expect(game.playerFinishedGame).toHaveBeenCalledWith(playerWinnerMock);
        expect(game.resetGame).toHaveBeenCalled();
    });
});

