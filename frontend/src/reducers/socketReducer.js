// reducers/socketReducer.js

const initialState = {
    socket: null,
    messages: [],
    error: null
};

const socketReducer = (state = initialState, action) => {
    switch (action.type) {
        case 'SOCKET_CONNECTED':
            return { ...state, socket: action.socket };
        case 'SOCKET_MESSAGE_RECEIVED':
            return { ...state, messages: [...state.messages, action.message] };
        case 'SOCKET_ERROR':
            return { ...state, error: action.error };
        case 'SOCKET_CLOSED':
            return { ...state, socket: null };
        default:
            return state;
    }
};

export default socketReducer;

