const { NB_PIECES, LIST_OF_PIECES_SIZE }      = require('../constants/numbers');

class Game {
    constructor(server, name) {
        this.server = server;
        this.name = name;
        this.players = []; /* gameMaster is always the first player of the list */
        this.listOfPieces = this.generateListOfPieces();
        this.alivePlayers = [];
    }


    generateListOfPieces() {
        const min = 0;
        const max = NB_PIECES - 1;
        const list = []

        for (let i = 0; i < LIST_OF_PIECES_SIZE ; i++) {
            const randomNb = Math.floor(Math.random() * (max - min + 1)) + min;
            list.push(randomNb);
        }
        return list;
    }

    startGame() {
        for (let i = 0 ; i < this.players.length ; i++) {
            this.players[i].listOfPieces = this.listOfPieces;
            this.players[i].isInGame = this;
            this.players[i].startGame();
        }
    }

    addPlayer(player) {
        this.players.push(player);
        this.alivePlayers.push(player.name);
    }
    removePlayer(playerName) {
        this.players = this.players.filter(p => p.name !== playerName);
        this.alivePlayers = this.alivePlayers.filter(p => p !== playerName);
    }


    updateBoard(playerName) {
        for (let i = 0 ; i < this.players.length ; i++) {
            if (this.players[i].name === playerName) {
                // TODO io.emit('UPDATE_BOARD');
            } else {
                // TODO io.emit('UPDATE_SPECTRUM')
            }
        }
    }

    // leaveGame(playerName, wayOfLeaving) {
    //     if (wayOfLeaving === 'left')
    //         console.log(`The user ${playerName} left the game ${this.gameId}`);
    //     else
    //         console.log(`The user ${playerName} died in the game ${this.gameId}`);
    //     // TODO io.emit('SOMEONE_LEAVE')
    //     if (this.gameMaster.name === playerName) {
    //         this.players.shift();
    //         if (this.players.length === 0) {
    //             console.log(`The game ${this.gameId} is closed`);
    //             // TODO this.server.closeGame(this.gameId);
    //         } else {
    //             this.gameMaster = this.players[0];
    //             console.log(`New game master of the game ${this.gameId} is ${this.gameMaster.name}`);
    //             // TODO io.emit('NEW_GAMEMASTER' )
    //         }
    //     } else {
    //         this.players = this.players.filter(player => player.name !== playerName);
    //     }
    //     this.alivePlayers = this.alivePlayers.filter(player => player !== playerName);
    //     if (this.alivePlayers.length === 1) {
    //         this.winner(this.alivePlayers[0]);
    //     }
    // }

    penalty(fromPlayerName, nbLines) {
        for (let i = 0 ; i < this.players.length ; i++) {
            if (this.players.name !== fromPlayerName) {
                this.players[i].penalty(nbLines);
                const info = `${nbLines} penalty row(s) from ${fromPlayerName}`;
                // TODO io.emit('PENALTY', info);
            }
        }
    }

    hasPlayer(playerName) {
        for (const player of this.players) {
            if (player.name === playerName)
                return true;
        }
        return false;
    }

    getNames() { return this.players.map(player => player.name); }

    winner(winnerName) {
        console.log(`${winnerName} wins the game ${`this.gameId`}`);
        // TODO io.emit('WINNER');
        // TODO this.server.closeGame(this.gameId);
    }
}

// const myGame = new Game(1, 1, 1);
// console.log(myGame.listOfPieces);

module.exports = Game;