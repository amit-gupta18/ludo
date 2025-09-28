import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import WinnerOverlay from './WinnerOverlay';
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
    { _id: 'player4', name: 'Diana', color: 'yellow' }
];

describe('WinnerOverlay Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renders nothing when no winner', () => {
        const { container } = render(
            <SocketContext.Provider value={mockSocket}>
                <WinnerOverlay winner={null} players={mockPlayers} />
            </SocketContext.Provider>
        );

        expect(container.firstChild).toBeNull();
    });

    test('renders winner overlay when winner is declared', () => {
        render(
            <SocketContext.Provider value={mockSocket}>
                <WinnerOverlay winner="red" players={mockPlayers} />
            </SocketContext.Provider>
        );

        expect(screen.getByText('Game Over!')).toBeInTheDocument();
        expect(screen.getByText('Alice')).toBeInTheDocument();
        expect(screen.getByText('Play Again')).toBeInTheDocument();
        expect(screen.getByText('Final Rankings:')).toBeInTheDocument();
    });

    test('displays winner information correctly', () => {
        render(
            <SocketContext.Provider value={mockSocket}>
                <WinnerOverlay winner="blue" players={mockPlayers} />
            </SocketContext.Provider>
        );

        expect(screen.getByText(/Winner:/)).toBeInTheDocument();
        expect(screen.getByText('Bob')).toBeInTheDocument();
    });

    test('sets up socket listener for scores', () => {
        render(
            <SocketContext.Provider value={mockSocket}>
                <WinnerOverlay winner="red" players={mockPlayers} />
            </SocketContext.Provider>
        );

        expect(mockSocket.on).toHaveBeenCalledWith('game:scores', expect.any(Function));
    });

    test('displays final leaderboard', () => {
        render(
            <SocketContext.Provider value={mockSocket}>
                <WinnerOverlay winner="red" players={mockPlayers} />
            </SocketContext.Provider>
        );

        // Check for leaderboard elements
        expect(screen.getByText('Final Rankings:')).toBeInTheDocument();
        expect(screen.getByText('#1')).toBeInTheDocument();
    });
});