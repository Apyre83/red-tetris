const { 
    ROWS, 
    COLS, 
    BORDER_WIDTH, 
    INIT_TIME_MS }                      = require('../constants/numbers');
const colors                            = require('../constants/colors');
const Piece                             = require('./Piece');
const fs = require("fs");

const DATABASE_FILE = "./databases/database.json";

class Player {
    constructor(socket, playerName) {
        this.socket = socket;
        this.playerName = playerName;
        this.database = this.readDatabase();
        this.ranking = 0;
        this.listOfPieces = [];
        this.game = undefined;
        this.isPlaying = false;
        this.idRowBorder = ROWS;
        this.idActualPiece = -1;
        this.actualPiece = undefined;
        this.actualScore = 0;
        this.board = this.createBoard(ROWS);
        this.spectrum = this.makeSpectrum();
    }

    readDatabase() {
        const data = fs.readFileSync(DATABASE_FILE, 'utf8');
        return JSON.parse(data);
    }

    writeDatabase(data) {
        fs.writeFileSync(DATABASE_FILE, JSON.stringify(data, null, 2), 'utf8');
    }

    startGame(factor_difficulty) {
        this.listOfPieces = this.game.listOfPieces;
        this.generateNewPiece();
        var interval = setInterval(() => {
            if (this.isPlaying === false) {
                clearInterval(interval);
            }
            this.moveDown();
            if (this.isPlaying === true) {
                this.doubleCheckPenalty();
            }
        }, INIT_TIME_MS * factor_difficulty);

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

        for (let col = BORDER_WIDTH ; col < COLS + BORDER_WIDTH ; col++) {
            if (this.board[3][col][0] != 0) {
                this.gameOver();
                return;
            }
        }

        for (let row = 0 ; row < this.actualPiece.width ; row++) {
            for (let col = 0; col < this.actualPiece.width ; col++) {
                if (this.actualPiece.tetromino[row][col][0] === 1) {
                    this.board[this.actualPiece.y + row][this.actualPiece.x + col] = this.actualPiece.tetromino[row][col];
                }
            }
        }
        this.updateBoard();
    }

    penalty(nbLines) {
        for (let i = 0 ; i < nbLines ; i++) {
            this.idRowBorder--;
            if (this.idRowBorder === 3) {
                this.gameOver();
                return;
            }
            for (let col = BORDER_WIDTH ; col < COLS + BORDER_WIDTH; col++) {
                this.board[this.idRowBorder][col] = [1, colors.border];
            }
        }
        this.updateBoard();
    }

    doubleCheckPenalty() {
        if (this.idRowBorder === 3) {
            this.gameOver();
            return;
        }
        for (let col = BORDER_WIDTH ; col < COLS + BORDER_WIDTH; col++) {
            this.board[this.idRowBorder][col] = [1, colors.border];
        }
        this.updateBoard();
    }

    supprLines(completeLines) {
        this.actualScore += Number(completeLines.length);
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
            for (let col = BORDER_WIDTH ; col < COLS + BORDER_WIDTH ; col++) {
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
            this.game.penalty(this.playerName, completeLines.length - 1);
    }

    convertBoardForDisplay(originalBoard) {
        const rowsToShow = 21;

        const displayBoard = originalBoard.slice(-rowsToShow);
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
        this.makeSpectrum();
        if (this.isPlaying !== false) {
            let tmpBoard = this.convertBoardForDisplay(this.board);
            this.socket.emit('UPDATE_BOARD', {board: this.convertBoardForDisplay(this.board), name: this.playerName});
            this.game.sendSpectrum(this.playerName, this.convertBoardForDisplay(this.spectrum));
        }
    }

    makeSpectrum() {
        let spectrum = this.createBoard(ROWS);
        let boardWithoutPiece = JSON.parse(JSON.stringify(this.board));

        if (this.actualPiece) {
            for (let row = 0 ; row < this.actualPiece.width ; row++) {
                for (let col = 0; col < this.actualPiece.width ; col++) {
                    if (this.actualPiece.tetromino[row][col][0] === 1) {
                        boardWithoutPiece[this.actualPiece.y + row][this.actualPiece.x + col] = [0, colors.empty];
                    }
                }
            }
        }
         
        const allColsFull = {};
        for (let i = 0; i < ROWS; i++) {
            for (let j = BORDER_WIDTH; j < COLS + BORDER_WIDTH; j++) {
                if (allColsFull[j]) {
                    spectrum[i][j] = [1, colors.full];
                } else {
                    if (boardWithoutPiece[i][j][0] !== 0) {
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

        for (let row = 0 ; row < width ; row++) {    
            for (let col = 0 ; col < width ; col++) {
                if (this.actualPiece.tetromino[row][col][0] === 1) {
                    if (this.board[y + row][x + col - 1][0] > 0) {
                        return;
                    }
                    break;
                }
            } 
        }
        const oldPiece = JSON.parse(JSON.stringify(this.actualPiece));
        this.actualPiece.x--;
        this.updateBoard(oldPiece);
    }

    moveRight() {
        const width = this.actualPiece.width;
        const x     = this.actualPiece.x;
        const y     = this.actualPiece.y;

        for (let row = 0 ; row < width ; row++) {
            for (let col = width - 1 ; col >= 0 ; col--) {
                if (this.actualPiece.tetromino[row][col][0] === 1) {
                    if (this.board[y + row][x + col + 1][0] > 0) {
                        return;
                    }
                    break;
                }
            } 
        }
        const oldPiece = JSON.parse(JSON.stringify(this.actualPiece));
        this.actualPiece.x++;
        this.updateBoard(oldPiece);
    }

    moveDown(goToBottom) {
        if (this.isPlaying !== false) {
            const width = this.actualPiece.width;
            const oldPiece = JSON.parse(JSON.stringify(this.actualPiece));
            const x     = this.actualPiece.x;
            const y     = this.actualPiece.y;

            for (let col = 0 ; col < width ; col++) {
                for (let row = width - 1 ; row >= 0 ; row--) {
                    if (this.actualPiece.tetromino[row][col][0] === 1) {
                        if (this.board[y + row + 1][x + col][0] > 0) {
                            if (goToBottom) {
                                return true;
                            }
                            this.checkCompleteLines();
                            if (this.isPlaying !== false) {
                                this.generateNewPiece();
                            }
                            return;
                        }
                        break;
                    }
                } 
            }

            this.actualPiece.y++;
            if (goToBottom)
                return false;
            this.updateBoard(oldPiece);
        }
    }

    directBottom() {
        const oldPiece = JSON.parse(JSON.stringify(this.actualPiece));
        let isAtBottom = false;
        while (isAtBottom === false) {
            isAtBottom = this.moveDown(true);
        }
        this.updateBoard(oldPiece);
        this.checkCompleteLines();
        if (this.isPlaying !== false) {
            this.generateNewPiece();
        }
    }

    canRotate(rotatedTetromino) {
        const   width = this.actualPiece.width;
        const   board = JSON.parse(JSON.stringify(this.board));
        const   x     = this.actualPiece.x;
        const   y     = this.actualPiece.y;

        for (let row = 0 ; row < width ; row++) {
            for (let col = 0; col < width ; col++) {
                if (this.actualPiece.tetromino[row][col][0] === 1) {
                    board[y + row][x + col] = [0, colors.empty];
                }
            }
        }

        for (let row = 0 ; row < width ; row++) {   
            for (let col = 0; col < width ; col++) {
                    if ((y + row < 0 || x + col < 0)) {
                        return false;
                    }
                    if (rotatedTetromino[row][col][0] === 1) {
                        if (board[y + row][x + col][0] === 1) {
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
        const rank = this.game.rank;
        this.actualScore += this.game.giveScore(rank);

        this.database = this.readDatabase();
        this.socket.emit('PLAYER_GAME_OVER', {playerName: this.playerName, rank: rank, score: this.actualScore, allTimeScore: this.database[this.playerName].allTimeScores });
        this.game.playerGameOver(this);
    }

    giveUp() {
        const rank = this.game.rank;
        this.isPlaying = false;
        this.game.playerGiveUp(this);

        this.database = this.readDatabase();
		return {rank: rank, score: this.actualScore, allTimeScore: this.database[this.playerName].allTimeScores };
    }

    winner() {
        const rank = this.game.rank;
        this.actualScore += this.game.giveScore(rank);
    }

    resetPlayer() {
        this.listOfPieces = [];
        this.isPlaying = false;
        this.isDead = false;
        this.idRowBorder = ROWS;
        this.idActualPiece = -1;
        this.actualPiece = undefined;
        this.actualScore = 0;
        this.board = this.createBoard(ROWS);
        this.spectrum = this.makeSpectrum();
        this.rank = 0;
    }
}

module.exports = Player;
