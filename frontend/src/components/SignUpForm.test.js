import React from 'react';
import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import SignUpForm from './SignUpForm';

import configureMockStore from 'redux-mock-store';
import { Provider } from 'react-redux';

const mockStore = configureMockStore();

const mockSocket = {
    emit: jest.fn()
};

const store = mockStore({
    socket: { socket: mockSocket },
});

describe('SignUpForm', () => {
    const setShowLogin = jest.fn();

    it('should render the form', () => {
        render(
            <Provider store={store}>
                <SignUpForm setShowLogin={setShowLogin} />
            </Provider>
        );

        expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument();
        expect(screen.getByLabelText('Username')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
    });

    it('submits the form with username, email, and password', () => {
        render(
            <Provider store={store}>
                <SignUpForm setShowLogin={setShowLogin} />
            </Provider>
        );

        fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'testuser' } });
        fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@example.com' } });
        fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'testpass' } });
        fireEvent.click(screen.getByRole('button', { name: /register/i }));

        expect(mockSocket.emit).toHaveBeenCalledWith('SIGNUP', { username: 'testuser', email: 'test@example.com', password: 'testpass' }, expect.any(Function));
    });

    it('displays an error message on signup failure', async () => {
        mockSocket.emit.mockImplementation((event, { username, email, password }, callback) => {
            callback({ code: 1, error: 'Registration failed' });
        });

        render(
            <Provider store={store}>
                <SignUpForm setShowLogin={setShowLogin} />
            </Provider>
        );

        fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'wronguser' } });
        fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'wrong@example.com' } });
        fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'wrongpass' } });
        fireEvent.click(screen.getByRole('button', { name: /register/i }));

        await waitFor(() => {
            expect(screen.getByText('Registration failed')).toBeInTheDocument();
        });
    });

    it("doesn't clear the error message when the user starts typing", async () => {
        mockSocket.emit.mockImplementation((event, { username, email, password }, callback) => {
            callback({ code: 1, error: 'Registration failed' });
        });

        render(
            <Provider store={store}>
                <SignUpForm setShowLogin={setShowLogin} />
            </Provider>
        );

        fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'wronguser' } });
        fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'wrong@example.com' } });
        fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'wrongpass' } });
        fireEvent.click(screen.getByRole('button', { name: /register/i }));

        await waitFor(() => {
            expect(screen.getByText('Registration failed')).toBeInTheDocument();
        });

        fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'testuser' } });

        expect(screen.getByText('Registration failed')).toBeInTheDocument();
    });
});
