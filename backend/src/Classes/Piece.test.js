const colors = require('../constants/colors');
const { BORDER_WIDTH }    = require('../constants/numbers');
const Piece = require('./Piece');

describe('Piece class', () => {
  describe('constructor', () => {
    test('should throw an error if id is not a number', () => {
    expect(() => new Piece('1')).toThrow('Piece id must be a number');
    expect(() => new Piece(1)).not.toThrow();
    });
    test('should throw an error if id is not between 0 and 6', () => {
      expect(() => new Piece(-1)).toThrow('Piece id must be between 0 and 6');
      expect(() => new Piece(7)).toThrow('Piece id must be between 0 and 6');
      expect(() => new Piece(3)).not.toThrow();
    });
  });

  describe('getData method', () => {
    test('should return the data of the piece', () => {
      const piece = new Piece(0);
      const data = piece.getData();

      expect(data).toEqual({
        id: 0,
        letter: 'I',
        x: 2 + BORDER_WIDTH,
        y: 0,
        color: colors.cyan,
        tetromino: [
          [ [0, colors.empty], [0, colors.empty], [1, colors.cyan], [0, colors.empty] ],
          [ [0, colors.empty], [0, colors.empty], [1, colors.cyan], [0, colors.empty] ],
          [ [0, colors.empty], [0, colors.empty], [1, colors.cyan], [0, colors.empty] ],
          [ [0, colors.empty], [0, colors.empty], [1, colors.cyan], [0, colors.empty] ]
        ]
      });
    });
  });

  describe('rotate method', () => {
    test('should rotate tetromino to the right', () => {
      const piece = new Piece(2);
      const originalTetromino = piece.tetromino;
      const rotatedTetromino = piece.rotate('right');

      expect(piece.tetromino).toEqual(originalTetromino);

      expect(rotatedTetromino).toEqual([
        [ [0, colors.empty], [1, colors.purple], [0, colors.empty] ],
        [ [1, colors.purple], [1, colors.purple], [0, colors.empty] ],
        [ [0, colors.empty], [1, colors.purple], [0, colors.empty] ]
      ]);
    });

    test('should rotate tetromino to the left', () => {
      const piece = new Piece(4);
      const originalTetromino = piece.tetromino;
      const rotatedTetromino = piece.rotate('left');

      expect(piece.tetromino).toEqual(originalTetromino);

      expect(rotatedTetromino).toEqual([
        [ [0, colors.empty], [0, colors.empty], [0, colors.empty] ],
        [ [1, colors.blue], [1, colors.blue], [1, colors.blue] ],
        [ [0, colors.empty], [0, colors.empty], [1, colors.blue] ]
      ]);
    });

    test('should not rotate tetromino for an invalid side', () => {
      const piece = new Piece(1);
      const originalTetromino = piece.tetromino;
      const rotatedTetromino = piece.rotate('invalid');

      expect(piece.tetromino).toEqual(originalTetromino);

      expect(rotatedTetromino).toEqual(originalTetromino);
    });
  });
});
