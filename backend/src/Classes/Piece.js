const colors = require('../constants/colors');

class Piece {
    constructor(id) {
        this.id = id;
        this.data = this.getData();
        this.letter = this.data.letter;
        this.x = this.data.x;
        this.y = 0;
        this.color = this.data.color;
        this.tetromino = this.data.tetromino;
    }

    getData() {
        const data = [
            { id: 0, letter: 'I', x: 3, color: colors.cyan, tetromino: [
                [[0, colors.empty], [0, colors.empty],  [1, colors.cyan],  [0, colors.empty]],
                [[0, colors.empty], [0, colors.empty],  [1, colors.cyan],  [0, colors.empty]],
                [[0, colors.empty], [0, colors.empty],  [1, colors.cyan],  [0, colors.empty]],
                [[0, colors.empty], [0, colors.empty],  [1, colors.cyan],  [0, colors.empty]]]},

            { id: 1, letter: 'O', x:4, color: colors.yellow, tetromino: [
                [[1, colors.yellow], [1, colors.yellow]],
                [[1, colors.yellow], [1, colors.yellow]]]},

            { id: 2, letter: 'T', x:4, color: colors.purple, tetromino: [
                [[1, colors.purple], [1, colors.purple], [1, colors.purple]],
                [[0, colors.empty],  [1, colors.purple], [0, colors.empty]],
                [[0, colors.empty],  [0, colors.empty],  [0, colors.empty]]]},

            { id: 3, letter: 'L', x:4, color: colors.orange, tetromino: [
                [[0, colors.empty], [1, colors.orange], [0, colors.empty]],
                [[0, colors.empty], [1, colors.orange], [0, colors.empty]],
                [[0, colors.empty], [1, colors.orange], [1, colors.orange]]]},

            { id: 4, letter: 'J', x:4, color: colors.blue, tetromino: [
                [[0, colors.empty], [1, colors.blue], [0, colors.empty]],
                [[0, colors.empty], [1, colors.blue], [0, colors.empty]],
                [[1, colors.blue],  [1, colors.blue], [0, colors.empty]]]},

            { id: 5, letter: 'Z', x:4, color: colors.red, tetromino: [
                [[1, colors.red],   [1, colors.red],   [0, colors.empty]],
                [[0, colors.empty], [1, colors.red],   [1, colors.red]],
                [[0, colors.empty], [0, colors.empty], [0, colors.empty]]]},
            
            { id: 6, letter: 'S', x:4, color: colors.green, tetromino: [
                [[0, colors.empty], [1, colors.green], [1, colors.green]],
                [[1, colors.green], [1, colors.green], [0, colors.empty]],
                [[0, colors.empty], [0, colors.empty], [0, colors.empty]]]},
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

        function copyMatrix(matrix) {
            const newMatrix = matrix.map(row => [...row]);
            return newMatrix;
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
                rotatedTetromino = copyMatrix(this.tetromino);
        }
        return rotatedTetromino;
    }
}

module.exports = Piece;

const piece = new Piece(0);
console.log(piece.tetromino);
console.log(`\n\n\n`)
console.log(piece.rotate('right'));