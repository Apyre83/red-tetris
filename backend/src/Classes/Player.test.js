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

describe('penalty', () => {
    let player;
    const mockSocket = {};
    const playerName = 'TestPlayer';
    const database = {};
    const BORDER_WIDTH = 1; 
    const COLS = 10;

    beforeEach(() => {
        jest.clearAllMocks();
        const Player = require('./Player');
        player = new Player(mockSocket, playerName, database);
        player.idRowBorder = ROWS;
        player.gameOver = jest.fn();
        player.updateBoard = jest.fn();
        player.board = Array(ROWS + 1).fill().map(() => Array(COLS + 2 * BORDER_WIDTH).fill([0, 'empty']));
    });

    test('should decrement idRowBorder correctly', () => {
        const nbLines = 2;
        const initialIdRowBorder = player.idRowBorder;
        player.penalty(nbLines);
        expect(player.idRowBorder).toBe(initialIdRowBorder - nbLines);
    });

    test('should call gameOver when idRowBorder reaches 3', () => {
        player.idRowBorder = 4;
        player.penalty(1);
        expect(player.gameOver).toHaveBeenCalled();
    });

    test('should update the board with border blocks', () => {
        player.idRowBorder = ROWS;
        const nbLines = 1;
        player.penalty(nbLines);
        expect(player.idRowBorder).toBe(ROWS - nbLines);
    });

    test('should call updateBoard at the end', () => {
        player.penalty(1);
        expect(player.updateBoard).toHaveBeenCalled();
    });
});

describe('doubleCheckPenalty', () => {
    let player;
    const mockSocket = {};
    const playerName = 'TestPlayer';
    const database = {};

    beforeEach(() => {
        jest.clearAllMocks();
        const Player = require('./Player');
        player = new Player(mockSocket, playerName, database);
        player.gameOver = jest.fn();
        player.updateBoard = jest.fn();
        player.board = Array(ROWS + 1).fill().map(() => Array(COLS + 2 * BORDER_WIDTH).fill([0, 'empty']));
        player.idRowBorder = ROWS;
    });

    test('should call gameOver when idRowBorder is 3', () => {
        player.idRowBorder = 3;
        player.doubleCheckPenalty();
        expect(player.gameOver).toHaveBeenCalled();
    });

    test('should update the board with border blocks and not call gameOver when idRowBorder is not 3', () => {
        player.idRowBorder = 4;
        player.doubleCheckPenalty();
        expect(player.gameOver).not.toHaveBeenCalled();
    });
});

describe('supprLines', () => {
    let player;
    const mockSocket = {};
    const playerName = 'TestPlayer';
    const database = {};

    beforeEach(() => {
        jest.clearAllMocks();
        const Player = require('./Player');
        player = new Player(mockSocket, playerName, database);
        player.board = Array(ROWS).fill().map(() => Array(COLS + 2 * BORDER_WIDTH).fill([0, 'empty']));
        player.board[5] = Array(COLS + 2 * BORDER_WIDTH).fill([1, 'filled']);
        player.board[7] = Array(COLS + 2 * BORDER_WIDTH).fill([1, 'filled']);
        player.actualScore = 0;
    });

    test('should correctly remove specified lines and update score', () => {
        const completeLines = [5, 7];
        player.supprLines(completeLines);
        expect(player.actualScore).toEqual(completeLines.length);
        expect(player.board.length).toBe(ROWS);

        for (let i = 0; i < completeLines.length; i++) {
            expect(player.board[i]).toEqual(player.createEmptyRow());
        }
    });
});

describe('checkCompleteLines', () => {
    let player;
    const mockSocket = {};
    const playerName = 'TestPlayer';
    const database = {};

    beforeEach(() => {
        jest.clearAllMocks();
        const Player = require('./Player');
        player = new Player(mockSocket, playerName, database);
        player.board = Array(ROWS).fill().map(() => Array(COLS + 2 * BORDER_WIDTH).fill([0, 'empty']));
        player.board[10] = Array(COLS + 2 * BORDER_WIDTH).fill([1, 'filled']);
        for (let col = 0; col < COLS + 2 * BORDER_WIDTH; col += COLS + 2 * BORDER_WIDTH - 1) {
            player.board[10][col] = [1, 'border'];
        }
        player.supprLines = jest.fn();
        player.game = { penalty: jest.fn() };
    });

    test('should identify complete lines and call supprLines', () => {
        player.checkCompleteLines();
        expect(player.supprLines).toHaveBeenCalledWith([10]);
    });

    test('should call penalty function if more than one line is complete', () => {
        player.board[9] = Array(COLS + 2 * BORDER_WIDTH).fill([1, 'filled']);
        for (let col = 0; col < COLS + 2 * BORDER_WIDTH; col += COLS + 2 * BORDER_WIDTH - 1) {
            player.board[9][col] = [1, 'border'];
        }

        player.checkCompleteLines();
        expect(player.game.penalty).toHaveBeenCalledWith(playerName, 1);
    });

    test('should not call penalty function if only one line is complete', () => {
        player.checkCompleteLines();
        expect(player.game.penalty).not.toHaveBeenCalled();
    });
});

describe('convertBoardForDisplay', () => {
    let player;
    const mockSocket = {};
    const playerName = 'TestPlayer';
    const database = {};

    beforeEach(() => {
        jest.clearAllMocks();
        const Player = require('./Player');
        player = new Player(mockSocket, playerName, database);
        player.board = Array(30).fill().map((_, index) => `Ligne ${index + 1}`);
    });

    test('should return the last n rows of the board', () => {
        const rowsToShow = 21;
        const result = player.convertBoardForDisplay(player.board);

        expect(result.length).toBe(rowsToShow);
        expect(result[0]).toBe(`Ligne ${30 - rowsToShow + 1}`);
        expect(result[result.length - 1]).toBe('Ligne 30');
    });

    test('should return the entire board if it has less than or equal to n rows', () => {
        player.board = Array(20).fill().map((_, index) => `Ligne ${index + 1}`);
        const result = player.convertBoardForDisplay(player.board);

        expect(result.length).toBe(20);
        expect(result[0]).toBe('Ligne 1');
        expect(result[result.length - 1]).toBe('Ligne 20');
    });
});

describe('updateBoard', () => {
    let player, game;
    const mockSocket = { emit: jest.fn() };
    const playerName = 'TestPlayer';
    const database = {};

    beforeEach(() => {
        jest.clearAllMocks();
        const Player = require('./Player');
        const Game = require('./Game');
        player = new Player(mockSocket, playerName, database);
        game = new Game();
        game.sendSpectrum = jest.fn();
        player.game = game;
        player.listOfPieces = [1, 4, 1, 2, 1, 2, 5,
                2, 6, 3, 3, 5, 4, 2, 0, 6, 4, 5,
                4, 0, 1, 3, 4, 4, 3, 6, 6, 5, 0, 0,
                4, 1, 0, 4];
        player.generateNewPiece();
        player.makeSpectrum = jest.fn(); 
    });

    test('should clear old piece from the board', () => {
        const oldPiece = player.actualPiece;
        player.updateBoard(oldPiece);
        expect(player.board[0][1]).toEqual([1, 'color']);
    });

    test('should place new piece on the board', () => {
        player.updateBoard();
        expect(player.board[0][1]).toEqual([1, 'color']);
    });

    test('should call makeSpectrum and emit update messages if playing', () => {
        player.isPlaying = true;
        player.updateBoard();
        expect(player.makeSpectrum).toHaveBeenCalled();
        expect(mockSocket.emit).toHaveBeenCalledWith('UPDATE_BOARD', expect.anything());
    });
});

describe('Player.makeSpectrum', () => {
    let player;
    const mockSocket = {};
    const playerName = 'TestPlayer';
    const database = {};

    beforeEach(() => {
        player = new Player(mockSocket, playerName, database);
        player.board = player.createBoard(ROWS);
        player.listOfPieces = [1, 4, 1, 2, 1, 2, 5,
            2, 6, 3, 3, 5, 4, 2, 0, 6, 4, 5,
            4, 0, 1, 3, 4, 4, 3, 6, 6, 5, 0, 0,
            4, 1, 0, 4];
        player.generateNewPiece();
        player.moveDown();
        player.updateBoard();
    });

    test('should correctly generate spectrum without actual piece', () => {
        player.makeSpectrum();
        expect(player.spectrum[0][1]).toEqual([0, "#ffffff"]);

    });

    test('should correctly identify full and empty columns in spectrum', () => {
        for (let i = 0; i < ROWS; i++) {
            player.board[i][BORDER_WIDTH] = [1, colors.full]; 
            if (i < ROWS / 2) player.board[i][BORDER_WIDTH + 1] = [1, colors.full];
        }
    
        player.makeSpectrum();
    
        for (let i = 1; i < ROWS; i++) {
            expect(player.spectrum[i][BORDER_WIDTH]).toEqual([1, colors.full]);
        }
    });
    
});

describe('Player.moveLeft', () => {
    let player;
    const mockSocket = { emit: jest.fn() };
    const playerName = 'TestPlayer';
    const database = {};

    beforeEach(() => {
        const Player = require('./Player');
        player = new Player(mockSocket, playerName, database);
        const piece = {
            id: 2,
            letter: 'T',
            x: 4,
            y: 1,
            color: 'purple',
            tetromino: [
                [[0, 'empty'], [0, 'empty'], [0, 'empty']],
                [[1, 'purple'], [1, 'purple'], [1, 'purple']],
                [[0, 'empty'], [1, 'purple'], [0, 'empty']]
            ],
            width: 3,
        }
        player.board = player.createBoard(ROWS);
        player.actualPiece = piece;
        player.updateBoard = jest.fn();
    });

    test('should move piece left if there is no obstruction', () => {
        player.moveLeft();
        expect(player.actualPiece.x).toBe(3);
        expect(player.updateBoard).toHaveBeenCalledWith(expect.anything()); 
    });

    test('should not move piece left if there is an obstruction', () => {
        player.actualPiece.x = 1;
        player.board[player.actualPiece.y][player.actualPiece.x - 1][0] = 1;
        player.moveLeft();
        expect(player.updateBoard).not.toHaveBeenCalled();
    });
});


describe('Player.moveRight', () => {
    let player;
    const mockSocket = { emit: jest.fn() };
    const playerName = 'TestPlayer';
    const database = {};

    beforeEach(() => {
        const Player = require('./Player');
        player = new Player(mockSocket, playerName, database);
        const piece = {
            id: 2,
            letter: 'T',
            x: 4,
            y: 1,
            color: 'purple',
            tetromino: [
                [[0, 'empty'], [0, 'empty'], [0, 'empty']],
                [[1, 'purple'], [1, 'purple'], [1, 'purple']],
                [[0, 'empty'], [1, 'purple'], [0, 'empty']]
            ],
            width: 3,
        }
        player.board = player.createBoard(ROWS);
        player.actualPiece = piece;
        player.updateBoard = jest.fn(); 
    });

    test('should move piece right if there is no obstruction', () => {
        player.moveRight();
        expect(player.actualPiece.x).toBe(5);
        expect(player.updateBoard).toHaveBeenCalledWith(expect.anything());
    });

    test('should not move piece right if there is an obstruction', () => {
        player.actualPiece.tetromino[0][player.actualPiece.width - 1][0] = 1;
        player.board[player.actualPiece.y][player.actualPiece.x + player.actualPiece.width][0] = 1;
        player.moveRight();
        expect(player.updateBoard).not.toHaveBeenCalled();
    });
});

describe('Player.moveDown', () => {
    let player;
    const mockSocket = { emit: jest.fn() };
    const playerName = 'TestPlayer';
    const database = {};

    beforeEach(() => {
        const Player = require('./Player');
        player = new Player(mockSocket, playerName, database);
        player.isPlaying = true;
        player.board = player.createBoard(ROWS);
        player.actualPiece = {
            x: 5,
            y: 0,
            width: 2,
            tetromino: [[[1, 'color'], [1, 'color']], [[1, 'color'], [1, 'color']]]
        };
        player.updateBoard = jest.fn();
        player.checkCompleteLines = jest.fn();
        player.generateNewPiece = jest.fn();
    });

    test('should move piece down if there is no obstruction', () => {
        const initialY = player.actualPiece.y;
        player.moveDown();
        expect(player.actualPiece.y).toBe(initialY + 1);
        expect(player.updateBoard).toHaveBeenCalledWith(expect.anything());
    });

    test('should not move piece down if there is an obstruction', () => {
        player.board[player.actualPiece.y + player.actualPiece.width][player.actualPiece.x] = [1, 'obstacleColor'];
        player.moveDown();
        expect(player.checkCompleteLines).toHaveBeenCalled();
        expect(player.generateNewPiece).toHaveBeenCalled();
    });

    test('should return true if goToBottom is true and piece cannot move down', () => {
        player.board[player.actualPiece.y + player.actualPiece.width][player.actualPiece.x] = [1, 'obstacleColor'];
        const result = player.moveDown(true);
        expect(result).toBe(true);
    });

    test('should return false if goToBottom is true and piece can move down', () => {
        const result = player.moveDown(true);
        expect(result).toBe(false);
    });
});

describe('Player.directBottom', () => {
    let player;
    const mockSocket = { emit: jest.fn() };
    const playerName = 'TestPlayer';
    const database = {};

    beforeEach(() => {
        jest.clearAllMocks();
        const Player = require('./Player');
        player = new Player(mockSocket, playerName, database);
        player.actualPiece = {
            x: 5,
            y: 0,
            width: 2,
            tetromino: [[[1, 'color'], [1, 'color']], [[1, 'color'], [1, 'color']]]
        };
        player.board = player.createBoard(ROWS);
        player.isPlaying = true;

        player.updateBoard = jest.fn();
        player.checkCompleteLines = jest.fn();
        player.generateNewPiece = jest.fn();
    });

    test('should move piece directly to bottom, update board, check lines, and generate new piece if playing', () => {
        player.moveDown = jest.fn();
        player.directBottom();
        expect(player.moveDown).toHaveBeenCalled();
        expect(player.updateBoard).toHaveBeenCalledWith(expect.anything());
        expect(player.checkCompleteLines).toHaveBeenCalled();
        expect(player.generateNewPiece).toHaveBeenCalled();
    });

    test('should not generate new piece if not playing after moving directly to bottom', () => {
        player.isPlaying = false;
        player.directBottom();
        expect(player.generateNewPiece).not.toHaveBeenCalled();
    });
});

describe('Player.canRotate', () => {
    let player;
    const mockSocket = { emit: jest.fn() };
    const playerName = 'TestPlayer';
    const database = {};

    beforeEach(() => {
        const Player = require('./Player');
        player = new Player(mockSocket, playerName, database);
        player.board = player.createBoard(20); 
        player.actualPiece = {
            x: 5,
            y: 1,
            width: 3,
            tetromino: [
                [[1, 'blue'], [1, 'blue'], [0, 'empty']],
                [[0, 'empty'], [1, 'blue'], [0, 'empty']],
                [[0, 'empty'], [1, 'blue'], [0, 'empty']]
            ]
        };
        player.updateBoard();
    });

    test('should allow rotation when there is no obstruction', () => {
        const rotatedTetromino = [
            [[0, 'empty'], [0, 'empty'], [0, 'empty']],
            [[1, 'blue'], [1, 'blue'], [1, 'blue']],
            [[0, 'empty'], [1, 'blue'], [0, 'empty']]
        ];

        const canRotate = player.canRotate(rotatedTetromino);
        expect(canRotate).toBe(true);
    });

    test('should not allow rotation when there is an obstruction', () => {
        player.board[2][5] = [1, 'red']; 
        const rotatedTetromino = [
            [[0, 'empty'], [0, 'empty'], [0, 'empty']],
            [[1, 'blue'], [1, 'blue'], [1, 'blue']],
            [[0, 'empty'], [1, 'blue'], [0, 'empty']]
        ];

        const canRotate = player.canRotate(rotatedTetromino);
        expect(canRotate).toBe(false);
    });
});

describe('Player.rotateRight', () => {
    let player;
    const mockSocket = { emit: jest.fn() };
    const playerName = 'TestPlayer';
    const database = {};

    beforeEach(() => {
        const Player = require('./Player');
        player = new Player(mockSocket, playerName, database);
        player.board = player.createBoard(20); 
        player.actualPiece = {
            x: 4,
            y: 1,
            width: 3,
            rotate: jest.fn().mockReturnValue([
                [[0, 'empty'], [1, 'blue'], [0, 'empty']],
                [[0, 'empty'], [1, 'blue'], [0, 'empty']],
                [[1, 'blue'], [1, 'blue'], [0, 'empty']]
            ]),
            tetromino: [
                [[1, 'blue'], [1, 'blue'], [0, 'empty']],
                [[0, 'empty'], [1, 'blue'], [0, 'empty']],
                [[0, 'empty'], [1, 'blue'], [0, 'empty']]
            ]
        };
        player.canRotate = jest.fn().mockReturnValue(true); 
        player.updateBoard = jest.fn(); 
    });

    test('should rotate piece right if rotation is allowed', () => {
        player.rotateRight();
        expect(player.canRotate).toHaveBeenCalledWith(expect.any(Array)); 
        expect(player.updateBoard).toHaveBeenCalledWith(expect.any(Object)); 
        expect(player.actualPiece.tetromino).toEqual(expect.any(Array)); 
    });

    test('should not rotate piece right if rotation is not allowed', () => {
        player.canRotate.mockReturnValue(false); 

        player.rotateRight();
        expect(player.canRotate).toHaveBeenCalledWith(expect.any(Array));
        expect(player.updateBoard).not.toHaveBeenCalled();
    });
});

describe('Player.rotateLeft', () => {
    let player;
    const mockSocket = { emit: jest.fn() };
    const playerName = 'TestPlayer';
    const database = {};

    beforeEach(() => {
        const Player = require('./Player');
        player = new Player(mockSocket, playerName, database);
        player.board = player.createBoard(20); 
        player.actualPiece = {
            x: 4,
            y: 1,
            width: 3,
            rotate: jest.fn().mockReturnValue([ 
                [[0, 'empty'], [1, 'blue'], [0, 'empty']],
                [[0, 'empty'], [1, 'blue'], [1, 'blue']],
                [[0, 'empty'], [1, 'blue'], [0, 'empty']]
            ]),
            tetromino: [
                [[0, 'empty'], [1, 'blue'], [0, 'empty']],
                [[1, 'blue'], [1, 'blue'], [0, 'empty']],
                [[0, 'empty'], [1, 'blue'], [0, 'empty']]
            ]
        };
        player.canRotate = jest.fn().mockReturnValue(true); 
        player.updateBoard = jest.fn();
    });

    test('should rotate piece left if rotation is allowed', () => {
        player.rotateLeft();
        expect(player.canRotate).toHaveBeenCalledWith(expect.any(Array)); 
        expect(player.updateBoard).toHaveBeenCalledWith(expect.any(Object)); 
        expect(player.actualPiece.tetromino).toEqual(expect.any(Array)); 
    });

    test('should not rotate piece left if rotation is not allowed', () => {
        player.canRotate.mockReturnValue(false); 

        player.rotateLeft();
        expect(player.canRotate).toHaveBeenCalledWith(expect.any(Array));
        expect(player.updateBoard).not.toHaveBeenCalled();
    });
});

describe('Player.gameOver', () => {
    let player;
    const mockSocket = { emit: jest.fn() };
    const playerName = 'TestPlayer';

    beforeEach(() => {
        const Player = require('./Player');
        player = new Player(mockSocket, playerName, {});
        player.game = {
            rank: 1,
            giveScore: jest.fn().mockReturnValue(500),
            playerGameOver: jest.fn(),
        };

        player.database = {
            [playerName]: { allTimeScores: 7 } 
        };
        player.readDatabase = jest.fn().mockReturnValue(player.database); 
        player.playerName = playerName;
        player.actualScore = 0; 
    });

    test('should emit PLAYER_GAME_OVER with correct data and call playerGameOver', () => {
        player.gameOver();

        expect(mockSocket.emit).toHaveBeenCalledWith('PLAYER_GAME_OVER', expect.objectContaining({
            playerName: playerName,
            rank: player.game.rank,
            score: expect.any(Number),
            allTimeScore: 7 
        }));
        expect(player.game.playerGameOver).toHaveBeenCalledWith(player);
        expect(player.actualScore).toBe(500); 
        expect(player.game.giveScore).toHaveBeenCalledWith(player.game.rank); 
    });

});

describe('Player.giveUp', () => {
    let player;
    const mockSocket = { emit: jest.fn() };
    const playerName = 'TestPlayer';

    beforeEach(() => {
        const Player = require('./Player');
        player = new Player(mockSocket, playerName, {});
        player.game = {
            rank: 1,
            playerGiveUp: jest.fn(),
        };
        player.database = {
            [playerName]: { allTimeScores: 7 }
        };
        player.readDatabase = jest.fn().mockReturnValue(player.database);
        player.playerName = playerName;
        player.actualScore = 100; 
        player.isPlaying = true;
    });

    test('should set isPlaying to false and call playerGiveUp', () => {
        const result = player.giveUp();

        expect(player.isPlaying).toBe(false);
        expect(player.game.playerGiveUp).toHaveBeenCalledWith(player);
        expect(result).toEqual({
            rank: player.game.rank,
            score: player.actualScore,
            allTimeScore: 7
        });
        expect(player.readDatabase).toHaveBeenCalled();
        expect(result).toMatchObject({
            rank: 1,
            score: 100,
            allTimeScore: 7
        });
    });
});

describe('Player.winner', () => {
    let player;
    const mockSocket = { emit: jest.fn() };
    const playerName = 'TestPlayer';
    const initialScore = 100; 

    beforeEach(() => {
        jest.resetModules(); 
        const Player = require('./Player'); 
        player = new Player(mockSocket, playerName, {});
        player.actualScore = initialScore;
        player.game = {
            rank: 1, 
            giveScore: jest.fn().mockReturnValue(50), 
        };
    });

    test('should increase player\'s score based on rank', () => {
        player.winner();

        expect(player.game.giveScore).toHaveBeenCalledWith(player.game.rank); 
        expect(player.actualScore).toBe(initialScore + 50); 
        console.log(`Score après winner: ${player.actualScore}`); 
    });

});

describe('Player.resetPlayer', () => {
    let player;
    const mockSocket = { emit: jest.fn() };
    const playerName = 'TestPlayer';
    const database = {};

    beforeEach(() => {
        jest.resetModules();
        const Player = require('./Player'); 
        player = new Player(mockSocket, playerName, database);
        player.listOfPieces = [1, 2, 3]; 
        player.isPlaying = true;
        player.isDead = true;
        player.idRowBorder = 10; 
        player.idActualPiece = 5;
        player.actualPiece = {}; 
        player.actualScore = 100;
        player.board = [[]]; 
        player.spectrum = [[]]; 
        player.rank = 5; 

        player.resetPlayer(); 
    });

    test('should reset player attributes to their default values', () => {
        expect(player.listOfPieces).toEqual([]);
        expect(player.isPlaying).toBe(false);
        expect(player.isDead).toBe(false);
        expect(player.idRowBorder).toBe(ROWS);
        expect(player.idActualPiece).toBe(-1);
        expect(player.actualPiece).toBeUndefined();
        expect(player.actualScore).toBe(0);
        expect(player.board).toEqual(player.createBoard(ROWS)); 
        expect(player.spectrum).toEqual(player.makeSpectrum()); 
        expect(player.rank).toBe(0);
    });
});