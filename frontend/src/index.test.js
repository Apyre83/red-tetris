import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import {applyMiddleware, createStore} from 'redux';
import { Provider } from 'react-redux';
import rootReducer from './reducers';
import App from './App';
import thunk from "redux-thunk";
import 'core-js';

function createTestStore() {
    return createStore(rootReducer, applyMiddleware(thunk));
}

describe('index.js and App Integration', () => {
    it('renders app without crashing', () => {
        const div = document.createElement('div');
        div.id = 'root';
        document.body.appendChild(div);

        const store = createTestStore();

        const { getByText } = render(
            <Provider store={store}>
                <App />
            </Provider>,
            div
        );

        expect(getByText('Login')).toBeInTheDocument();
        document.body.removeChild(div);
    });
});
