import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import LoginForm from './LoginForm';

import configureMockStore from 'redux-mock-store';
import { Provider } from 'react-redux';

const mockStore = configureMockStore();

const mockSocket = {
  emit: jest.fn()
};

const store = mockStore({
  socket: { socket: mockSocket },
});

describe('LoginForm', () => {
  it('should render the form', () => {
    render(
        <Provider store={store}>
          <LoginForm />
        </Provider>
    );
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
    expect(screen.getByLabelText('Username')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
  });

  it('submits the form with username and password', () => {
    render(
        <Provider store={store}>
          <LoginForm />
        </Provider>
    );

    fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'testpass' } });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    expect(mockSocket.emit).toHaveBeenCalledWith('LOGIN', { username: 'testuser', password: 'testpass' }, expect.any(Function));
  });

  it('displays an error message on login failure', async () => {
    mockSocket.emit.mockImplementation((event, { username, password }, callback) => {
      callback({ code: 1, error: 'Invalid credentials' });
    });

    render(
        <Provider store={store}>
          <LoginForm />
        </Provider>
    );

    fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'wronguser' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'wrongpass' } });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await screen.findByText('Invalid credentials');
    expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
  });

  it("doesn't clear the error message when the user starts typing", async () => {
    mockSocket.emit.mockImplementation((event, { username, password }, callback) => {
      callback({ code: 1, error: 'Invalid credentials' });
    });

    render(
        <Provider store={store}>
          <LoginForm />
        </Provider>
    );

    fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'wronguser' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'wrongpass' } });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await screen.findByText('Invalid credentials');

    fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'testuser' } });

    expect(screen.queryByText('Invalid credentials')).toBeInTheDocument();
  });

});
