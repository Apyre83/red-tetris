const Server = require('./Server');
const ioClient = require('socket.io-client');
const Player = require('./Player');
const e = require('express');

describe('Server', () => {
    let server;
    const port = 8080;
    let clientSocket;

    beforeAll((done) => {
        server = new Server(port);
        server.start();
        done();
    });

    afterAll((done) => {
        server.server.close();
        done();
    });

    beforeEach((done) => {
        clientSocket = ioClient(`http://localhost:${port}`, {
            transports: ['websocket'],
            'force new connection': true
        });
        clientSocket.on('connect', done);
    });

    afterEach((done) => {
        if (clientSocket.connected) {
            clientSocket.disconnect();
        }
        jest.restoreAllMocks();
        done();
    });

    test('should handle disconnect event', (done) => {
        const playersBefore = server.players.length;

        clientSocket.on('disconnect', () => {
        });

        clientSocket.disconnect();

        setTimeout(() => {
            expect(server.players.length).toBe(playersBefore - 1);
            done();
        }, 100);
    });

    test('LOGIN event with valid credentials should succeed', (done) => {
        jest.spyOn(server, 'readDatabase').mockReturnValue({
            'testUser': { password: 'testPassword' }
        });

        clientSocket.emit('LOGIN', { username: 'testUser', password: 'testPassword' }, (response) => {
            expect(response.code).toBe(0);
            done();
        });
    });

    test('LOGIN event with incorrect password should fail', (done) => {
        jest.spyOn(server, 'readDatabase').mockReturnValue({
            'testUser': { password: 'testPassword' }
        });

        clientSocket.emit('LOGIN', { username: 'testUser', password: 'wrongPassword' }, (response) => {
            expect(response.code).toBe(2);
            done();
        });
    });

    test('LOGIN event with non-existing username should fail', (done) => {
        jest.spyOn(server, 'readDatabase').mockReturnValue({});

        clientSocket.emit('LOGIN', { username: 'nonExistingUser', password: 'testPassword' }, (response) => {
            expect(response.code).toBe(1);
            done();
        });
    });

    test('LOGOUT event should clear username for the disconnected player', (done) => {
        const testSocketId = clientSocket.id;
        const testUsername = 'testUser2';
        server.players.push({ socket: { id: testSocketId }, playerName: testUsername });
    
        expect(server.players.some(player => player.playerName === testUsername)).toBe(true);
    
        clientSocket.emit('LOGOUT', {}, () => {
            const player = server.players.find(player => player.socket.id === testSocketId);
            expect(player.playerName).toBe('');
            done();
        });

    });
    
});
