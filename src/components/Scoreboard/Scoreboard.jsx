import React, { useState, useEffect, useContext, useMemo } from 'react';
import { SocketContext } from '../../App';
import { PLAYER_COLORS } from '../../constants/colors';
import styles from './Scoreboard.module.css';

const Scoreboard = ({ players }) => {
    const socket = useContext(SocketContext);
    const [scores, setScores] = useState({});

    // Listen for score updates
    useEffect(() => {
        const handleScoreUpdate = (scoreData) => {
            console.log('🏆 Score update received:', scoreData);
            console.log('🏆 Socket connected:', !!socket);
            console.log('🏆 Players data:', players);
            setScores(scoreData);
        };

        if (socket) {
            console.log('🔌 Setting up game:scores listener');
            socket.on('game:scores', handleScoreUpdate);
        }

        // Cleanup listener on unmount
        return () => {
            if (socket) {
                console.log('🧹 Cleaning up game:scores listener');
                socket.off('game:scores', handleScoreUpdate);
            }
        };
    }, [socket]);

    // Process score data for display
    const scoreboardData = useMemo(() => {
        return PLAYER_COLORS.map(color => {
            const player = players.find(p => p.color === color);
            const playerScore = player && scores[player._id] ? scores[player._id] : 0;
            
            return {
                color,
                name: player?.name || '...',
                score: playerScore,
                isActive: player && player.name !== '...',
                playerId: player?._id
            };
        });
    }, [players, scores]);

    return (
        <div className={styles.scoreboardContainer}>
            <div className={styles.scoreboardHeader}>
                <h3>Live Scores</h3>
                {/* Debug info */}
                <div style={{ fontSize: '10px', opacity: 0.7 }}>
                    Updates: {Object.keys(scores).length > 0 ? '✅' : '❌'}
                </div>
            </div>
            <div className={styles.scoresList}>
                {scoreboardData.map((player, index) => (
                    <div 
                        key={`${player.color}-${index}`}
                        className={`${styles.scoreItem} ${styles[player.color]} ${
                            !player.isActive ? styles.inactive : ''
                        }`}
                    >
                        <div className={styles.playerInfo}>
                            <div 
                                className={styles.colorIndicator} 
                                style={{ backgroundColor: player.color }}
                            />
                            <span className={styles.playerName}>
                                {player.isActive ? player.name : player.color}
                            </span>
                        </div>
                        <div className={styles.scoreValue}>
                            {player.score} pts
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Scoreboard;