import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Scoreboard from './Scoreboard';
import { SocketContext } from '../../App';

// Mock socket
const mockSocket = {
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn()
};

// Mock players data
const mockPlayers = [
    { _id: 'player1', name: 'Alice', color: 'red' },
    { _id: 'player2', name: 'Bob', color: 'blue' },
    { _id: 'player3', name: 'Charlie', color: 'green' },
    { name: '...' } // Empty slot
];

describe('Scoreboard Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renders scoreboard with player names', () => {
        render(
            <SocketContext.Provider value={mockSocket}>
                <Scoreboard players={mockPlayers} />
            </SocketContext.Provider>
        );

        expect(screen.getByText('Live Scores')).toBeInTheDocument();
        expect(screen.getByText('Alice')).toBeInTheDocument();
        expect(screen.getByText('Bob')).toBeInTheDocument();
        expect(screen.getByText('Charlie')).toBeInTheDocument();
    });

    test('displays initial scores of 0 points', () => {
        render(
            <SocketContext.Provider value={mockSocket}>
                <Scoreboard players={mockPlayers} />
            </SocketContext.Provider>
        );

        const scoreElements = screen.getAllByText(/0 pts/);
        expect(scoreElements).toHaveLength(4); // All 4 players start with 0
    });

    test('sets up socket listener on mount', () => {
        render(
            <SocketContext.Provider value={mockSocket}>
                <Scoreboard players={mockPlayers} />
            </SocketContext.Provider>
        );

        expect(mockSocket.on).toHaveBeenCalledWith('game:scores', expect.any(Function));
    });

    test('cleans up socket listener on unmount', () => {
        const { unmount } = render(
            <SocketContext.Provider value={mockSocket}>
                <Scoreboard players={mockPlayers} />
            </SocketContext.Provider>
        );

        unmount();
        expect(mockSocket.off).toHaveBeenCalledWith('game:scores', expect.any(Function));
    });

    test('renders inactive state for empty player slots', () => {
        render(
            <SocketContext.Provider value={mockSocket}>
                <Scoreboard players={mockPlayers} />
            </SocketContext.Provider>
        );

        const yellowRow = screen.getByText('yellow');
        expect(yellowRow.closest('.scoreItem')).toHaveClass('inactive');
    });
});