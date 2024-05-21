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

const games = {}; // Store the game

class Game {
    constructor(){
        this.id = uuid(); // Import uuid function from the uuid library
        this.currentPlayer = 'red'; // Set initial player to red
        this.board = Array(6).fill().map( () => Array(7).fill('O')); // Create a 6 by 7 array with null values
        //console.log(`NEW GAME CREATED: ${this.id} with initial player: ${this.currentPlayer}.`);
    }

    changePlayer() {
        this.currentPlayer = this.currentPlayer === 'red' ? 'black' : 'red'; // Changing the player
    }

    // Handle players move
    dropPiece(column) {
        if (column < 0 || column >= 7) { // Checks if column number is within range
            return {message: 'Invalid column'};
        }
        for (let row = 5; row >= 0; row--) { // Finds the first available space
            if (this.board[row][column] === 'O') { // Checks if spot is empty
                this.board[row][column] = this.currentPlayer; // Places piece
                
                const win = this.checkWin(row, column, this.currentPlayer); // Checks if the move won the game
                if (win) {
                    return { row, message: `${this.currentPlayer} won the game!` };
                }
                this.changePlayer(); // Switches turns
                return {row, message: null};
            }
        } 
        return {message : 'Column is full' }; // Error when no spaces in column 
    }

    // Checks to see if piece placed in a winning piece
    checkWin(row, col, color) {

        let win = false;

        // Check Vertical
        let verticalCheck = 1;
        
        for (let i = 1; i < 4; i++) {
            const c = col;
            const r = row + i;
            if(r < 6 && this.board[r][c] == color) {
                verticalCheck++;
            } else {
                break;
            }
        }
        if (verticalCheck >= 4) win = true;

        // Check Horizontal
        let horizontalCheck = 1;
        
        for (let i = 1; i < 4; i++) {
            const c = col + i;
            const r = row;
            if(c < 7 && this.board[r][c] == color) {
                horizontalCheck++;
            } else {
                break;
            }
        }

        for (let i = 1; i < 4; i++) {
            const c = col - i;
            const r = row;
            if(c >= 0 && this.board[r][c] == color) {
                horizontalCheck++;
            } else {
                break;
            }
        }

        if (horizontalCheck >= 4) win = true;

        // Check Right Diagonal /
        let rightDiagonalCheck = 1;
        
        for (let i = 1; i < 4; i++) {
            const c = col - i;
            const r = row + i;
            if(c >= 0 && r < 6 && this.board[r][c] == color) {
                rightDiagonalCheck++;
            } else {
                break;
            }
        }

        for (let i = 1; i < 4; i++) {
            const c = col + i;
            const r = row - i;
            if(c < 7 && r >= 0 && this.board[r][c] == color) {
                rightDiagonalCheck++;
            } else {
                break;
            }
        }

        if (rightDiagonalCheck >= 4) win = true;

        // Check Left Diagonal \
        let leftDiagonalCheck = 1;
        
        for (let i = 1; i < 4; i++) {
            const c = col + i;
            const r = row + i;
            if(c < 7 && r < 6 && this.board[r][c] == color) {
                leftDiagonalCheck++;
            } else {
                break;
            }
        }

        for (let i = 1; i < 4; i++) {
            const c = col - i;
            const r = row - i;
            if(c >= 0 && r >= 0 && this.board[r][c] == color) {
                leftDiagonalCheck++;
            } else {
                break;
            }
        }

        if (leftDiagonalCheck >= 4) win = true;

        return win;
    }

    // Temp function for testing, remove before submitting
    printBoard() {
        for (let row = 0; row < 6; row++) {
            let rowStr = '';
            for (let col = 0; col < 7; col++) {
                switch (this.board[row][col]) {
                    case 'red':
                        rowStr += 'r ';
                        break;
                    case 'black':
                        rowStr += 'b ';
                        break;
                    default:
                        rowStr += '- ';
                }
            }
            console.log(rowStr);
        }
        console.log('\n');
    }

}

/*
* (get, '/game/:id') -
*    A route that returns the current game state for the given id,
*    or a 404 if that id does not exist. A game should be a JSON object that has a color
*    equal to red or black for the current player's turn, and an array holding the board.
*/

/*
* (post, '/game') -
*    A route to create a new game. Generate a unique id for the game using the UUID library.
*    Write a Game "class" that holds the current player and the board. All logic for the game will go in the Game class.
*    In your API, store all the Game objects in a hashmap, with the key being the unique id and the value being the Game instance.
*/

/*
* (put, '/game/:id') -
*    A route that takes a move. You must pass the move as a JSON object to the put request.
*    The JSON should look like '{"player":"red", "column":4} (for instance). The id gets passed not as JSON,
*    but as a parameter in the URL. If the game id does not exist, return a 404. If a player tries to move
*    and it isn't their turn, return a 403. Make sure your game stores the checker dropped in the correct spot
*    (i.e. you may need to simulate the checker falling, behind the scenes). If a player wins, return a JSON object
*    with a message about who won, for example, '{"message":"Red has won the game!"}.
*/

/*
* (delete, '/game/:id') -
*    A route that removes a game from memory. Return a 404 if the game id doesn't exist, or a 200 if it does and you delete it.
}

app.delete ('/game/:id', (req, res) => { // Delete route
    const gameId = req.params.id; // Get game ID
    
    if (games[gameId]) { // Check if game exists
        delete games[gameId]; // Delete game
        res.status(200).send('Game Deleted');
    } else {
        res.status(404).send('Game not found');
    }
});


/*

let games = {}; // We are just storing the data in our local memory for now

app.post('/games', (req, res) => {
    let game = new Game();
    games[game.id] = game;
    res.send(JSON.stringify( { id: game.id } ) );
});

app.get('/games/:id', (req, res) => {
    let id = req.params.id;
    if(games[id] === 'undefined'){
        res.sendStatus(404);
        return;
    }
    let game = games[id];
    res.send(JSON.stringify(game.getNumGuesses()));

});

app.get('/games', (req, res) => {
    res.send(JSON.stringify(games));
});

app.put('/games/:id', (req, res) => {
    let guess = req.body.guess;
    let id = req.params.id;
    if(games[id] === 'undefined'){
        res.sendStatus(404);
        return;
    }

    let game = games[id];
    let value = game.checkGuess(guess);
    if(value == 0){
        res.sendStatus(200);
    } else if(value > 0){
        res.send(JSON.stringify( { numGuesses: game.getNumGuesses(), message: "Too high." } ));
    } else {
        res.send(JSON.stringify( { numGuesses: game.getNumGuesses(), message: "Too low." } ));
    }
});

app.delete('/games/:id', (req, res) => {
    let id = req.params.id;
    if(games[id] === 'undefined'){
        res.sendStatus(404);
        return;
    }
    delete(games[id]);
});

app.listen(port, () => {
    console.log(`Our app is listening on port ${port}.`);
});
*/