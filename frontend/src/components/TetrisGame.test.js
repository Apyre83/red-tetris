import React from 'react';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import {fireEvent, render, act, screen} from '@testing-library/react';
import '@testing-library/jest-dom';
import TetrisGame from './TetrisGame';


const facticeUpdateBoard = [
    [ [1, '#222'], [0, '#ffffff'], [0, '#ffffff'], [0, '#ffffff'], [0, '#ffffff'], [1, '#2bace2'], [0, '#ffffff'], [0, '#ffffff'], [0, '#ffffff'], [0, '#ffffff'], [0, '#ffffff'], [1, '#222'] ],
    [ [1, '#222'], [0, '#ffffff'], [0, '#ffffff'], [0, '#ffffff'], [0, '#ffffff'], [1, '#2bace2'], [0, '#ffffff'], [0, '#ffffff'], [0, '#ffffff'], [0, '#ffffff'], [0, '#ffffff'], [1, '#222'] ],
    [ [1, '#222'], [0, '#ffffff'], [0, '#ffffff'], [0, '#ffffff'], [0, '#ffffff'], [1, '#2bace2'], [0, '#ffffff'], [0, '#ffffff'], [0, '#ffffff'], [0, '#ffffff'], [0, '#ffffff'], [1, '#222'] ],
    [ [1, '#222'], [0, '#ffffff'], [0, '#ffffff'], [0, '#ffffff'], [0, '#ffffff'], [1, '#2bace2'], [0, '#ffffff'], [0, '#ffffff'], [0, '#ffffff'], [0, '#ffffff'], [0, '#ffffff'], [1, '#222'] ],
    [ [1, '#222'], [0, '#ffffff'], [0, '#ffffff'], [0, '#ffffff'], [0, '#ffffff'], [1, '#2bace2'], [0, '#ffffff'], [0, '#ffffff'], [0, '#ffffff'], [0, '#ffffff'], [0, '#ffffff'], [1, '#222'] ],
    [ [1, '#222'], [0, '#ffffff'], [0, '#ffffff'], [0, '#ffffff'], [0, '#ffffff'], [1, '#2bace2'], [0, '#ffffff'], [0, '#ffffff'], [0, '#ffffff'], [0, '#ffffff'], [0, '#ffffff'], [1, '#222'] ],
    [ [1, '#222'], [0, '#ffffff'], [0, '#ffffff'], [0, '#ffffff'], [0, '#ffffff'], [1, '#2bace2'], [0, '#ffffff'], [0, '#ffffff'], [0, '#ffffff'], [0, '#ffffff'], [0, '#ffffff'], [1, '#222'] ],
    [ [1, '#222'], [0, '#ffffff'], [0, '#ffffff'], [0, '#ffffff'], [0, '#ffffff'], [1, '#2bace2'], [0, '#ffffff'], [0, '#ffffff'], [0, '#ffffff'], [0, '#ffffff'], [0, '#ffffff'], [1, '#222'] ],
    [ [1, '#222'], [0, '#ffffff'], [0, '#ffffff'], [0, '#ffffff'], [0, '#ffffff'], [1, '#2bace2'], [0, '#ffffff'], [0, '#ffffff'], [0, '#ffffff'], [0, '#ffffff'], [0, '#ffffff'], [1, '#222'] ],
    [ [1, '#222'], [0, '#ffffff'], [0, '#ffffff'], [0, '#ffffff'], [0, '#ffffff'], [1, '#2bace2'], [0, '#ffffff'], [0, '#ffffff'], [0, '#ffffff'], [0, '#ffffff'], [0, '#ffffff'], [1, '#222'] ],
    [ [1, '#222'], [0, '#ffffff'], [0, '#ffffff'], [0, '#ffffff'], [0, '#ffffff'], [1, '#2bace2'], [0, '#ffffff'], [0, '#ffffff'], [0, '#ffffff'], [0, '#ffffff'], [0, '#ffffff'], [1, '#222'] ],
    [ [1, '#222'], [0, '#ffffff'], [0, '#ffffff'], [0, '#ffffff'], [0, '#ffffff'], [1, '#2bace2'], [0, '#ffffff'], [0, '#ffffff'], [0, '#ffffff'], [0, '#ffffff'], [0, '#ffffff'], [1, '#222'] ],
    [ [1, '#222'], [0, '#ffffff'], [0, '#ffffff'], [0, '#ffffff'], [0, '#ffffff'], [1, '#2bace2'], [0, '#ffffff'], [0, '#ffffff'], [0, '#ffffff'], [0, '#ffffff'], [0, '#ffffff'], [1, '#222'] ],
    [ [1, '#222'], [0, '#ffffff'], [0, '#ffffff'], [0, '#ffffff'], [0, '#ffffff'], [1, '#2bace2'], [0, '#ffffff'], [0, '#ffffff'], [0, '#ffffff'], [0, '#ffffff'], [0, '#ffffff'], [1, '#222'] ],
    [ [1, '#222'], [0, '#ffffff'], [0, '#ffffff'], [0, '#ffffff'], [0, '#ffffff'], [1, '#2bace2'], [0, '#ffffff'], [0, '#ffffff'], [0, '#ffffff'], [0, '#ffffff'], [0, '#ffffff'], [1, '#222'] ],
    [ [1, '#222'], [0, '#ffffff'], [0, '#ffffff'], [0, '#ffffff'], [0, '#ffffff'], [1, '#2bace2'], [0, '#ffffff'], [0, '#ffffff'], [0, '#ffffff'], [0, '#ffffff'], [0, '#ffffff'], [1, '#222'] ],
    [ [1, '#222'], [0, '#ffffff'], [0, '#ffffff'], [0, '#ffffff'], [0, '#ffffff'], [1, '#2bace2'], [0, '#ffffff'], [0, '#ffffff'], [0, '#ffffff'], [0, '#ffffff'], [0, '#ffffff'], [1, '#222'] ],
    [ [1, '#222'], [0, '#ffffff'], [0, '#ffffff'], [0, '#ffffff'], [0, '#ffffff'], [1, '#2bace2'], [0, '#ffffff'], [0, '#ffffff'], [0, '#ffffff'], [0, '#ffffff'], [0, '#ffffff'], [1, '#222'] ],
    [ [1, '#222'], [0, '#ffffff'], [0, '#ffffff'], [0, '#ffffff'], [0, '#ffffff'], [1, '#2bace2'], [0, '#ffffff'], [0, '#ffffff'], [0, '#ffffff'], [0, '#ffffff'], [0, '#ffffff'], [1, '#222'] ],
    [ [1, '#222'], [0, '#ffffff'], [0, '#ffffff'], [0, '#ffffff'], [0, '#ffffff'], [1, '#2bace2'], [0, '#ffffff'], [0, '#ffffff'], [0, '#ffffff'], [0, '#ffffff'], [0, '#ffffff'], [1, '#222'] ],
    [ [1, '#222'], [0, '#222'], [0, '#222'], [0, '#222'], [0, '#222'], [1, '#222'], [0, '#222'], [0, '#222'], [0, '#222'], [0, '#222'], [0, '#222'], [1, '#222'] ]
]


const mockSocket = {
    on: jest.fn(),
    emit: jest.fn(),
    off: jest.fn(),
};

jest.mock('socket.io-client', () => jest.fn(() => mockSocket));

// Création du store mock avec redux-mock-store
const mockStore = configureMockStore();
const store = mockStore({
    // État initial pour le store
    socket: { socket: mockSocket }
});

describe('TetrisGame Component', () => {
    beforeEach(() => {
        // Réinitialisation des mocks avant chaque test
        mockSocket.on.mockClear();
        mockSocket.emit.mockClear();
        mockSocket.off.mockClear();
    });

    it('renders TetrisGame component', () => {
        render(
            <Provider store={store}>
                <TetrisGame handlerGiveUp={() => {}} leftPlayerName="PlayerLeft" rightPlayerName="PlayerRight" />
            </Provider>
        );

        expect(screen.getByText('GIVE UP')).toBeInTheDocument();
    });

    it('updates the game board on UPDATE_BOARD event', async () => {
        await act(async () => {
            render(
                <Provider store={store}>
                    <TetrisGame handlerGiveUp={() => {}} leftPlayerName="PlayerLeft" rightPlayerName="PlayerRight" />
                </Provider>
            );
        });

        await act(async () => {
            mockSocket.on.mock.calls.forEach(([eventName, callback]) => {
                if (eventName === 'UPDATE_BOARD') {
                    callback({ board: facticeUpdateBoard });
                }
            });
        });
        expect(screen.getByTestId('main-grid-cell-5-5')).toHaveStyle(`backgroundColor: #2bace2`);
    });

    it('emits correct movement on key press', async () => {
        await act(async () => {
            render(
                <Provider store={store}>
                    <TetrisGame handlerGiveUp={() => {}} leftPlayerName="PlayerLeft" rightPlayerName="PlayerRight" />
                </Provider>
            );
        });

        const keyPresses = [
            { key: 'ArrowLeft', movement: 'moveLeft' },
            { key: 'ArrowRight', movement: 'moveRight' },
            { key: 'ArrowDown', movement: 'moveDown' },
            { key: ' ', movement: 'directBottom' },
            { key: 'q', movement: 'rotateLeft' },
            { key: 'e', movement: 'rotateRight' }
        ];

        for (const { key, movement } of keyPresses) {
            fireEvent.keyDown(window, { key });
            expect(mockSocket.emit).toHaveBeenCalledWith('MOVEMENT',
                expect.objectContaining({ movement: movement }),
                expect.any(Function)
            );
            mockSocket.emit.mockClear();
        }
    });

    it('handles give up action correctly', async () => {
        const handlerGiveUp = jest.fn();

        await act(async () => {
            render(
                <Provider store={store}>
                    <TetrisGame handlerGiveUp={handlerGiveUp} leftPlayerName="PlayerLeft"
                                rightPlayerName="PlayerRight"/>
                </Provider>
            );
        });
    });
});
