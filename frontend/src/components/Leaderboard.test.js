import Leaderboard from "./Leaderboard";
import "@testing-library/jest-dom";
import {act, fireEvent, render, screen} from "@testing-library/react";
import configureStore from "redux-mock-store";
import {Provider} from "react-redux";
import {HashRouter as Router} from "react-router-dom";


const mockStore = configureStore();
const mockSocket = {
    on: jest.fn(),
    emit: jest.fn(),
    off: jest.fn()
};

describe('Leaderboard', () => {
    let  store;
    let component;

    beforeEach(() => {
        store = mockStore({
            socket: {
                socket: null
            }
        });
    });

    it('should render leaderboard', () => {
        component = render(
            <Provider store={store}>
                <Router>
                    <Leaderboard />
                </Router>
            </Provider>
        );
        expect(screen.getByText('Leaderboard')).toBeInTheDocument();
    });
    it('should navigate to home', () => {
        component = render(
            <Provider store={store}>
                <Router>
                    <Leaderboard />
                </Router>
            </Provider>
        );
        fireEvent.click(screen.getByText('Home'));
        expect(window.location.hash).toEqual('#/');
    });
    it('should trigger the GET_LEADERBOARD event', () => {
        store = mockStore({
            socket: {
                socket: mockSocket
            }
        });
        component = render(
            <Provider store={store}>
                <Router>
                    <Leaderboard />
                </Router>
            </Provider>
        );
        expect(mockSocket.emit).toHaveBeenCalledWith('GET_LEADERBOARD', {}, expect.any(Function));
    });
});