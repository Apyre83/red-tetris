const { NB_PIECES, LIST_OF_PIECES_SIZE }      = require('../constants/numbers');

class Game {
    constructor(server, gameName/*, gameMaster*/) {
        this.server = server;
        this.gameName = gameName;
        this.players = [/*gameMaster*/]; /* gameMaster is always the first player of the list */
        this.listOfPieces = this.generateListOfPieces();
        this.alivePlayers = [/*gameMaster*/];
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
        this.alivePlayers.push(player.playerName);
    }

    removePlayer(playerName) {
        const player = this.players.find(player => player.playerName === playerName);
        if (player) {
            player.resetPlayer();
        }
        this.players = this.players.filter(p => p.playerName !== playerName);
        this.alivePlayers = this.alivePlayers.filter(p => p.playerName !== playerName);
    }

    // TODO no need ? A gerer dans le front ? Puisque c'est Player qui envoie updateBoard
    updateBoard(playerName) {
        for (let i = 0 ; i < this.players.length ; i++) {
            if (this.players[i].playerName === playerName) {
                // TODO socket.emit('UPDATE_BOARD');
            } else {
                // TODO socket.emit('UPDATE_SPECTRUM')
            }
        }
    }

    penalty(fromPlayerName, nbLines) {
        for (let i = 0 ; i < this.players.length ; i++) {
            if (this.players.playerName !== fromPlayerName) {
                this.players[i].penalty(nbLines);
                const info = `${nbLines} penalty row(s) from ${fromPlayerName}`;
                // TODO socket.emit('PENALTY', info);
            }
        }
    }

    hasPlayer(playerName) {
        for (const player of this.players) {
            if (player.playerName === playerName)
                return true;
        }
        return false;
    }

    getNames() { return this.players.map(player => player.playerName); }

    winner(winnerName) {
        console.log(`${winnerName} wins the game ${`this.gameId`}`);
        // TODO socket.emit('WINNER');
        // TODO this.server.closeGame(this.gameId);
    }
}

module.exports = Game;

// const myGame = new Game(1, 1, 1);
// console.log(myGame.listOfPieces);

