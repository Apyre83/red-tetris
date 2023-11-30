const { ROWS, COLS }    = require('../constants/numbers');
const colors            = require('../constants/colors');
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

        this.listOfPieces = undefined;
        this.isinRoom = false;
        this.isDead = false;
        this.idActualPiece = undefined;
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
        for (let i = 0; i < ROWS; i++) {
            const row = [];
            for (let j = 0; j < COLS; j++) {
                row.push([0, colors.empty]);
            }
            board.push(row);
        }
        return board;
    }

    updateBoard(mvt) {
        
        const oldPiece = this.actualPiece;
        switch (mvt) {
            case 'right':
                this.actualPiece.y++;
        }
        const x = this.actualPiece.x;
        const y = this.actualPiece.y;

        for (let row = 0 ; row < this.actualPiece.width ; row++) {
            for (let col = 0; col < this.actualPiece.width ; col++) {
                this.board[]
            }
        }
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
        console.log(allColsFull);
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
        // this.actualPiece.y++;
        this.updateBoard('right');
    }
    
    rotateLeft() {
        this.actualPiece = this.actualPiece.rotate('left');
        updateBoard();
    }

    rotateRight() {
        const rotated = this.actualPiece.rotate('right');

        updateBoard();
    }
}

// TESTS
const player = new Player(1, 2, 3);
console.log(player.board);
console.log('Bloup');
console.log(player.shadow);