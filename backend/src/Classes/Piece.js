const colors = require('../constants/colors');

class Piece {
    constructor(id) {
        this.id = id;
        this.data = this.getData();
        this.letter = this.data.letter;
        this.color = this.data.color;
        this.tetromino = this.data.tetromino;
    }

    getData() {
        const data = [
            { id: 0, letter: 'I', color: colors.cyan, tetromino: [
                [0, 0, 0, 0],
                [1, 1, 1, 1],
                [0, 0, 0, 0],
                [0, 0, 0, 0]] },

            { id: 1, letter: 'O', color: colors.yellow, tetromino: [
                [1, 1],
                [1, 1]] },

            { id: 2, letter: 'T', color: colors.purple, tetromino: [
                [0, 0, 0],
                [1, 1, 1],
                [0, 1, 0]] },

            { id: 3, letter: 'L', color: colors.orange, tetromino: [
                [0, 0, 0],
                [1, 1, 1],
                [1, 0, 0]] },

            { id: 4, letter: 'J', color: colors.blue, tetromino: [
                [0, 0, 0],
                [1, 1, 1],
                [0, 0, 1]] },

            { id: 5, letter: 'Z', color: colors.red, tetromino: [
                [1, 1, 0],
                [0, 1, 1],
                [0, 0, 0]] },

            { id: 6, letter: 'S', color: colors.green, tetromino: [
                [0, 0, 1],
                [1, 1, 0],
                [1, 0, 0]] }
        ]
        return data[this.id];
    }

    rotate(angle) {
        const rows = this.tetromino.length;
        const cols = this.tetromino[0].length;

        function createEmptyTetromino(rows, cols) {
            const matrix = [];
            for (let i = 0; i < rows; i++) {
                const row = Array(cols).fill(0);
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
        switch (angle) {
            case 90:
                rotatedTetromino = rotate90(this.tetromino);
                break;
            case -90:
                rotatedTetromino = rotate90(rotate90(rotate90(this.tetromino)));
                break;
            default:
                rotatedTetromino = copyMatrix(this.tetromino);
        }
        return rotatedTetromino;
    }
}

module.exports = Piece;