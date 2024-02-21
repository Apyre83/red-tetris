import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import * as actions from './socketActions';
import io from 'socket.io-client';

// Mock de socket.io-client
jest.mock('socket.io-client');

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe('socketActions', () => {
    let store;

    beforeEach(() => {
        store = mockStore({});
        // Réinitialiser tous les mocks
        jest.clearAllMocks();
        // Configurer un mock de socket
        io.mockImplementation(() => ({
            on: jest.fn((event, callback) => {
                switch (event) {
                    case 'connect':
                        callback();
                        break;
                    case 'disconnect':
                        callback();
                        break;
                    case 'error':
                        callback('error');
                        break;
                    case 'message':
                        callback('message');
                        break;
                    default:
                        break;
                }
            }),
            emit: jest.fn(),
        }));
    });

    it('dispatches SET_SOCKET_REFERENCE on socket connect', () => {
        const expectedActions = [
            { type: 'SET_SOCKET_REFERENCE', payload: expect.anything() },
        ];

        store.dispatch(actions.connectWebSocket());

        expect(store.getActions()).toEqual(expect.arrayContaining(expectedActions));
        expect(io).toHaveBeenCalledTimes(1); // Vérifie que io a été appelé pour créer le socket
    });

    // Test pour les autres événements de socket comme disconnect, error, et message
    it('dispatches SOCKET_DISCONNECT on socket disconnect', () => {
        store.dispatch(actions.connectWebSocket());
        expect(store.getActions()).toContainEqual({ type: actions.SOCKET_DISCONNECT });
    });

    it('dispatches SOCKET_ERROR on socket error', () => {
        store.dispatch(actions.connectWebSocket());
        expect(store.getActions()).toContainEqual({ type: actions.SOCKET_ERROR, payload: 'error' });
    });

    it('dispatches SOCKET_MESSAGE_RECEIVED on socket message', () => {
        store.dispatch(actions.connectWebSocket());
        expect(store.getActions()).toContainEqual({ type: actions.SOCKET_MESSAGE_RECEIVED, payload: 'message' });
    });
});
