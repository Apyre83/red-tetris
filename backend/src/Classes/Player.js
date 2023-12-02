const { ROWS, COLS, BORDER_WIDTH }    = require('../constants/numbers');
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
        this.idActualPiece = -1;
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
        const board = [];
    
        const createEmptyRow = () => {
            const emptyRow = [];
            for (let i = 0 ; i < BORDER_WIDTH ; i++) {
                emptyRow.push([1, colors.border]);
            }
            for (let i = 0 ; i < COLS ; i++) {
                emptyRow.push([0, colors.empty]);
            }
            for (let i = 0 ; i < BORDER_WIDTH ; i++) {
                emptyRow.push([1, colors.border]);
            }
            return emptyRow;
        }
    
        for (let i = 0 ; i < ROWS ; i++) {
            board.push(createEmptyRow());
        }

        for (let i = 0 ; i < BORDER_WIDTH ; i++) {
            board.push(Array(COLS + 2 * BORDER_WIDTH).fill([1, colors.border]));
        }
    
        return board;
    }

    generateNewPiece() {
        if (this.idActualPiece === this.listOfPieces.length - 1)
            this.idActualPiece = 0;
        else 
            this.idActualPiece++;
        console.log(`id`+ this.listOfPieces[this.idActualPiece]);
        this.actualPiece = new Piece(this.listOfPieces[this.idActualPiece]);

        for (let row = 0 ; row < this.actualPiece.width ; row++) {
            for (let col = 0; col < this.actualPiece.width ; col++) {
                if (this.actualPiece.tetromino[row][col][0] === 1) {
                    if (this.board[this.actualPiece.y + row][this.actualPiece.x + col][0] != 0) {
                        console.log(`Game Over`);
                        // TODO faire fonction Game Over
                        return;
                    }
                    this.board[this.actualPiece.y + row][this.actualPiece.x + col] = this.actualPiece.tetromino[row][col];
                }
            }
        }
        // TODO checker si game over 
        this.updateBoard();
    }

    updateBoard(oldPiece) {
        
        const x = this.actualPiece.x;
        const y = this.actualPiece.y;

        for (let row = 0 ; row < this.actualPiece.width ; row++) {
            for (let col = 0; col < this.actualPiece.width ; col++) {
                if (oldPiece) {
                    if (oldPiece.tetromino[row][col][0] === 1) {
                        this.board[oldPiece.y + row][oldPiece.x + col] = [0, colors.empty];
                    }
                }
            }
        }
        for (let row = 0 ; row < this.actualPiece.width ; row++) {   
            for (let col = 0; col < this.actualPiece.width ; col++) {
                    if (this.actualPiece.tetromino[row][col][0] === 1) {
                        this.board[y + row][x + col] = this.actualPiece.tetromino[row][col];
                    }
            }
        }
        // this.io.emit('updateBoard', this);
    }

    // VERIFIER
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
        return shadow;
    }

    moveRight() {
        const width = this.actualPiece.width;
        const x     = this.actualPiece.x;
        const y     = this.actualPiece.y;
        let isOne = false;

        for (let col = width - 1 ; col >= 0 ; col--) {
            for (let row = 0 ; row < width ; row++) {
                if (this.actualPiece.tetromino[row][col][0] === 1) {
                    isOne = true;
                    if (this.board[y + row][x + col + 1][0] > 0) {
                        console.log(`Can't move right`);
                        return;
                    }
                }
            } 
            if (isOne === true) 
                break;
        }
        const oldPiece = {...this.actualPiece};
        this.actualPiece.x++;
        this.updateBoard(oldPiece);
    }

    moveDown(toBottom) {
        const width = this.actualPiece.width;
        const oldPiece = {...this.actualPiece};
        const x     = this.actualPiece.x;
        const y     = this.actualPiece.y;
        let isOne = false;

        for (let row = width - 1 ; row >= 0 ; row--) {
            for (let col = 0 ; col < width ; col++) {
                if (this.actualPiece.tetromino[row][col][0] === 1) {
                    isOne = true;
                    if (this.board[y + row + 1][x + col][0] > 0) {
                        console.log(`Can't move down`);
                        return true;
                    }
                }
            } 
            if (isOne === true) 
                break;
        }
        this.actualPiece.y++;
        if (toBottom)
            return false;
        this.updateBoard(oldPiece);
    }

    rotateRight() {
        // TODO CHANGER
        const rotated = this.actualPiece.rotate('right');
        updateBoard();
    }

    // TODO change
    directBottom() {
        const oldPiece = {...this.actualPiece};
        let isAtBottom = false;
        while (isAtBottom === false) {
            isAtBottom = this.moveDown(true);
        }
        console.log(`At bottom`);
        this.updateBoard(oldPiece);
    }


        // directBottom() {
    //     const piece = this.actualPiece;
    //     const isOne = false;
    //     const oldPiece = {...piece};
    //     while (piece.y + 1 < ROWS) {
    //         for (let row = piece.width - 1 ; row >= 0 ; row--) {
    //             for (let col = 0 ; col < piece.width ; col++) {
    //                 if (piece.tetromino[row][col] === 1) {
    //                     isOne = true;
    //                     console.log("x:" + piece.x + " y: " + piece.y);
    //                     if (this.board[piece.y + row + 1][piece.x + col][0] > 0) {
    //                         this.updateBoard(oldPiece)
    //                         console.log(`En bas`);
    //                         return;
    //                     }  
    //                 } 
    //             }
    //         }
    //         piece.y++;
    //     }
    //     this.updateBoard(oldPiece);
    // }


    printBoard() {
        for (let row = 0; row < player.board.length; row++) {
            const rowValues = player.board[row].map(cell => (cell[0] === 0 ? '.' : cell[0]));
            console.log(`${rowValues.join()}`);
        }
        console.log(`\n-------\n`);
    }
}

// TESTS

const player = new Player(1, 2, 3);
player.printBoard();

player.generateNewPiece();
player.printBoard();

player.directBottom();
player.printBoard();


// console.log(player.shadow);