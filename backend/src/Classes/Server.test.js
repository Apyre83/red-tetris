const request = require('supertest');
const Server = require('./Server');

describe('Server', () => {
    let server_test;

    beforeEach(() => {
        server_test = new Server(8080);
    });

    afterEach(async () => {
        await server_test.server.close();
    });

    test('server constructor', () => {
        expect(server_test).toBeInstanceOf(Server);
    });

    test('start() should launch the server', () => {
        const configureAppSpy = jest.spyOn(server_test, 'configureApp');
        const handleSocketConnectionsSpy = jest.spyOn(server_test, 'handleSocketConnections');  

        server_test.start();

        expect(configureAppSpy).toHaveBeenCalledTimes(1);
        expect(handleSocketConnectionsSpy).toHaveBeenCalledTimes(1);

        configureAppSpy.mockRestore();
        handleSocketConnectionsSpy.mockRestore();
    });
});
