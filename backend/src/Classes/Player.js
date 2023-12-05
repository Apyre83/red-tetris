const { 
    ROWS, 
    COLS, 
    BORDER_WIDTH, 
    INIT_TIME_MS }                      = require('../constants/numbers');
const colors                            = require('../constants/colors');
const Piece                             = require('./Piece');

class Player {
    constructor(socket, playerName) {
        this.socket = socket;
        this.playerName = playerName;
        this.ranking = 0;
        this.allTimeScores = 0;
        // this.listOfPieces = [];
        this.listOfPieces = [1, 4, 2, 5,
            2, 6, 3, 3, 5, 4, 2, 0, 6, 4, 5,
            4, 0, 1, 3, 4, 4, 3, 6, 6, 5, 0, 0,
            4, 1, 0, 4];
        // this.isInGame = false;
        this.isInGame = true; // put on false if not in test
        this.isDead = false; // TODO est-ce que ce truc est utile?
        // this.idActualPiece = undefined;
        this.idRowBorder = ROWS;
        this.idActualPiece = -1;
        this.actualPiece = undefined;
        this.actualScore = 0; // TODO mettre un systeme de scores
        this.board = this.createBoard(ROWS);
        this.spectrum = this.makeSpectrum();
    }

    startGame() {
        this.generateNewPiece();
        var interval = setInterval(() => {
            if (this.isInGame === false) {
                clearInterval(interval);
            }
            this.moveDown();
        }, INIT_TIME_MS );

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

    createBoard(nbEmptyLines) {
        const board = [];
        
        for (let i = 0 ; i < nbEmptyLines ; i++) {
            board.push(this.createEmptyRow());
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
        this.actualPiece = new Piece(this.listOfPieces[this.idActualPiece]);

        for (let row = 0 ; row < this.actualPiece.width ; row++) {
            for (let col = 0; col < this.actualPiece.width ; col++) {
                if (this.actualPiece.tetromino[row][col][0] === 1) {
                    if (this.board[this.actualPiece.y + row][this.actualPiece.x + col][0] != 0) {
                        this.gameOver();
                        return;
                    }
                    this.board[this.actualPiece.y + row][this.actualPiece.x + col] = this.actualPiece.tetromino[row][col];
                }
            }
        }
        this.updateBoard();
    }

    penalty(nbLines) {
        for (let i = 0 ; i < nbLines ; i++) {
            this.idRowBorder--;
            if (this.idRowBorder === 0) {
                this.gameOver();
                return;
            }
            for (let col = BORDER_WIDTH ; col < COLS + BORDER_WIDTH; col++) {
                this.board[this.idRowBorder][col] = [1, colors.border];
            }
        }
        this.updateBoard();
    }

    supprLines(completeLines) {
        // TODO socket.emit('LignesAFaireClignoter');
        for (let i = 0 ; i < completeLines.length ; i++) {
            const rowToSuppr = completeLines[i];
            if (rowToSuppr >= 0 && rowToSuppr < ROWS) {
                this.board.splice(rowToSuppr, 1);
            }
        }
        for (let i = 0 ; i < completeLines.length ; i++) {
            this.board.unshift(this.createEmptyRow());
        }
    }

    checkCompleteLines() {
        let linesComplete = true;
        let completeLines = [];
        for (let row = ROWS - BORDER_WIDTH; row >= 0 ; row--) {
            for (let col = BORDER_WIDTH ; col < COLS ; col++) {
                // TODO VERIFIER SI C'EST BORDER
                const tile = this.board[row][col];
                if (tile[0] !== 1 || tile[1] === colors.border) {
                    linesComplete = false;
                    break;
                }
            }
            if (linesComplete === true) {
                completeLines.push(row);
            } else {
                linesComplete = true;
            }
        }
        this.supprLines(completeLines);
        if (completeLines.length > 1)
            this.isInGame.penalty(this.playerName, completeLines.length - 1);
    }

    convertBoardForDisplay(originalBoard) {
        const rowsToShow = 20;
        const borderSize = 1;
    
        const displayBoard = originalBoard.slice(-rowsToShow).map(row => 
            row.slice(borderSize, -borderSize)
        );
    
        return displayBoard;
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
        this.makeSpectrum();
        if (this.isInGame !== false) {
            this.printBoard(); // TODO suppr
            // this.socket.emit('UPDATE_BOARD', {board: this.convertBoardForDisplay(this.board), playerName: this.playerName});
        }
    }

    makeSpectrum() {
        let spectrum = this.createBoard(ROWS);
        const allColsFull = {};
        for (let i = 0; i < ROWS; i++) {
            for (let j = BORDER_WIDTH; j < COLS ; j++) {
                if (allColsFull[j]) {
                    spectrum[i][j] = [1, colors.full];
                } else {
                    if (this.board[i][j][0] !== 0) {
                        allColsFull[j] = true;
                        spectrum[i][j] = [1, colors.full];
                    } 
                }
            }
        }
        this.spectrum = spectrum;
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
        // let isTile = false;

        // for (let row = width - 1 ; row >= 0 ; row--) {
        //     for (let col = 0 ; col < width ; col++) {
        //         if (this.actualPiece.tetromino[row][col][0] === 1) {
        //             isTile = true;
        //             if (this.board[y + row + 1][x + col][0] > 0) {
        //                 console.log(`Can't move down`);
        //                 // this.updateBoard(oldPiece);
        //                 if (this.isInGame !== false) {
        //                     this.generateNewPiece();
        //                 }
        //                 return true;
        //             }
        //         }
        //     } 
        //     if (isTile === true) 
        //         break;
        // }

        for (let col = 0 ; col < width ; col++) {
            for (let row = width - 1 ; row >= 0 ; row--) {
                if (this.actualPiece.tetromino[row][col][0] === 1) {
                    // isTile = true;
                    if (this.board[y + row + 1][x + col][0] > 0) {
                        console.log(`Can't move down`);

                        // this.updateBoard(oldPiece); // A SUPPRIMER

                        // TODO remettre ces 3 lignes
                        // if (this.isInGame !== false) {
                        //     this.generateNewPiece();
                        // }
                        return true;
                    }
                    break;
                }
            } 
            // TODO SUPPRIMER CES 2 lignes 
            // if (isTile === true) 
            //     break;
        }

        this.actualPiece.y++;
        if (goToBottom)
            return false;
        this.updateBoard(oldPiece);
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

    gameOver() {
        this.isDead = true;
        this.isInGame = false;
        console.log(`Game Over`);
        // TODO envoyer a Game
        // this.isInGame.leaveGame(this.playerName, 'died');
        // this.resetPlayer() A METTRE ? 
    }

    resetPlayer() {
        this.listOfPieces = [];
        this.isInGame = false;
        this.isDead = false;
        this.idRowBorder = ROWS;
        this.idActualPiece = -1;
        this.actualPiece = undefined;
        this.actualScore = 0;
        this.board = this.createBoard(ROWS);
        this.spectrum = this.makeSpectrum();
    }

    printBoard() {
        for (let row = 0; row < this.board.length; row++) {
            const rowValues = this.board[row].map(cell => (cell[0] === 0 ? '.' : cell[0]));
            console.log(`${rowValues.join()}`);
        }
        console.log(`\n-------\n`);
    }

    printSpectrum() {
        for (let row = 0; row < this.spectrum.length; row++) {
            const rowValues = this.spectrum[row].map(cell => (cell[0] === 0 ? '.' : cell[0]));
            console.log(`${rowValues.join()}`);
        }
        console.log(`\n-------\n`);
    }
}

module.exports = Player;

// TESTS
//
/*const player = new Player(1, 2, 3);

// player.startGame();
player.generateNewPiece();
player.moveLeft();
player.moveLeft();
player.directBottom();


player.generateNewPiece();
// player.printBoard();
player.moveLeft();
player.rotateRight();
player.moveLeft();
player.moveLeft();
// player.printBoard();
player.moveDown();
player.moveDown();
player.directBottom();
// player.printBoard();

player.generateNewPiece();
player.rotateRight();
player.moveRight();
player.moveDown();
player.moveDown();
player.moveDown();
player.moveLeft();

// ATTENTION DEVRAIT PAS MARCHER
player.moveLeft();
// player.rotateLeft();
// player.generateNewPiece();
// player.moveLeft();
// player.moveLeft()
// player.moveDown();
// player.generateNewPiece();
//
// player.printBoard();
// player.printSpectrum();

// console.log(`Bloup`);
// player.penalty(5);
// player.printBoard();
*/