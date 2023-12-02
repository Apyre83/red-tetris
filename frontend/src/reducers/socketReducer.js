// reducers/socketReducer.js

const initialState = {
    socket: null,
    messages: [],
    error: null
};


const socketReducer = (state = initialState, action) => {
    switch (action.type) {
        case 'SOCKET_CONNECT':
            return { ...state, socket: action.payload };
        case 'SOCKET_MESSAGE_RECEIVED':
            return { ...state, messages: [...state.messages, action.payload] };
        case 'SOCKET_ERROR':
            return { ...state, error: action.payload };
        case 'SOCKET_DISCONNECT':
            return { ...state, socket: null };
        case 'SET_SOCKET_REFERENCE':
            return { ...state, socket: action.payload };
        default:
            return state;
    }
};


export default socketReducer;

