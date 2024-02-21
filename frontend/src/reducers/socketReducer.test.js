import socketReducer from './socketReducer';

describe('socketReducer', () => {
    const initialState = {
        socket: null,
        messages: [],
        error: null
    };

    it('should return the initial state', () => {
        expect(socketReducer(undefined, {})).toEqual(initialState);
    });

    it('handles SOCKET_CONNECT by setting the socket reference', () => {
        const action = {
            type: 'SOCKET_CONNECT',
            payload: 'socket_reference',
        };
        const expectedState = {
            ...initialState,
            socket: 'socket_reference',
        };
        expect(socketReducer(initialState, action)).toEqual(expectedState);
    });

    it('handles SOCKET_MESSAGE_RECEIVED by adding a message', () => {
        const action = {
            type: 'SOCKET_MESSAGE_RECEIVED',
            payload: 'new_message',
        };
        const expectedState = {
            ...initialState,
            messages: ['new_message'],
        };
        expect(socketReducer(initialState, action)).toEqual(expectedState);
    });

    it('handles SOCKET_ERROR by setting the error', () => {
        const action = {
            type: 'SOCKET_ERROR',
            payload: 'error_message',
        };
        const expectedState = {
            ...initialState,
            error: 'error_message',
        };
        expect(socketReducer(initialState, action)).toEqual(expectedState);
    });

    it('handles SOCKET_DISCONNECT by nullifying the socket reference', () => {
        // Assuming the socket is connected initially
        const connectedState = {
            ...initialState,
            socket: 'socket_reference',
        };
        const action = {
            type: 'SOCKET_DISCONNECT',
        };
        const expectedState = {
            ...connectedState,
            socket: null,
        };
        expect(socketReducer(connectedState, action)).toEqual(expectedState);
    });

    it('handles SET_SOCKET_REFERENCE by setting the socket reference', () => {
        const action = {
            type: 'SET_SOCKET_REFERENCE',
            payload: 'new_socket_reference',
        };
        const expectedState = {
            ...initialState,
            socket: 'new_socket_reference',
        };
        expect(socketReducer(initialState, action)).toEqual(expectedState);
    });

    // Add more tests here for other actions your reducer handles
});
