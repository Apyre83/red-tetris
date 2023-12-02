const { ROWS, COLS, BORDER_WIDTH }      = require('../constants/numbers');
const colors                            = require('../constants/colors');
const Piece                             = require('./Piece');

class Player {
    constructor(io, id, socket, name) {
        this.io = io;
        this.id = id;
        this.socket = socket;
        this.name = name;
        this.ranking = 0;
        this.allTimeScores = 0;
        // this.listOfPieces = undefined;
        this.listOfPieces = [6,1,5,6,6,0,3,4];
        this.isinRoom = false;
        this.isDead = false;
        // this.idActualPiece = undefined;
        this.idActualPiece = -1;
        this.actualPiece = undefined;
        this.actualScore = 0;
        this.board = this.createBoard(ROWS);
        this.shadow = this.makeShadow();
    }

    createEmptyRow() {
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

    addBottomBorder(board) {
        for (let i = 0 ; i < BORDER_WIDTH ; i++) {
            board.push(Array(COLS + 2 * BORDER_WIDTH).fill([1, colors.border]));
        }
    }

    createBoard(nbEmptyLines) {
        const board = [];
        
        for (let i = 0 ; i < nbEmptyLines ; i++) {
            board.push(this.createEmptyRow());
        }
        this.addBottomBorder(board);    
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

    oneLinePenaly(nbLines) {
        for (let i = 0 ; i < nbLines ; i++) {
            this.board.shift();
            this.addBottomBorder(this.board);
        }
        this.updateBoard();
    }

    supprLines(completeLines) {
        // TODO io.emit('LignesAFaireClignoter');
        console.log(completeLines);
        for (let i = 0 ; i < completeLines.length ; i++) {
            const rowToSuppr = completeLines[i];
            if (rowToSuppr >= 0 && rowToSuppr < ROWS) {
                console.log(`rowtosuppr: ` + rowToSuppr);
                this.board.splice(rowToSuppr, 1);
            }
        }
        for (let i = 0 ; i < completeLines.length ; i++) {
            this.board.unshift(this.createEmptyRow());
        }
    }

    checkCompleteLines() {
        console.log(`Board length: ` + this.board.length);
        let oneLineComplete = true;
        let completeLines = [];
        for (let row = ROWS - BORDER_WIDTH; row >= 0 ; row--) {
            for (let col = BORDER_WIDTH ; col < COLS ; col++) {
                // TODO VERIFIER SI C'EST BORDER
                if (this.board[row][col][0] !== 1) {
                    oneLineComplete = false;
                    break;
                }
            }
            if (oneLineComplete === true) {
                completeLines.push(row);
            } else {
                oneLineComplete = true;
            }
        }
        this.printBoard();
        this.supprLines(completeLines);
        console.log(`Complete lines: ` + completeLines);
        // TODO io.emit('lineDone', completeLines.lenght);
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
        this.checkCompleteLines();
        this.makeShadow();
        // this.io.emit('updateBoard', this);
    }

    makeShadow() {
        let shadow = this.createBoard(ROWS);
        const allColsFull = {};
        for (let i = 0; i < ROWS; i++) {
            for (let j = BORDER_WIDTH; j < COLS ; j++) {
                if (allColsFull[j]) {
                    shadow[i][j] = [1, colors.full];
                } else {
                    if (this.board[i][j][0] !== 0) {
                        allColsFull[j] = true;
                        shadow[i][j] = [1, colors.full];
                    } 
                }
            }
        }
        this.shadow = shadow;
    }

    moveLeft() {
        const width = this.actualPiece.width;
        const x     = this.actualPiece.x;
        const y     = this.actualPiece.y;
        let isTile = false;

        for (let col = 0 ; col < width ; col++) {
            for (let row = 0 ; row < width ; row++) {
                if (this.actualPiece.tetromino[row][col][0] === 1) {
                    isTile = true;
                    if (this.board[y + row][x + col - 1][0] > 0) {
                        console.log(`Can't move left`);
                        return;
                    }
                }
            } 
            if (isTile === true) 
                break;
        }
        const oldPiece = JSON.parse(JSON.stringify(this.actualPiece));
        this.actualPiece.x--;
        this.updateBoard(oldPiece);
    }

    moveRight() {
        const width = this.actualPiece.width;
        const x     = this.actualPiece.x;
        const y     = this.actualPiece.y;
        let isTile = false;

        for (let col = width - 1 ; col >= 0 ; col--) {
            for (let row = 0 ; row < width ; row++) {
                if (this.actualPiece.tetromino[row][col][0] === 1) {
                    isTile = true;
                    if (this.board[y + row][x + col + 1][0] > 0) {
                        console.log(`Can't move right`);
                        return;
                    }
                }
            } 
            if (isTile === true) 
                break;
        }
        const oldPiece = JSON.parse(JSON.stringify(this.actualPiece));
        this.actualPiece.x++;
        this.updateBoard(oldPiece);
    }

    moveDown(goToBottom) {
        const width = this.actualPiece.width;
        const oldPiece = JSON.parse(JSON.stringify(this.actualPiece));
        const x     = this.actualPiece.x;
        const y     = this.actualPiece.y;
        let isTile = false;

        for (let row = width - 1 ; row >= 0 ; row--) {
            for (let col = 0 ; col < width ; col++) {
                if (this.actualPiece.tetromino[row][col][0] === 1) {
                    isTile = true;
                    if (this.board[y + row + 1][x + col][0] > 0) {
                        console.log(`Can't move down`);
                        return true;
                    }
                }
            } 
            if (isTile === true) 
                break;
        }
        this.actualPiece.y++;
        if (goToBottom)
            return false;
        this.updateBoard(oldPiece);
    }

    canRotate(rotatedTetromino) {
        const   width = this.actualPiece.width;
        const   board = JSON.parse(JSON.stringify(this.board));
        const   x     = this.actualPiece.x;
        const   y     = this.actualPiece.y;

        // replace all the 1 of the actual piece by zero in a copy of the board
        for (let row = 0 ; row < width ; row++) {
            for (let col = 0; col < width ; col++) {
                if (this.actualPiece.tetromino[row][col][0] === 1) {
                    board[y + row][x + col] = [0, colors.empty];
                }
            }
        }

        // check if rotatedTetromino fits in the copy of the board
        for (let row = 0 ; row < width ; row++) {   
            for (let col = 0; col < width ; col++) {
                    if (rotatedTetromino[row][col][0] === 1) {
                        if (board[y + row][x + col][0] === 1) {
                            console.log(`Can't rotate`);
                            return false;
                        }
                    }
            }
        }
        return true;
    }

    rotateRight() {
        const   oldPiece = JSON.parse(JSON.stringify(this.actualPiece));
        const   rotatedTetromino = this.actualPiece.rotate('right');

        if (this.canRotate(rotatedTetromino) === true) {
            this.actualPiece.tetromino = rotatedTetromino;
            this.updateBoard(oldPiece);
        }
    }

    rotateLeft() {
        const oldPiece = JSON.parse(JSON.stringify(this.actualPiece));
        const   rotatedTetromino = this.actualPiece.rotate('left');

        if (this.canRotate(rotatedTetromino) === true) {
            this.actualPiece.tetromino = rotatedTetromino;
            this.updateBoard(oldPiece);
        }
    }

    directBottom() {
        const oldPiece = JSON.parse(JSON.stringify(this.actualPiece));
        let isAtBottom = false;
        while (isAtBottom === false) {
            isAtBottom = this.moveDown(true);
        }
        console.log(`At bottom`);
        this.updateBoard(oldPiece);
    }

    printBoard() {
        for (let row = 0; row < this.board.length; row++) {
            const rowValues = this.board[row].map(cell => (cell[0] === 0 ? '.' : cell[0]));
            console.log(`${rowValues.join()}`);
        }
        console.log(`\n-------\n`);
    }

    printShadow() {
        for (let row = 0; row < this.shadow.length; row++) {
            const rowValues = this.shadow[row].map(cell => (cell[0] === 0 ? '.' : cell[0]));
            console.log(`${rowValues.join()}`);
        }
        console.log(`\n-------\n`);
    }
}

// TESTS

const player = new Player(1, 2, 3);

player.generateNewPiece();
player.directBottom();
player.rotateLeft();
player.generateNewPiece();
player.moveLeft();
player.moveLeft()
player.moveDown();
player.generateNewPiece();

player.printBoard();

console.log(`Bloup`);
player.oneLinePenaly(5);
player.printBoard();