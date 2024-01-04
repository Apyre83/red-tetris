const { NB_PIECES, LIST_OF_PIECES_SIZE }      = require('../constants/numbers');

class Game {
    constructor(server, gameName/*, gameMaster*/) {
        this.server = server;
        this.gameName = gameName;
        this.players = [/*gameMaster*/]; /* gameMaster is always the first player of the list */
        this.listOfPieces = this.generateListOfPieces();
        this.alivePlayers = [/*gameMaster*/];
        this.rank = 0;
        this.scores = {};
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
        this.calculateScores();
        console.log("Scores : ", this.scores);
        for (let i = 0 ; i < this.players.length ; i++) {
            this.players[i].listOfPieces = this.listOfPieces;
            this.players[i].isInGame = true;
            this.players[i].game = this;
            this.players[i].startGame();
        }
    }

    calculateScores() {
        const totalPoints = this.players.length * 10;
        const scores = {
            1: Math.trunc(totalPoints / 2),
            2: Math.trunc(totalPoints / 4),
            3: Math.trunc(totalPoints / 8),
        }
        this.scores = scores;
    }

    giveScore(rank) {
        if (rank > 3) return 0;
        else return this.scores[rank];
    }

    addPlayer(player) {
        this.players.push(player);
        this.alivePlayers.push(player.playerName);
        this.rank++;
    }

    penalty(fromPlayerName, nbLines) {
        console.log(`PENALTY FROM ${fromPlayerName} : ${nbLines} lines`);
        for (let i = 0 ; i < this.players.length ; i++) {
            if (this.players[i].playerName !== fromPlayerName) {
                this.players[i].penalty(nbLines);
            //    TODO socket.emit('PENALTY', {info: `${nbLines} penalty row(s) from ${fromPlayerName}`};
            }
        }
    }

    sendSpectrum(playerName, spectrum) {
        for (let i = 0 ; i < this.players.length ; i++) {
            if (this.players[i].playerName !== playerName) {
                this.players[i].socket.emit('UPDATE_SPECTRUM', {spectrum: spectrum, playerName: playerName});
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

    playerGameOver(player) {
        this.rank--;
        console.log(`Game over for ${player.playerName} in game ${this.gameName}`);

        const database = this.server.readDatabase();
        console.log('actual score : ' + player.actualScore);
        database[player.playerName].allTimeScores += player.actualScore;
        console.log("resultat " + database[player.playerName].allTimeScores);
        this.server.writeDatabase(database);


        player.resetPlayer();
        const leftPlayers = this.alivePlayers.filter(p => p !== player.playerName);
        this.alivePlayers = leftPlayers;
        
        this.checkIfSomeoneIsAlive();
    }

    removePlayer(player) {
        this.rank--;
        console.log(`Player ${player.playerName} is removed from game ${this.gameName}`);
        player.resetPlayer();

        const leftPlayersAlive = this.alivePlayers.filter(p => p !== player.playerName);
        this.alivePlayers = leftPlayersAlive;

        const leftPlayers = this.players.filter(p => p.playerName !== player.playerName);
        this.players = leftPlayers;

        this.checkIfSomeoneIsAlive();
    }

    checkIfSomeoneIsAlive() {
        if (this.alivePlayers.length === 1) {
            this.winner();
        } else if (this.alivePlayers.length === 0) {
            // this.server.finishGame pour afficher les scores
        }
    }

    winner() {
        const winnerName = this.alivePlayers[0];
        console.log(`${winnerName} wins the game ${this.gameId}`);
        const socketWinner = this.players.find(player => player.playerName === winnerName).socket;
        socketWinner.emit('WINNER');
        // this.server.finishGame pour afficher les scores
    }
}

module.exports = Game;

// const myGame = new Game(1, 1, 1);
// console.log(myGame.listOfPieces);

