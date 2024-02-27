import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom'; // Importez useNavigate
import './Leaderboard.css';

function Leaderboard() {
    const [leaderboard, setLeaderboard] = useState([]);
    const socket = useSelector(state => state.socket.socket);
    const navigate = useNavigate();

    useEffect(() => {
        if (!socket) return;

        socket.emit('GET_LEADERBOARD', {}, (data) => {
            if (data.code !== 0) return;
            setLeaderboard(data.leaderboard);
        });

        return () => {
            socket.off('UPDATE_LEADERBOARD');
        };
    }, [socket]);

    return (
        <div className="leaderboard-container">
            <h2>Leaderboard</h2>
            <table>
                <thead>
                <tr>
                    <th>Rank</th>
                    <th>Username</th>
                    <th>Score</th>
                </tr>
                </thead>
                <tbody>
                {leaderboard.length > 0 ? (
                    leaderboard.map((player, index) => (
                        <tr key={index}>
                            <td>{index + 1}</td>
                            <td>{player.name}</td>
                            <td>{player.score}</td>
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan="3">No data available</td>
                    </tr>
                )}
                </tbody>
            </table>
            <button onClick={() => navigate('/')}>Home</button>
        </div>
    );
}

export default Leaderboard;
