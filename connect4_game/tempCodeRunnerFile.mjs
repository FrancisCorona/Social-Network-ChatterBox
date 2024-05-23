/*
* Group: Francis Corona, Ian Stewart
* Project: Learning Express
* Due Date: 5/21/24, 1:00 PM (EDT)
*/

import express from 'express';
import { v4 as uuid } from 'uuid';

const app = express();
const port = 3000;

app.use(express.json());

let games = {}; // Store the games

class Game {
    constructor() {
        this.id = uuid(); // Generate a unique ID for the game
        this.currentPlayer = 'red'; // Set the initial player to red
        this.board = Array(6).fill().map(() => Array(7).fill('O')); // Create a 6 by 7 array with empty values
        console.log(`NEW GAME CREATED WITH ID: ${this.id}`);
    }

    changePlayer() {
        this.currentPlayer = this.currentPlayer === 'red' ? 'black' : 'red'; // Toggle between the players
    }

    // Handle player's move
    dropPiece(column) {
        if (column < 0 || column >= 7) { // Check if column number is within range
            return {message: 'Invalid Column'};
        }
        for (let row = 5; row >= 0; row--) { // Find the first available space
            if (this.board[row][column] === 'O') { // Check if spot is empty
                this.board[row][column] = this.currentPlayer; // Places piece
                const win = this.checkWin(row, column, this.currentPlayer); // Check if the move won the game

                if (win) {
                    return {message: `${this.currentPlayer} won the game!`};
                }
                this.changePlayer(); // Switch turns
                return {message: `Placed piece at ${row},${column}`};
            }
        }
        return {message: 'Column is Full'}; // Error when no spaces in column 
    }

    // Check to see if piece placed in a winning piece
    checkWin(row, col, color) {

        let win = false;

        // Check Vertical Adjacent Spots
        let verticalCheck = 1;
        
        for (let i = 1; i < 4; i++) {
            const r = row + i;
            if (r < 6 && this.board[r][col] === color) {
                verticalCheck++;
            } else {
                break;
            }
        }
        if (verticalCheck >= 4) win = true;

        // Check Horizontal Adjacent Spots
        let horizontalCheck = 1;
        
        for (let i = 1; i < 4; i++) {
            const c = col + i;
            if (c < 7 && this.board[row][c] === color) {
                horizontalCheck++;
            } else {
                break;
            }
        }

        for (let i = 1; i < 4; i++) {
            const c = col - i;
            if (c >= 0 && this.board[row][c] === color) {
                horizontalCheck++;
            } else {
                break;
            }
        }

        if (horizontalCheck >= 4) win = true;

        // Check Right Diagonal '/' Adjacent Spots
        let rightDiagonalCheck = 1;
        
        for (let i = 1; i < 4; i++) {
            const r = row + i;
            const c = col - i;
            if (r < 6 && c >= 0 && this.board[r][c] === color) {
                rightDiagonalCheck++;
            } else {
                break;
            }
        }

        for (let i = 1; i < 4; i++) {
            const r = row - i;
            const c = col + i;
            if (r >= 0 && c < 7 && this.board[r][c] === color) {
                rightDiagonalCheck++;
            } else {
                break;
            }
        }

        if (rightDiagonalCheck >= 4) win = true;

        // Check Left Diagonal '\' Adjacent Spots
        let leftDiagonalCheck = 1;
        
        for (let i = 1; i < 4; i++) {
            const r = row + i;
            const c = col + i;
            if (r < 6 && c < 7 && this.board[r][c] === color) {
                leftDiagonalCheck++;
            } else {
                break;
            }
        }

        for (let i = 1; i < 4; i++) {
            const r = row - i;
            const c = col - i;
            if (r >= 0 && c >= 0 && this.board[r][c] === color) {
                leftDiagonalCheck++;
            } else {
                break;
            }
        }

        if (leftDiagonalCheck >= 4) win = true;

        return win;
    }
}

// GET route for returning the current game state for a given id
app.get('/game/:id', (req, res) => {
    const id = req.params.id;
    if (typeof games[id] === 'undefined') { // Check if ID is valid and return 404 if not
        res.status(404).send('ID Not Found');
        return;
    }
    res.send(JSON.stringify(games[id]));
});

// POST route for creating a new game with a unique id
app.post('/game', (req, res) => { // Post route to make a new game
    const newGame = new Game(); // Make a new game
    games[newGame.id] = newGame; // Store the new game in games
    res.status(201).send({gameId: newGame.id}); // Send 'Created' status along with ID
});

// PUT route that takes a move and attemps to perform it
app.put('/game/:id', (req, res) => {
    const player = req.body.player; // Get player information from request body
    const column = req.body.column; // Get column selection from request body
    const id = req.params.id;
    if (typeof games[id] === 'undefined'){ // Check if ID is valid and return 404 if not
        res.status(404).send('ID Not Found');
        return;
    }

    const game = games[id];
    
    if (game.currentPlayer === player) { // Check if it is the player's turn
        const move = game.dropPiece(column);
        res.status(200).send(move);
    } else {
        res.status(403).send(`It is ${game.currentPlayer}'s turn`);
    }

});

// DELETE route that removes a game from memory
app.delete('/game/:id', (req, res) => { // Delete route
    const gameId = req.params.id; // Get game ID
    
    if (games[gameId]) { // Check if game exists
        delete games[gameId]; // Delete game
        res.status(200).send('Game Deleted');
    } else {
        res.status(404).send('Game Not Found');
    }
});

// Listener for the open port
app.listen(port, () => {
    console.log(`Our app is listening on port ${port}.`);
});