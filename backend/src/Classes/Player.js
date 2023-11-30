const { ROWS, COLS } = require('../constants/numbers');
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
        this.shadow = this.makeShadow();
    }

//REFAIRE en mettant des tiles a la place pour la couleur 

    createBoard() {
        const board = [];
        for (let i = 0; i < ROWS; i++) {
            const row = Array(COLS).fill(0);
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
                    shadow[i][j] = 1;
                } else {
                    if (this.board[i][j] != 0) {
                        allColsFull[j] = true;
                        shadow[i][j] = 1;
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

    // toutes les 500 ms on fait descendre la piece
    // si la piece est bloquée on envoie une nouvelle piece
    // si clique sur un bouton mouvement 
    // faire mouvement + updateBoard
}

const player = new Player(1, 2, 3);
console.log(player.board[1][1]);
console.log(player.shadow);