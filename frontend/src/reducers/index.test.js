import rootReducer from './index';
import { createStore } from 'redux';

describe('rootReducer', () => {
    let store = createStore(rootReducer);

    it('initializes the default state', () => {
        expect(store.getState().socket).toBeDefined();
        expect(store.getState().auth).toBeDefined();
    });

    it('handles actions for each reducer', () => {
        // Exemple d'action qui devrait être traitée par le authReducer
        const loginAction = {
            type: 'LOGIN_SUCCESS',
            payload: { name: 'Test User' },
        };
        store.dispatch(loginAction);

        // Vérifiez que l'état de auth a été mis à jour comme prévu
        expect(store.getState().auth.isAuthenticated).toBe(true);
        expect(store.getState().auth.user).toEqual({ name: 'Test User' });

        // Si vous avez des actions spécifiques pour socketReducer, testez-les ici de manière similaire
        // Notez que pour un test plus approfondi des reducers spécifiques, vous devriez avoir des tests dédiés pour chaque reducer
    });

    // Ajoutez d'autres tests ici selon les besoins
});
