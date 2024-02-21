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
    it('updates the game board on UPDATE_BOARD event', async () => {
        // Rendu du composant avec le Provider et le store mock
        await act(async () => {
            render(
                <Provider store={store}>
                    <TetrisGame handlerGiveUp={() => {}} leftPlayerName="PlayerLeft" rightPlayerName="PlayerRight" />
                </Provider>
            );
        });

        // Simuler directement la réception de l'événement 'UPDATE_BOARD'
        const boardUpdateData = { board: facticeUpdateBoard };
        mockSocket.on.mock.calls.forEach(call => {
            if (call[0] === 'UPDATE_BOARD') {
                call[1](boardUpdateData); // Invocation du callback avec les données de mise à jour du tableau
            }
        });

        // Insérez ici la vérification attendue après la mise à jour du tableau
        // Par exemple, vérifier qu'un élément du DOM a été mis à jour avec les nouvelles données du tableau
    });
});

    // it('renders TetrisGame component', () => {
    //     render(
    //         <Provider store={store}>
    //             <TetrisGame handlerGiveUp={() => {}} leftPlayerName="PlayerLeft" rightPlayerName="PlayerRight" />
    //         </Provider>
    //     );
    //
    //     expect(screen.getByText('GIVE UP')).toBeInTheDocument();
    // });
