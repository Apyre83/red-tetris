// const Game = require("./Game");
// const fs = require('fs');
// const Player = require("./Player");


// const username = "usertest";
// const roomname = "roomtest";

// function readDatabase() {
//     const data = fs.readFileSync('./databases/database.json', 'utf8');
//     return JSON.parse(data);
// }

// jest.useFakeTimers();

// const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

// let fakeio = () => ({
// 	id: Math.random(),
// 	emit: (...args) => {
// 		// console.log('emit', ...args);
// 	},
// 	join: (channel) => {
// 		// console.log('join', channel);
// 	},
// 	leave: () => {},
// 	on: (ev, func) => {
// 		if (ev === `event:${roomname}` || ev === 'initgame')
// 			func();
// 	},
// 	in: (channel) => ({
// 		emit: (...args) => {
// 			// console.log('in', channel, 'emit', ...args)
// 		}
// 	}),
// 	removeListener: () => {},
// 	removeAllListeners: () => {}
// })

// describe('Game class', () => {
//     test('test startGame', async () => {
//         let game = new Game(fakeio(), roomname);

//         let player = new Player(fakeio(), 'playerName', readDatabase());

//         game.addPlayer(player, () => {});
//         game.startGame();

//         expect(game.gameIsRunning).toBe(true);  

//         await sleep(2000);
        
//         player.gameOver();

//     });
// });