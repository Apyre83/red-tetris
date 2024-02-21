import authReducer from './authReducer';

describe('authReducer', () => {
    it('should return the initial state', () => {
        expect(authReducer(undefined, {})).toEqual({
            isAuthenticated: false,
            user: null
        });
    });

    it('should handle LOGIN_SUCCESS', () => {
        const successAction = {
            type: 'LOGIN_SUCCESS',
            payload: { name: 'Test User' }
        };
        expect(authReducer(undefined, successAction)).toEqual({
            isAuthenticated: true,
            user: successAction.payload
        });
    });

    it('should handle LOGOUT', () => {
        const logoutAction = {
            type: 'LOGOUT',
        };
        // Appliquer LOGIN_SUCCESS d'abord pour mettre l'utilisateur dans l'état connecté
        const loggedInState = authReducer(undefined, {
            type: 'LOGIN_SUCCESS',
            payload: { name: 'Test User' }
        });
        expect(authReducer(loggedInState, logoutAction)).toEqual({
            isAuthenticated: false,
            user: null
        });
    });

    it('should handle AUTH_ERROR', () => {
        const errorAction = {
            type: 'AUTH_ERROR',
            payload: 'Login failed'
        };
        expect(authReducer(undefined, errorAction)).toEqual({
            isAuthenticated: false,
            user: null
        });
    });
});
