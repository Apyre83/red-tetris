class Piece {
    constructor(id) {
        this.id = id;
        this.tetromino = this.getTetronimo();
        this.color = this.getColor();
    }

    getTetromino() {
        const tetrominos = [[
            [0, 0, 0, 0],
            [1, 1, 1, 1],
            [0, 0, 0, 0],
            [0, 0, 0, 0]], // I

        [[1, 1],
        [1, 1]], // O

        [[0, 0, 0],
        [1, 1, 1],
        [0, 1, 0]], // T

        [[0, 0, 0],
        [1, 1, 1],
        [1, 0, 0]], // L

        [[0, 0, 0],
        [1, 1, 1],
        [0, 0, 1]], // J

        [[1, 1, 0],
        [0, 1, 1],
        [0, 0, 0]], /// Z

        [[0, 0, 1],
        [1, 1, 0],
        [1, 0, 0]] // S
        ]
        return tetrominos[this.id];
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
            case -270:
                rotatedTetromino = rotate90(this.tetromino);
                break;
            case 180:
            case -180:
                rotatedTetromino = rotate90(rotate90(this.tetromino));
                break;
            case 270:
            case -90:
                rotatedTetromino = rotate90(rotate90(rotate90(this.tetromino)));
                break;
            default:
                rotatedTetromino = copyMatrix(this.tetromino);
        }
        return rotatedTetromino;
    }


}