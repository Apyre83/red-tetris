import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import rootReducer from './reducers';
import { createStore, applyMiddleware } from 'redux';
import '@testing-library/jest-dom';


const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe('store configuration', () => {
    it('should correctly initialize the default state from reducers', () => {
        const store = createStore(rootReducer, applyMiddleware(thunk));
        const initialState = store.getState();

        const expectedStateShape = {
            socket: {},
            auth: {},
        };

        expect(Object.keys(initialState)).toEqual(expect.arrayContaining(Object.keys(expectedStateShape)));
    });

    it('should handle actions using thunk middleware', () => {
        const store = mockStore({});

        const asyncAction = (dispatch, getState) => {
            return new Promise((resolve) => {
                setTimeout(() => {
                    dispatch({ type: 'AN_ACTION' });
                    resolve();
                }, 1000);
            });
        };

        return store.dispatch(asyncAction).then(() => {
            const actions = store.getActions();
            expect(actions[0]).toEqual({ type: 'AN_ACTION' });
        });
    });
});
