const { NB_PIECES, LIST_OF_PIECES_SIZE }      = require('../constants/numbers');
const Player = require('./Player');

class Game {
    constructor(server, gameName/*, gameMaster*/) {
        this.server = server;
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

    startGame(factor_speed) {
        if (this.players.length === 0) throw new Error('No player in the game');
        else {
            this.factor_speed = factor_speed;
            this.calculateScores();
            this.gameIsRunning = true;
            this.rank = this.players.length;
            for (let i = 0 ; i < this.players.length ; i++) {
                this.alivePlayers.push(this.players[i]);
                this.players[i].listOfPieces = this.listOfPieces;
                this.players[i].isPlaying = true;
                this.players[i].game = this;
                this.players[i].startGame(this.factor_speed);
            }
        }
    }

    resetGame() {
        this.gameIsRunning = false;
        this.listOfPieces = this.generateListOfPieces();
        this.rank = 0;
        this.scores = {};
        this.alivePlayers = [/*gameMaster*/];
    }

    addPlayer(player, callback) {
        if (this.gameIsRunning) {
            callback({code: 1, error: "Game is already running"});
        }
        else {
            this.players.push(player);
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
        for (let i = 0 ; i < this.alivePlayers.length ; i++) {
            if (this.alivePlayers[i].playerName !== fromPlayerName) {
                this.alivePlayers[i].penalty(nbLines);
            }
        }
    }

    sendSpectrum(playerName, spectrum) {
        for (let i = 0 ; i < this.alivePlayers.length ; i++) {
            if (this.alivePlayers[i].playerName !== playerName) {
                this.alivePlayers[i].socket.emit('UPDATE_SPECTRUM', {spectrum: spectrum, playerName: playerName});
            }
        }
    }

    hasPlayer(playerName) {
        console.log("hasPlayer", playerName, this.gameName);
        for (const player of this.players) {
            console.log("player", player.playerName, playerName, player.playerName === playerName);
            if (player.playerName === playerName)
                return true;
        }
        return false;
    }

    getNames() { return this.players.map(player => player.playerName); }

    playerGameOver(player) {
        this.rank--;
        this.playerFinishedGame(player);
    }

    playerGiveUp(player) {
        this.rank--;
        this.playerFinishedGame(player);
    }

    playerFinishedGame(player) {
        if (player.isPlaying === true) {
            const database = this.server.readDatabase();

            database[player.playerName].allTimeScores += player.actualScore;
            this.server.writeDatabase(database);
        }
        const leftPlayers = this.alivePlayers.filter(p => p.playerName !== player.playerName);
        this.alivePlayers = leftPlayers;

        player.resetPlayer();
        this.checkIfSomeoneIsAlive();

    }

    removePlayer(player) {
        player.resetPlayer();

        const leftPlayers = this.players.filter(p => p.playerName !== player.playerName);
        this.players = leftPlayers;
    }

    checkIfSomeoneIsAlive() {
        if (this.alivePlayers.length === 1) {
            this.winner();
        } else if (this.alivePlayers.length === 0) {
            this.resetGame();
            if (this.players.length === 0) {
                this.server.closeGame(this.gameName);
            }
			else {
				for (let i = 0 ; i < this.players.length ; i++) {
                    if (this.players[i].socket) {
					    this.players[i].socket.emit('PLAYER_WINNER');
                    }
				}
				this.resetGame();
			}
        }
    }

    winner() {
        let playerWinner = this.alivePlayers[0];
        playerWinner.winner();
		for (let i = 0 ; i < this.players.length ; i++) {
            this.players[i].socket.emit('PLAYER_WINNER', {playerName: playerWinner.playerName, rank: 1, score: playerWinner.actualScore, newCreator: playerWinner.playerName});
		}
        const tmp = this.players[0];
        this.players[this.players.indexOf(playerWinner)] = tmp;
        this.players[0] = playerWinner;
        this.playerFinishedGame(playerWinner);
        this.resetGame();
    }


}

module.exports = Game;
