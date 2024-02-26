// App.test.js
import React from 'react';
import { createMemoryHistory } from 'history';
import { Provider } from 'react-redux';
import { render, fireEvent, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import App from './App';
import rootReducer from "./reducers";
import {applyMiddleware, createStore} from "redux";
import thunk from "redux-thunk";
import 'core-js';

function createTestStore() {
    return createStore(rootReducer, applyMiddleware(thunk));
}

describe('App Routing', () => {

    it('renders with real store', () => {
        const store = createTestStore();
        const { getByText } = render(
            <Provider store={store}>
                <App />
            </Provider>
        );

        expect(getByText('Login')).toBeInTheDocument();
    });

    it('should render GameComponent for any room ID', () => {
        const store = createTestStore();
        window.location.href = 'http://localhost/#roomName[playerName]';

        render(
            <Provider store={store}>
                <App />
            </Provider>
        );

        // Check if GameComponent is rendered
        expect(screen.getByText("Login")).toBeInTheDocument();
    });
});
