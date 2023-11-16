import React, { useState, useEffect } from 'react';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';

const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: '#f9f9f9',
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: 'center',
    color: theme.palette.text.secondary,
}));

function createEmptyGrid() {
    return Array.from({ length: 20 }, () => Array(10).fill(0));
}

function createPiece(type) {
    switch (type) {
        case 'I':
            return { shape: [[1, 1, 1, 1]], color: 'cyan', position: { x: 0, y: 0 } };
        // Ajoutez d'autres pièces ici
        default:
            throw new Error(`Type de pièce inconnu: ${type}`);
    }
}

function placePiece(piece, grid) {
    const newGrid = grid.map(row => [...row]);
    piece.shape.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                if (y + piece.position.y < newGrid.length && x + piece.position.x < newGrid[y].length) {
                    newGrid[y + piece.position.y][x + piece.position.x] = piece.color;
                }
            }
        });
    });
    return newGrid;
}

function updatePiecePosition(piece, grid, place = true) {
    const newGrid = grid.map(row => [...row]);
    piece.shape.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                const newY = y + piece.position.y;
                const newX = x + piece.position.x;
                if (newY < newGrid.length && newX < newGrid[0].length) {
                    newGrid[newY][newX] = place ? piece.color : 0;
                }
            }
        });
    });
    return newGrid;
}


function Tetris() {
    const [grid, setGrid] = useState(createEmptyGrid());
    const [currentPiece, setCurrentPiece] = useState(createPiece('I'));

    useEffect(() => {
        const handle = setInterval(() => {
            setCurrentPiece(prev => ({
                ...prev,
                position: { ...prev.position, y: prev.position.y + 1 }
            }));
        }, 1000);

        return () => clearInterval(handle);
    }, []);

    useEffect(() => {
        setGrid(prevGrid => {
             const gridWithoutPiece = updatePiecePosition(currentPiece, prevGrid, false);
            return updatePiecePosition({ ...currentPiece, position: { ...currentPiece.position, y: currentPiece.position.y + 1 } }, gridWithoutPiece, true);
        });
    }, [currentPiece]);


    return (
        <Box sx={{ flexGrow: 1, border: '2px solid red' }}>
            <Grid container spacing={0}>
                {grid.map((row, y) => (
                    <Grid container item spacing={0} key={y}>
                        {row.map((cell, x) => (
                            <Grid item xs={1.2} key={x}>
                                <Item style={{ backgroundColor: cell === 0 ? 'transparent' : cell }}>
                                    {/* Contenu de la cellule */}
                                </Item>
                            </Grid>
                        ))}
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
}


export default Tetris;
