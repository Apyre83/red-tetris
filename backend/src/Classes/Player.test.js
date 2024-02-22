const Player = require('./Player'); // Ajustez le chemin selon votre structure de fichiers
const { ROWS, BORDER_WIDTH, COLS, INIT_TIME_MS } = require('../constants/numbers'); // Assurez-vous que ce chemin est correct
const colors = require('../constants/colors'); // Assurez-vous que ce chemin est correct

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
    jest.useFakeTimers(); // Utiliser les timers fictifs de Jest
    let player;
    const mockSocket = { emit: jest.fn() };
    const playerName = 'TestPlayer';
    const database = {};

    beforeEach(() => {
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

    test('should set listOfPieces from game and call generateNewPiece', () => {
        expect(player.listOfPieces).toEqual([0, 1, 2, 3]);
        expect(player.generateNewPiece).toHaveBeenCalled();
    });

    test('should call moveDown and doubleCheckPenalty periodically', () => {
        jest.advanceTimersByTime(INIT_TIME_MS);

        // Vérifier que `moveDown` et `doubleCheckPenalty` sont appelés après INIT_TIME_MS
        expect(player.moveDown).toHaveBeenCalled();
        expect(player.doubleCheckPenalty).toHaveBeenCalled();
    });

    test('should clear interval when isPlaying is false', () => {
        player.isPlaying = false; // Simuler l'arrêt du jeu
        jest.advanceTimersByTime(INIT_TIME_MS); // Avancer le temps encore une fois

        // Vérifier que `moveDown` et `doubleCheckPenalty` ne sont pas appelés une fois le jeu arrêté
        expect(player.moveDown).not.toHaveBeenCalledTimes(2);
    });

    afterEach(() => {
        jest.useRealTimers(); // Revenir aux timers réels après les tests
    });
});

