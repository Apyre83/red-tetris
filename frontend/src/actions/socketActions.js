import io from 'socket.io-client';

export const SOCKET_CONNECT = 'SOCKET_CONNECT';
export const SOCKET_DISCONNECT = 'SOCKET_DISCONNECT';
export const SOCKET_MESSAGE_RECEIVED = 'SOCKET_MESSAGE_RECEIVED';
export const SOCKET_ERROR = 'SOCKET_ERROR';

export const connectWebSocket = () => {
    return (dispatch) => {
	    const socket = io("localhost:8080/");

        socket.on('connect', () => {
            dispatch({ type: 'SET_SOCKET_REFERENCE', payload: socket });
        });

        socket.on('disconnect', () => {
            dispatch({type: SOCKET_DISCONNECT});
        });

        socket.on('error', (error) => {
            dispatch({type: SOCKET_ERROR, payload: error});
        });

        socket.on('message', (message) => {
            dispatch({type: SOCKET_MESSAGE_RECEIVED, payload: message});
        });

        dispatch({type: 'SET_SOCKET_REFERENCE', payload: socket});
    };
};
