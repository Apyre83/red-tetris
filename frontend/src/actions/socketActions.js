// Action Types
export const SOCKET_CONNECT = 'SOCKET_CONNECT';
export const SOCKET_DISCONNECT = 'SOCKET_DISCONNECT';
export const SOCKET_MESSAGE_RECEIVED = 'SOCKET_MESSAGE_RECEIVED';
export const SOCKET_ERROR = 'SOCKET_ERROR';

// Action Creator pour établir la connexion WebSocket
export const connectWebSocket = () => {
    return (dispatch) => {
        const socket = new WebSocket('ws://<your_server_address>');

        socket.onopen = () => {
            dispatch({ type: SOCKET_CONNECT });
        };

        socket.onmessage = (event) => {
            const message = event.data;
            dispatch({ type: SOCKET_MESSAGE_RECEIVED, payload: message });
        };

        socket.onerror = (error) => {
            dispatch({ type: SOCKET_ERROR, payload: error });
        };

        socket.onclose = () => {
            dispatch({ type: SOCKET_DISCONNECT });
        };

        // Vous pouvez également ajouter d'autres gestionnaires d'événements si nécessaire

        // Ajoutez une référence au socket dans le state de l'application pour l'utiliser ailleurs
        dispatch({ type: 'SET_SOCKET_REFERENCE', payload: socket });
    };
};

