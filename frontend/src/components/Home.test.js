import React from 'react';
import {act, fireEvent, render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import Home from './Home';
import { initialState as authInitialState } from './../reducers/authReducer';
import { initialState as socketInitialState } from './../reducers/socketReducer';
import configureMockStore from 'redux-mock-store';
import { waitFor } from '@testing-library/react';

const mockStore = configureStore();
const mockSocket = {
    emit: jest.fn(),
    on: jest.fn(),
    off: jest.fn()
};

const initialState = {
    auth: {
        isAuthenticated: false,
        user: null
	},
    socket: {
        socket: mockSocket
    }
};

describe('Home Component', () => {
    let store;

    beforeEach(() => {
        store = mockStore(initialState);
    });

    it('should display login form when not authenticated', () => {
        render(
            <Provider store={store}>
                <Home />
            </Provider>
        );

        expect(screen.getByText('Login')).toBeInTheDocument();
        expect(screen.getByText('Register')).toBeInTheDocument();
    });

    it('should handle network errors gracefully when creating a game', async () => {
        const modifiedState = {
            ...initialState,
            auth: { isAuthenticated: true }
        };
        store = mockStore(modifiedState);

        mockSocket.emit.mockImplementationOnce((event, data, callback) => {
            if (event === 'CREATE_GAME') {
                callback({ code: 1, error: 'Network error' });
            }
        });

        render(
            <Provider store={store}>
                <Home />
            </Provider>
        );

        fireEvent.click(screen.getByText('Create game'));

        await waitFor(() => {
            expect(screen.getByText('Please enter a room name.')).toBeInTheDocument();
        });
    });

    it('should display error message when game name is not entered in handleJoinGame', () => {
        const modifiedState = {
            ...initialState,
            auth: { ...authInitialState, isAuthenticated: true, user: 'testUser' }
        };
        store = mockStore(modifiedState);

        render(
            <Provider store={store}>
                <Home />
            </Provider>
        );

        const joinGameButton = screen.getByText('Join');
        fireEvent.click(joinGameButton);

        expect(screen.getByText('Please enter a valid room name.')).toBeInTheDocument();
    });

    it('should emit JOIN_GAME event with correct parameters', () => {
        const modifiedState = {
            ...initialState,
            auth: { ...authInitialState, isAuthenticated: true, user: 'mockUser' }
        };
        store = mockStore(modifiedState);
        render(
            <Provider store={store}>
                <Home />
            </Provider>
        );

        fireEvent.change(screen.getByPlaceholderText('Game name'), { target: { value: 'testGame' } });
        fireEvent.click(screen.getByText('Join'));

        expect(mockSocket.emit).toHaveBeenCalledWith('JOIN_GAME', { gameName: 'testGame', playerName: 'mockUser' }, expect.any(Function));
    });

    it('should display the correct form based on the showLogin state', () => {
        const modifiedState = {
            ...initialState,
            auth: { isAuthenticated: false }
        };
        store = mockStore(modifiedState);

        render(
            <Provider store={store}>
                <Home />
            </Provider>
        );

        expect(screen.getByText('Login')).toBeInTheDocument();

        fireEvent.click(screen.getByText('Register'));

        expect(screen.getByText('Email')).toBeInTheDocument();
    });

    it('should display the game options when authenticated', () => {
        const modifiedState = {
            ...initialState,
            auth: { ...authInitialState, isAuthenticated: true, user: 'testUser' },
            socket: { ...socketInitialState, socket: mockSocket }
        };
        store = mockStore(modifiedState);
        render(
            <Provider store={store}>
                <Home />
            </Provider>
        );

        expect(screen.getByText('Authenticated as testUser')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Game name')).toBeInTheDocument();
        expect(screen.getByText('Join')).toBeInTheDocument();
        expect(screen.getByText('Create game')).toBeInTheDocument();
    });

    it('should emit create game event with unique game name and player name on create game button click', () => {
        const modifiedState = {
            ...initialState,
            auth: { ...authInitialState, isAuthenticated: true, user: 'testUser' }
        };
        store = mockStore(modifiedState);
        render(
            <Provider store={store}>
                <Home />
            </Provider>
        );

        const gameNameInput = screen.getByPlaceholderText('Game name');
        fireEvent.change(gameNameInput, { target: { value: 'uniqueGameName' } });
        const createGameButton = screen.getByText('Create game');
        fireEvent.click(createGameButton);

        expect(mockSocket.emit).toHaveBeenCalledWith('CREATE_GAME', expect.anything(), expect.any(Function));
    });

    it('should display an error message when game creation fails', async () => {
        const modifiedState = {
            ...initialState,
            auth: { ...authInitialState, isAuthenticated: true, user: 'testUser' }
        };
        store = mockStore(modifiedState);

        mockSocket.emit.mockImplementationOnce((event, data, callback) => {
            if (event === 'CREATE_GAME') {
                callback({ code: 1, error: 'Error creating game' });
            }
        });

        render(
            <Provider store={store}>
                <Home />
            </Provider>
        );

        fireEvent.click(screen.getByText('Create game'));

        const errorMessage = await screen.findByText('Create game');
        expect(errorMessage).toBeInTheDocument();
    });

    it('should display an error if attempting to join a game without entering a game name', () => {
        const modifiedState = {
            ...initialState,
            auth: { ...authInitialState, isAuthenticated: true, user: 'testUser' }
        };
        store = mockStore(modifiedState);
        render(
            <Provider store={store}>
                <Home />
            </Provider>
        );

        const joinGameButton = screen.getByText('Join');
        fireEvent.click(joinGameButton);

        expect(screen.getByText('Please enter a valid room name.')).toBeInTheDocument();
    });

    it('should display the login modal when the user is not authenticated', () => {
        const modifiedState = {
            ...initialState,
            auth: { ...authInitialState, isAuthenticated: false }
        };
        store = mockStore(modifiedState);
        render(
            <Provider store={store}>
                <Home />
            </Provider>
        );

        expect(screen.getByText('Login')).toBeInTheDocument();
        expect(screen.getByText('Register')).toBeInTheDocument();
    });

    it('should update score on GET_SCORE event from socket', async () => {

        mockSocket.emit.mockImplementationOnce((event, data, callback) => {
            if (event === 'GET_SCORE') {
                callback({ code: 0, score: 15 });
            }
        });

        const initialState = {
            auth: { isAuthenticated: true, user: 'testUser' },
            socket: { socket: mockSocket }
        };
        const store = configureMockStore()(initialState);

        await act(async () => {
            render(
                <Provider store={store}>
                    <Home />
                </Provider>
            );
        });

        mockSocket.emit('GET_SCORE', { playerName: 'testUser' }, (data) => {
            expect(data).toEqual({ code: 0, score: 15 });
        });

        await waitFor(() => {
            expect(screen.getByText('Score: 15')).toBeInTheDocument();
        });
    });

    it('should switch between login and register form', () => {
        store = mockStore(initialState);
        render(
            <Provider store={store}>
                <Home />
            </Provider>
        );

        expect(screen.getByText('Login')).toBeInTheDocument();

        fireEvent.click(screen.getByText('Register'));

        expect(screen.getByText('Email')).toBeInTheDocument();
    });

    it('should display an error message if joining a game fails', async () => {
        mockSocket.emit.mockImplementationOnce((event, data, callback) => {
            if (event === 'JOIN_GAME') {
                callback({ code: 1, error: 'Please enter a valid room name.' });
            }
        });

        const modifiedState = {
            ...initialState,
            auth: { ...authInitialState, isAuthenticated: true, user: 'testUser' }
        };
        store = mockStore(modifiedState);

        render(
            <Provider store={store}>
                <Home />
            </Provider>
        );

        fireEvent.click(screen.getByText('Join'));

        const errorMessage = await screen.findByText('Please enter a valid room name.');
        expect(errorMessage).toBeInTheDocument();
    });

    it('should emit CREATE_GAME event and redirect on successful game creation', async () => {
        // Simuler une création de jeu réussie
        mockSocket.emit.mockImplementation((event, data, callback) => {
            if (event === 'CREATE_GAME') {
                callback({ code: 0 }); // Simulation d'une réponse réussie
            }
        });

        const modifiedState = {
            auth: { isAuthenticated: true, user: 'testUser' },
            socket: { socket: mockSocket }
        };
        store = mockStore(modifiedState);

        Object.defineProperty(window, 'location', {
            writable: true,
            value: { href: '' }
        });

        render(
            <Provider store={store}>
                <Home />
            </Provider>
        );

        fireEvent.change(screen.getByPlaceholderText('Game name'), { target: { value: 'newGame' } });
        fireEvent.click(screen.getByText('Create game'));

        expect(mockSocket.emit).toHaveBeenCalledWith('CREATE_GAME', expect.anything(), expect.any(Function));
    });

    it('should redirect on successful game join', async () => {
        delete window.location;
        window.location = { href: '', assign: jest.fn() };

        const tmpMockSocket = {
            emit: jest.fn( (event, data, callback) => {
                if (event === 'JOIN_GAME') {
                    callback({ code: 0, gameName: 'testGame', playerName: 'testUser' });
                }
            }),
            on: jest.fn(),
            off: jest.fn()
        };

        const modifiedState = {
            ...initialState,
            auth: { ...authInitialState, isAuthenticated: true, user: 'testUser' },
            socket: { socket: tmpMockSocket }
        };
        store = mockStore(modifiedState);

        render(
            <Provider store={store}>
                <Home />
            </Provider>
        );

        const gameInput = screen.getByPlaceholderText('Game name');
        fireEvent.change(gameInput, { target: { value: 'testGame' } });
        fireEvent.click(screen.getByText('Join'));

        await waitFor(() => {
            expect(tmpMockSocket.emit).toHaveBeenCalledWith('JOIN_GAME', { gameName: 'testGame', playerName: 'testUser' }, expect.any(Function));
        });

        await waitFor(() => {
            expect(window.location.href).toContain('testGame');
        });
    });
});


