
const initialAuthState = {
    isAuthenticated: false,
    user: null,
};

const authReducer = (state = initialAuthState, action) => {
    switch (action.type) {
        case 'LOGIN_SUCCESS':
            return { ...state, isAuthenticated: true, user: action.payload };
        case 'LOGOUT':
            return { ...state, isAuthenticated: false, user: null };
        default:
            return state;
    }
};

export default authReducer;
