const { NB_PIECES, LIST_OF_PIECES_SIZE }      = require('../constants/numbers');
const Player = require('./Player');

class Game {
    constructor(server, gameName/*, gameMaster*/) {
        if (typeof server !== 'object') throw new Error('Server must be an object');
        this.server = server;
        if (typeof gameName !== 'string') throw new Error('Game name must be a string');
        this.gameName = gameName;
        this.players = [/*gameMaster*/]; /* gameMaster is always the first player of the list */
        this.gameIsRunning = false;
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
        this.gameIsRunning = true;
        console.log("Scores : ", this.scores);
        for (let i = 0 ; i < this.players.length ; i++) {
            this.players[i].listOfPieces = this.listOfPieces;
            this.players[i].isPlaying = true;
            this.players[i].game = this;
            this.players[i].startGame();
        }
    }

    resetGame() {
        this.gameIsRunning = false;
        this.listOfPieces = this.generateListOfPieces();
        this.rank = 0;
        this.scores = {};
        this.alivePlayers = [/*gameMaster*/];
        for (let i = 0 ; i < this.players.length ; i++) {
            this.alivePlayers.push(this.players[i].playerName);
            this.rank++;
        }
    }

    addPlayer(player, callback) {
        if (this.gameIsRunning) {
            callback({code: 1, error: "Game is already running"});
        if (typeof player !== typeof(Player)) throw new Error('Player must be an object Player');
        } else {
            this.players.push(player);
            this.alivePlayers.push(player.playerName);
            this.rank++;
            callback({code: 0});
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
        this.playerFinishedGame(player);
    }

    playerGiveUp(player) {
        if (player.isPlaying === true) {
            this.rank--;
        }
        console.log(`Player ${player.playerName} gave up from game ${this.gameName}`);
        this.playerFinishedGame(player);
    }

    playerFinishedGame(player) {
        if (player.isPlaying === true) {
            const database = this.server.readDatabase();
            console.log('actual score : ' + player.actualScore);

            database[player.playerName].allTimeScores += player.actualScore;
            console.log("resultat " + database[player.playerName].allTimeScores);

            this.server.writeDatabase(database);

            const leftPlayers = this.alivePlayers.filter(p => p !== player.playerName);
            this.alivePlayers = leftPlayers;

            player.resetPlayer();
            this.checkIfSomeoneIsAlive();
        }

    }

    removePlayer(player) {
        console.log(`Player ${player.playerName} is removed from game ${this.gameName}`);
        player.resetPlayer();

        const leftPlayers = this.players.filter(p => p.playerName !== player.playerName);
        this.players = leftPlayers;
    }

    checkIfSomeoneIsAlive() {
        if (this.alivePlayers.length === 1) {
            this.winner();
        } else if (this.alivePlayers.length === 0) {
			console.log("No one is alive");
            this.resetGame();
            if (this.players.length === 0) {
                this.server.closeGame(this.gameName);
            }
        }
    }

    winner() {
		let playerWinner = this.players.filter(p => p.playerName === this.alivePlayers[0])[0];
        playerWinner.winner();
		for (let i = 0 ; i < this.players.length ; i++) {
            this.players[i].socket.emit('PLAYER_WINNER', {playerName: playerWinner.playerName, rank: 1, score: playerWinner.actualScore});
		}
        this.playerFinishedGame(playerWinner);
        this.resetGame();
    }


}

module.exports = Game;
