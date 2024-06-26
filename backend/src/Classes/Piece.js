const colors = require('../constants/colors');
const { BORDER_WIDTH }    = require('../constants/numbers');

class Piece {
    constructor(id) {
        if (typeof id !== 'number') throw new Error('Piece id must be a number');
        if (id < 0 || id > 6) throw new Error('Piece id must be between 0 and 6');
        this.id = id;
        this.data = this.getData();
        this.letter = this.data.letter;
        this.x = this.data.x;
        this.tetromino = this.data.tetromino;
        this.y = this.data.y;
        this.width = this.tetromino[0].length;
        this.color = this.data.color;
    }

    getData() {
        const data = [
            { id: 0, letter: 'I', x: 2 + BORDER_WIDTH, y: 0, color: colors.cyan, tetromino: [
                [[0, colors.empty], [0, colors.empty],  [1, colors.cyan],  [0, colors.empty]],
                [[0, colors.empty], [0, colors.empty],  [1, colors.cyan],  [0, colors.empty]],
                [[0, colors.empty], [0, colors.empty],  [1, colors.cyan],  [0, colors.empty]],
                [[0, colors.empty], [0, colors.empty],  [1, colors.cyan],  [0, colors.empty]]]},

            { id: 1, letter: 'O', x: 4 + BORDER_WIDTH, y: 2, color: colors.yellow, tetromino: [
                [[1, colors.yellow], [1, colors.yellow]],
                [[1, colors.yellow], [1, colors.yellow]]]},

            { id: 2, letter: 'T', x: 3 + BORDER_WIDTH, y: 1, color: colors.purple, tetromino: [
                [[0, colors.empty],  [0, colors.empty],  [0, colors.empty]],
                [[1, colors.purple], [1, colors.purple], [1, colors.purple]],
                [[0, colors.empty],  [1, colors.purple], [0, colors.empty]]]},

            { id: 3, letter: 'L', x: 4 + BORDER_WIDTH, y: 1, color: colors.orange, tetromino: [
                [[0, colors.empty], [1, colors.orange], [0, colors.empty]],
                [[0, colors.empty], [1, colors.orange], [0, colors.empty]],
                [[0, colors.empty], [1, colors.orange], [1, colors.orange]]]},

            { id: 4, letter: 'J', x: 4 + BORDER_WIDTH, y: 1, color: colors.blue, tetromino: [
                [[0, colors.empty], [1, colors.blue], [0, colors.empty]],
                [[0, colors.empty], [1, colors.blue], [0, colors.empty]],
                [[1, colors.blue],  [1, colors.blue], [0, colors.empty]]]},

            { id: 5, letter: 'Z', x: 3 + BORDER_WIDTH, y: 1, color: colors.red, tetromino: [
                [[0, colors.empty], [0, colors.empty], [0, colors.empty]],
                [[1, colors.red],   [1, colors.red],   [0, colors.empty]],
                [[0, colors.empty], [1, colors.red],   [1, colors.red]]]},
            
            { id: 6, letter: 'S', x: 3 + BORDER_WIDTH, y: 1, color: colors.green, tetromino: [
                [[0, colors.empty], [0, colors.empty], [0, colors.empty]],
                [[0, colors.empty], [1, colors.green], [1, colors.green]],
                [[1, colors.green], [1, colors.green], [0, colors.empty]]]},
        ]
        return data[this.id];
    }

    rotate(side) {
        const rows = this.tetromino.length;
        const cols = this.tetromino[0].length;

        function createEmptyTetromino(rows, cols) {
            const matrix = [];
            for (let i = 0; i < rows; i++) {
                const row = [];
                for (let j = 0; j < cols; j++) {
                    row.push([0, colors.empty]);
                }
                matrix.push(row);
            }
            return matrix;
        }

        function rotate90(matrix) {
            const newMatrix = createEmptyTetromino(rows, cols);
            for (let i = 0; i < rows; i++) {
                for (let j = 0; j < cols; j++) {
                    newMatrix[j][rows - i - 1] = matrix[i][j];
                }
            }
            return newMatrix;
        }

        let rotatedTetromino;
        switch (side) {
            case 'right':
                rotatedTetromino = rotate90(this.tetromino);
                break;
            case 'left':
                rotatedTetromino = rotate90(rotate90(rotate90(this.tetromino)));
                break;
            default:
                rotatedTetromino = JSON.parse(JSON.stringify(this.tetromino));
        }
        return rotatedTetromino;
    }
}

module.exports = Piece;