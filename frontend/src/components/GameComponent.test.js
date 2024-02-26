import {Provider} from "react-redux";
import GameComponent from "./GameComponent";
import configureStore from "redux-mock-store";
import {act, fireEvent, render, screen} from "@testing-library/react";
import "@testing-library/jest-dom";
import {HashRouter as Router} from "react-router-dom";

const mockStore = configureStore();
const mockSocket = {
    emit: jest.fn(),
    on: jest.fn(),
    off: jest.fn()
}

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'), // Spread in all the actual exported values
    useNavigate: () => mockNavigate, // Return the mock function
}));

describe('GameComponent', () => {
    let store;
    let component;
    let socket;

    beforeEach(() => {
        store = mockStore({
            auth: {
                isAuthenticated: true,
                user: 'testUser'
            },
            socket: {
                socket: mockSocket
            }
        });
    });

    it('should render', () => {
        component = render(
            <Provider store={store}>
                <Router>
                    <GameComponent />
                </Router>
            </Provider>
        );

        expect(component).toBeTruthy();
    });
    it('should render login form if user is not authenticated', () => {
        store = mockStore({
            auth: {
                isAuthenticated: false,
                user: ''
            },
            socket: {
                socket: mockSocket
            }
        });

        component = render(
            <Provider store={store}>
                <Router>
                    <GameComponent />
                </Router>
            </Provider>
        );

        expect(screen.getByText('Login')).toBeInTheDocument();
        expect(screen.getByText('Register')).toBeInTheDocument();
        expect(screen.getByText('Username')).toBeInTheDocument();
        fireEvent.click(screen.getByText('Register'));
        expect(screen.getByText('Username')).toBeInTheDocument();
        expect(screen.getByText('Email')).toBeInTheDocument();
        expect(screen.getByText('Password')).toBeInTheDocument();
        expect(screen.getByText('Login')).toBeInTheDocument();

    });
    it ('should render game component if user is authenticated', async () => {
        mockSocket.emit.mockImplementation((event, data, callback) => {
            if (event === 'GET_SCORE') {
                callback({code: 0, score: 100});
            }
        });

        component = render(
            <Provider store={store}>
                <Router>
                    <GameComponent />
                </Router>
            </Provider>
        );

        mockSocket.emit('GET_SCORE', { playerName: 'testUser' }, (data) => {
            expect(data.code).toBe(0);
            expect(data.score).toBe(100);
        });
        expect(screen.getByText('Score: 100')).toBeInTheDocument();
        expect(screen.getByText('Authenticated as testUser')).toBeInTheDocument();
        expect(screen.getByText('Home')).toBeInTheDocument();
    });
    it('should set the user as creator if the incoming data from server says so', async () => {
        await act(async () => {
            render(
                <Provider store={store}>
                    <Router>
                        <GameComponent />
                    </Router>
                </Provider>
            )
        });

        await act(async () => {
            mockSocket.on.mock.calls.forEach(([event, callback]) => {
                if (event === 'USER_JOIN_GAME') {
                    callback({
                        players: ['testUser'],
                        creator: 'testUser'
                    });
                }
            });
        });

        expect(screen.getByText('Start')).toBeInTheDocument();
        expect(screen.getByText('You are the creator')).toBeInTheDocument();

    });
    it('should not set the user as creator if the incoming data from server says so', async () => {

        /* Setup false server */
        mockSocket.on.mockImplementation((event, callback) => {
            if (event === 'USER_JOIN_GAME') {
                callback({
                    players: ['testUser'],
                    creator: 'anotherUser'
                });
            }
        });

        await act(async () => {
            render(
                <Provider store={store}>
                    <Router>
                        <GameComponent />
                    </Router>
                </Provider>
            )
        });

        await act(async () => {
            mockSocket.on.mock.calls.forEach(([event, callback]) => {
                if (event === 'USER_JOIN_GAME') {
                    callback({
                        players: ['testUser'],
                        creator: 'anotherUser'
                    });
                }
            });
        });

        expect(screen.queryByText(/Start/i)).not.toBeInTheDocument();
        expect(screen.queryByText('You are the creator')).not.toBeInTheDocument();
    });
    it('should render the TetrisGame component if the game starts', async () => {
        mockSocket.on.mockImplementation((event, callback) => {
            if (event === 'GAME_START') {
                callback({
                    leftPlayer: 'testUser',
                    rightPlayer: 'anotherUser'
                });
            }
        });

        await act(async () => {
            render(
                <Provider store={store}>
                    <Router>
                        <GameComponent />
                    </Router>
                </Provider>
            )
        });

        await act(async () => {
            mockSocket.on.mock.calls.forEach(([event, callback]) => {
                if (event === 'GAME_STARTED') {
                    callback({
                        leftPlayerName: 'anotherUser1',
                        rightPlayerName: 'anotherUser2'
                    });
                }
            });
        });

        expect(screen.getByText('GIVE UP')).toBeInTheDocument();
    });
    it('should send a START_GAME event when the start button is clicked', async () => {
        mockSocket.emit.mockImplementation((event, data, callback) => {
            if (event === 'USER_JOIN_GAME') {
                callback({
                    players: ['testUser'],
                    creator: 'testUser'
                })
            }
        });

        await act(async () => {
            render(
                <Provider store={store}>
                    <Router>
                        <GameComponent />
                    </Router>
                </Provider>
            )
        });

        await act(async () => {
            mockSocket.on.mock.calls.forEach(([event, callback]) => {
                if (event === 'USER_JOIN_GAME') {
                    callback({
                        players: ['testUser'],
                        creator: 'testUser'
                    });
                }
            });
        });
        mockSocket.emit.mockClear();
        await act(async () => {
            screen.getByText('Start').click();
        });
        expect(mockSocket.emit).toHaveBeenCalledWith('START_GAME', { gameName: null, playerName: 'testUser' }, expect.any(Function));
    });
    it('should render the final score when the player ends the game', async () => {


        await act(async () => {
            render(
                <Provider store={store}>
                    <Router>
                        <GameComponent />
                    </Router>
                </Provider>
            )
        });

        await act(async () => {
            mockSocket.on.mock.calls.forEach(([event, callback]) => {
                if (event === 'PLAYER_GAME_OVER') {
                    callback({
                        playerName: 'testUser',
                        score: 100,
                        rank: 1
                    });
                }
            });
        });
        expect(screen.getByText(/Your score:/)).toBeInTheDocument();
        expect(screen.getByText(/100/)).toBeInTheDocument(); // Assuming '100' is the dynamic score you expect
        expect(screen.getByText(/Your rank:/)).toBeInTheDocument();
        expect(screen.getAllByText(/1/).length).toBeGreaterThan(0);
        const playerScoreDiv = screen.getByTestId('player-score');
        expect(playerScoreDiv).toBeInTheDocument();

    });
    it('should ends the player game when he gives up', async () => {
        await act(async () => {
            render(
                <Provider store={store}>
                    <Router>
                        <GameComponent />
                    </Router>
                </Provider>
            )
        });

        await act(async () => {
            mockSocket.on.mock.calls.forEach(([event, callback]) => {
                if (event === 'GAME_STARTED') {
                    callback({
                        leftPlayerName: 'anotherUser1',
                        rightPlayerName: 'anotherUser2'
                    });
                }
            });
        });

        mockSocket.emit.mockClear();
        await act(async () => {
            screen.getByText('GIVE UP').click();
        });

        expect(mockSocket.emit).toHaveBeenCalledWith('PLAYER_GIVE_UP', { gameName: null, playerName: 'testUser' }, expect.any(Function));

    });
    it('should leave the game when the user leaves the page', async () => {
        const handleLeavePage = jest.fn();
        const originalAddEventListener = window.addEventListener;
        window.addEventListener = jest.fn((event, callback) => {
            if (event === 'beforeunload') {
                handleLeavePage.mockImplementation(callback);
            }
        });

        await act(async () => {
            render(
                <Provider store={store}>
                    <Router>
                        <GameComponent />
                    </Router>
                </Provider>
            )
        });

        await act(async () => {
            handleLeavePage();
        });

        expect(mockSocket.emit).toHaveBeenCalledWith('PLAYER_LEAVE_ROOM', { gameName: null, playerName: 'testUser' }, expect.any(Function));
        window.addEventListener = originalAddEventListener;
    });
    it('should send the user to the Home page when the user leaves the game with the Home button', async () => {
        jest.mock('react-router-dom', () => ({
            ...jest.requireActual('react-router-dom'),
            useNavigate: jest.fn(),
        }));

        await act(async () => {
            render(
                <Provider store={store}>
                    <Router>
                        <GameComponent />
                    </Router>
                </Provider>
            )
        });

        await act(async () => {
            screen.getByText('Home').click();
        });
        expect(mockNavigate).toHaveBeenCalledWith('/');
    });
    it('should navigate the user to Home if the ASK_INFORMATIONS_FAILED', async () => {
        mockSocket.emit.mockImplementation((event, data, callback) => {
            if (event === 'ASK_INFORMATIONS_GAME_PAGE') {
                callback({code: 1});
            }
        });

        // Render the component
        await act(async () => {
            render(
                <Provider store={store}>
                    <Router>
                        <GameComponent />
                    </Router>
                </Provider>
            );
        });

        expect(mockNavigate).toHaveBeenCalledWith('/');
    });
    it('should set the url hash when the ASK_INFORMATIONS_GAME_PAGE event is received', async () => {
        mockSocket.emit.mockImplementation((event, data, callback) => {
            if (event === 'ASK_INFORMATIONS_GAME_PAGE') {
                callback({code: 2, gameName: 'testGame'});
            }
            if (event === 'JOIN_GAME') {
                callback({code: 0, gameName: 'testGame', playerName: 'testUser'});
            }
        });

        await act(async () => {
            render(
                <Provider store={store}>
                    <Router>
                        <GameComponent />
                    </Router>
                </Provider>
            );
        });

        expect(window.location.href).toContain('#testGame[testUser]');
    });
    it('should stop the game if the player won', async () => {
mockSocket.emit.mockImplementation((event, data, callback) => {
            if (event === 'PLAYER_WINNER') {
                callback({code: 0, playerName: 'testUser', score: 100, rank: 1});
            }
        });

        await act(async () => {
            render(
                <Provider store={store}>
                    <Router>
                        <GameComponent />
                    </Router>
                </Provider>
            );
        });

        await act(async () => {
            mockSocket.on.mock.calls.forEach(([event, callback]) => {
                if (event === 'PLAYER_WINNER') {
                    callback({code: 0, playerName: 'testUser', score: 100, rank: 1});
                }
            });
        });

        expect(screen.getByText(/Your score:/)).toBeInTheDocument();
        expect(screen.getByText(/100/)).toBeInTheDocument();
        expect(screen.getByText(/Your rank:/)).toBeInTheDocument();
        expect(screen.getAllByText(/1/).length).toBeGreaterThan(0);
    });
});