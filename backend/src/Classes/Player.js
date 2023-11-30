const { ROWS, COLS }    = require('../constants/numbers');
const colors            = require('../constants/colors');
// const ROWS = 4;
// const COLS = 4;

// class Player:	
// int		_id;	
// Socket	_socket;	
// list*	_board;	
// Game*	_isInRoom;	
// bool	_isDead;	
// int		_ranking;	
// char*	_name;	
// int		_idActualPiece;		
// Piece	_actualPiece;	
// Int		_timeSinceLastAction;	
// int		_allTimeScores;	
// int		_scoreActualGame;

// function :	function moveLeft() => void;	
// function moveRight() => void;	
// function moveDown() => void;	
// function DirectBotton() => void;	
// function rotateRight() => void;	
// function rotateLeft() => void;	

// function updateBoard() => void;

// function pause() => void;		
// function	generateNewPiece() => piece	
// function	isDead => booleen	
// function sendShadowToRoom() => void	
// function	fallPiece() => void 	
// function sendShadowToRoom() => void;

class Player {
    constructor(id, socket, name) {
        this.id = id;
        this.socket = socket;
        this.name = name;
        this.ranking = 0;
        this.allTimeScores = 0;
        this.isinRoom = 0;
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