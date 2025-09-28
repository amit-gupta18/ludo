import React, { useState, useEffect, useContext, useMemo } from 'react';
import { SocketContext } from '../../App';
import { PLAYER_COLORS } from '../../constants/colors';
import Overlay from '../Overlay/Overlay';
import styles from './WinnerOverlay.module.css';
import trophyImage from '../../images/trophy.webp';

const WinnerOverlay = ({ winner, players }) => {
    const socket = useContext(SocketContext);
    const [scores, setScores] = useState({});

    // Listen for final scores
    useEffect(() => {
        const handleScoreUpdate = (scoreData) => {
            setScores(scoreData);
        };

        // Get the latest scores when winner is declared
        socket.on('game:scores', handleScoreUpdate);

        return () => {
            socket.off('game:scores', handleScoreUpdate);
        };
    }, [socket, winner]);

    // Find winner data
    const winnerData = useMemo(() => {
        if (!winner) return null;
        
        const winnerPlayer = players.find(p => p.color === winner);
        const winnerScore = winnerPlayer && scores[winnerPlayer._id] ? scores[winnerPlayer._id] : 0;
        
        return {
            color: winner,
            name: winnerPlayer?.name || winner,
            score: winnerScore
        };
    }, [winner, players, scores]);

    // Rank all players by score
    const rankedPlayers = useMemo(() => {
        return PLAYER_COLORS
            .map(color => {
                const player = players.find(p => p.color === color);
                const playerScore = player && scores[player._id] ? scores[player._id] : 0;
                
                return {
                    color,
                    name: player?.name || color,
                    score: playerScore,
                    isActive: player && player.name !== '...',
                    playerId: player?._id
                };
            })
            .filter(player => player.isActive)
            .sort((a, b) => b.score - a.score)
            .map((player, index) => ({ ...player, rank: index + 1 }));
    }, [players, scores]);

    const handlePlayAgain = () => {
        socket.emit('player:exit');
    };

    if (!winner || !winnerData) return null;

    return (
        <Overlay>
            <div className={styles.winnerContainer}>
                <img src={trophyImage} alt='winner trophy' className={styles.trophyImage} />
                <h1 className={styles.gameOverTitle}>Game Over!</h1>
                
                <div className={styles.winnerSection}>
                    <h2 className={styles.winnerText}>
                        🏆 Winner: <span style={{ color: winnerData.color }}>
                            {winnerData.name}
                        </span>
                    </h2>
                    <p className={styles.winnerScore}>
                        Final Score: {winnerData.score} points
                    </p>
                </div>

                <div className={styles.finalLeaderboard}>
                    <h3>Final Rankings:</h3>
                    {rankedPlayers.map((player) => (
                        <div 
                            key={player.playerId || player.color} 
                            className={`${styles.leaderboardItem} ${
                                player.color === winner ? styles.winnerItem : ''
                            }`}
                        >
                            <span className={styles.rank}>#{player.rank}</span>
                            <div className={styles.playerInfo}>
                                <div 
                                    className={styles.colorIndicator} 
                                    style={{ backgroundColor: player.color }}
                                />
                                <span>{player.name}</span>
                            </div>
                            <span className={styles.finalScore}>{player.score} pts</span>
                        </div>
                    ))}
                </div>

                <button 
                    className={styles.playAgainButton}
                    onClick={handlePlayAgain}
                >
                    Play Again
                </button>
            </div>
        </Overlay>
    );
};

export default WinnerOverlay;