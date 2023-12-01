const { ROWS, COLS }    = require('../constants/numbers');
const colors            = require('../constants/colors');
const Piece             = require('./Piece');
// const ROWS = 4;
// const COLS = 4;

class Player {
    constructor(io, id, socket, name) {
        this.io = io;
        this.id = id;
        this.socket = socket;
        this.name = name;
        this.ranking = 0;
        this.allTimeScores = 0;

        // this.listOfPieces = undefined;
        this.listOfPieces = [2,1,5,6,6,0,3,4];
        this.isinRoom = false;
        this.isDead = false;
        // this.idActualPiece = undefined;
        this.idActualPiece = 0;
        this.actualPiece = undefined;
        this.actualScore = 0;
        this.board = this.createBoard();
        // this.board = [
        //     [[0, colors.empty], [0, colors.empty],  [1, colors.cyan],  [0, colors.empty]],
        //     [[0, colors.empty], [1, colors.cyan],  [1, colors.cyan],  [0, colors.empty]],
        //     [[1, colors.cyan],  [1, colors.cyan],  [1, colors.cyan],  [0, colors.empty]],
        //     [[0, colors.empty], [0, colors.empty],  [0, colors.empty],  [0, colors.empty]],
        // ]
        this.shadow = this.makeShadow();
    }

    createBoard() {
        // Board est sous forme Board[y][x]
        const board = [];
        for (let i = 0; i < ROWS + 1; i++) {
            const row = [];
            for (let j = 0; j < COLS + 2; j++) {
                if (i === ROWS) {
                    row.push([1, colors.border]);
                } else {
                    if (j === 0 || j === COLS + 1) {
                        row.push([1, colors.border]);
                    } else {
                        row.push([0, colors.empty]);
                    }
                }
            }
            board.push(row);
        }
        return board;
    }

    generateNewPiece() {
        if (this.idActualPiece === this.listOfPieces.length - 1)
            this.idActualPiece = 0;
        else 
            this.idActualPiece++;
        this.actualPiece = new Piece(this.idActualPiece);
        this.updateBoard();
    }

    updateBoard(oldPiece) {
        
        const x = this.actualPiece.x;
        const y = this.actualPiece.y;

        console.log("tetro:" + this.actualPiece.id);

        for (let row = 0 ; row < this.actualPiece.width ; row++) {
            for (let col = 0; col < this.actualPiece.width ; col++) {
                if (oldPiece) {
                    if (oldPiece[oldPiece.y - row][oldPiece.x + col][0] === 1)
                        this.board[oldPiece.y - row][oldPiece.x + col] = [0, colors.empty];
                }
                console.log("y: " + y);
                console.log("row: " + row);
                console.log("x: " + x);
                console.log("col: " + col);
                if (this.actualPiece.tetromino[row][col][0] === 1) {
                    if (this.board[y - row][x + col][0] != 0) {
                        console.log(`Game Over`); // TODO add function 
                        return;
                    }
                    this.board[y - row][x + col] = this.actualPiece.tetromino[row][col];
                }
            }
        }
        // this.io.emit('updateBoard', this);
    }

    makeShadow() {
        let shadow = this.createBoard();
        const allColsFull = {};
        for (let i = 0; i < ROWS; i++) {
            for (let j = 0; j < COLS; j++) {
                if (allColsFull[j]) {
                    shadow[i][j] = [1, colors.full];
                } else {
                    if (this.board[i][j][0] != 0) {
                        allColsFull[j] = true;
                        shadow[i][j] = [1, colors.full];
                    } 
                }
            }
        }
        // console.log(allColsFull);
        return shadow;
    }

    moveRigth() {
        const width = this.actualPiece.width;
        const x     = this.actualPiece.x;
        const y     = this.actualPiece.y;
        for (let i = 0 ; i < width ; i++) {
            if (this.board[y - i][x + width][0] + this.piece[y - i][x + width - 1][0] > 1)
                return;
        }
        const oldPiece = this.actualPiece;
        this.actualPiece.y++;
        this.updateBoard(oldPiece);
    }
    
    rotateLeft() {
        this.actualPiece = this.actualPiece.rotate('left');
        updateBoard();
    }

    rotateRight() {
        const rotated = this.actualPiece.rotate('right');
        updateBoard();
    }

    printBoard() {
        for (let row = 0; row < player.board.length; row++) {
            const rowValues = player.board[row].map(cell => (cell[0] === 0 ? '.' : cell[0]));
            console.log(`${rowValues.join()}`);
        }
    }
}

// TESTS

const player = new Player(1, 2, 3);
player.printBoard();
console.log('Bloup');
player.generateNewPiece();
player.printBoard();


// console.log(player.shadow);