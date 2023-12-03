const { NB_PIECES, LIST_OF_PIECES_SIZE }      = require('../constants/numbers');

class Game {
    constructor(server, id, name, gameMaster) {
        this.server = server;
        this.id = id;
        this.name = name;
        this.gameMaster = gameMaster;
        this.players = [gameMaster];
        this.listOfPieces = this.generateListOfPieces();
        this.alivePlayers = [gameMaster.name];
        this.listOfPieces = createListOfPieces();
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

    addPlayer(newPlayer) {
        this.players.push(newPlayer);
        this.alivePlayers.push(newPlayer.name);
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

    leaveGame(playerName, wayOfLeaving) {
        if (wayOfLeaving === 'left')
            console.log(`The user ${playerName} left the game ${this.gameId}`);
        else 
            console.log(`The user ${playerName} died in the game ${this.gameId}`);
        // TODO io.emit('SOMEONE_LEAVE')
        if (this.gameMaster.name === playerName) {
            this.players.shift();
            if (this.players.length === 0) {
                console.log(`The game ${this.gameId} is closed`);
                // TODO this.server.closeGame(this.gameId);
            } else {
                this.gameMaster = this.players[0];
                console.log(`New game master of the game ${this.gameId} is ${this.gameMaster.name}`);
                // TODO io.emit('NEW_GAMEMASTER' )
            }
        } else {
            this.players = this.players.filter(player => player.name !== playerName);
        }
        this.alivePlayers = this.alivePlayers.filter(player => player !== playerName);
        if (this.alivePlayers.length === 1) {
            this.winner(this.alivePlayers[0]);
        }
    }

    penalty(fromPlayerName, nbLines) {
        for (let i = 0 ; i < this.players.length ; i++) {
            if (this.players.name !== fromPlayerName) {
                this.players[i].penalty(nbLines);
                const info = `${nbLines} penalty row(s) from ${fromPlayerName}`;
                // TODO io.emit('PENALTY', info);
            }
        }
    }

    winner(winnerName) {
        console.log(`${winnerName} wins the game ${`this.gameId`}`);
        // TODO io.emit('WINNER');
        // TODO this.server.closeGame(this.gameId);
    }
}

const myGame = new Game(1, 1, 1);
console.log(myGame.listOfPieces);