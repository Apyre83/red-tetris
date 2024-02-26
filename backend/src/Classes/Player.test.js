const Player = require('./Player'); 
const { ROWS, BORDER_WIDTH, COLS, INIT_TIME_MS } = require('../constants/numbers'); 
const colors = require('../constants/colors'); 

jest.mock('./Piece', () => {
    return jest.fn().mockImplementation(() => {
        return {
        };
    });
});

describe('Player', () => {
    let player;
    let mockSocket = {}; 
    const playerName = 'TestPlayer';
    const database = {}; 

    beforeEach(() => {
        player = new Player(mockSocket, playerName, database);
    });

    test('constructor initializes properties correctly', () => {
        expect(player.socket).toBe(mockSocket);
        expect(player.playerName).toBe(playerName);
        expect(player.database).toBe(database);
        expect(player.ranking).toBe(0);
        expect(player.listOfPieces).toEqual([]);
        expect(player.game).toBeUndefined();
        expect(player.isPlaying).toBe(false);
        expect(player.idRowBorder).toBe(ROWS);
        expect(player.idActualPiece).toBe(-1);
        expect(player.actualPiece).toBeUndefined();
        expect(player.actualScore).toBe(0);
        expect(player.board).toHaveLength(ROWS + 1);
    });

    test('createEmptyRow creates a row with the correct structure', () => {
        const expectedRowLength = BORDER_WIDTH * 2 + COLS;
        const emptyRow = player.createEmptyRow();
        expect(emptyRow.length).toBe(expectedRowLength);
        expect(emptyRow[0]).toEqual([1, colors.border]);
        expect(emptyRow[BORDER_WIDTH]).toEqual([0, colors.empty]);
    });
});

describe('Player.startGame', () => {
    let player;
    const mockSocket = { emit: jest.fn() };
    const playerName = 'TestPlayer';
    const database = {};

    beforeEach(() => {
        jest.useFakeTimers();
        const Player = require('./Player'); 
        const gameMock = { listOfPieces: [0, 1, 2, 3] }; 
        player = new Player(mockSocket, playerName, database);
        player.game = gameMock;
        player.generateNewPiece = jest.fn();
        player.moveDown = jest.fn();
        player.doubleCheckPenalty = jest.fn();
        player.isPlaying = true;

        player.startGame();
    });

    afterEach(() => {
        jest.runOnlyPendingTimers(); 
        jest.useRealTimers(); 
      });

    test('should set listOfPieces from game and call generateNewPiece', () => {
        expect(player.listOfPieces).toEqual([0, 1, 2, 3]);
        expect(player.generateNewPiece).toHaveBeenCalled();
    });

    test('should call moveDown and doubleCheckPenalty periodically', () => {
        jest.advanceTimersByTime(INIT_TIME_MS);
        expect(player.moveDown).toHaveBeenCalled();
        expect(player.doubleCheckPenalty).toHaveBeenCalled();
    });

    test('should clear interval when isPlaying is false', () => {
        player.isPlaying = false;
        jest.advanceTimersByTime(INIT_TIME_MS);
        expect(player.moveDown).not.toHaveBeenCalledTimes(2);
    });
    
});

describe('generateNewPiece', () => {
    let player;
    const mockSocket = {};
    const playerName = 'TestPlayer';
    const database = {};

    beforeEach(() => {
        jest.clearAllMocks(); 
        const Player = require('./Player');
        player = new Player(mockSocket, playerName, database);
        player.listOfPieces = [1, 4, 1, 2, 1, 2, 5,
                2, 6, 3, 3, 5, 4, 2, 0, 6, 4, 5,
                4, 0, 1, 3, 4, 4, 3, 6, 6, 5, 0, 0,
                4, 1, 0, 4];
        player.gameOver = jest.fn(); 
        player.updateBoard = jest.fn(); 
    });

    test('should cycle through listOfPieces and reset to 0', () => {
        player.idActualPiece = player.listOfPieces.length - 1; 
        player.generateNewPiece();
        expect(player.idActualPiece).toBe(0); 
    });

    test('should increment idActualPiece if not at the end', () => {
        player.idActualPiece = 0; 
        player.generateNewPiece();
        expect(player.idActualPiece).toBe(1); 
    });

    test('should call gameOver if a piece is at the spawning area', () => {
        player.board[3][BORDER_WIDTH][0] = 1; 
        player.generateNewPiece();
        expect(player.gameOver).toHaveBeenCalled(); 
    });

    test('should update the board with the new piece', () => {
        player.idActualPiece = 0; 
        player.generateNewPiece();
        expect(player.updateBoard).toHaveBeenCalled(); 
    });

});

jest.mock('./Piece', () => {
    return jest.fn().mockImplementation((id) => {
        return {
            width: 2, 
            tetromino: [
                [[1, 'color'], [1, 'color']], 
                [[0, ''], [0, '']]
            ],
            y: 0,
            x: 1, 
        };
    });
});

describe('generateNewPiece - board update', () => {
    let player;
    const mockSocket = {};
    const playerName = 'TestPlayer';
    const database = {};

    beforeEach(() => {
        jest.clearAllMocks();
        const Player = require('./Player');
        player = new Player(mockSocket, playerName, database);
        player.createBoard = jest.fn(() => Array(ROWS + 1).fill().map(() => Array(COLS + 2 * BORDER_WIDTH).fill([0, '']))); 
        player.board = player.createBoard(); 
        player.listOfPieces = [0]; 
    });

    test('should update the board with the tetromino shape', () => {
        player.generateNewPiece(); 
        expect(player.board[player.actualPiece.y][player.actualPiece.x + 0]).toEqual([1, 'color']);
        expect(player.board[player.actualPiece.y][player.actualPiece.x + 1]).toEqual([1, 'color']);
    });
});
