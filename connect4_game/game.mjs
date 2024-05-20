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
            if (this.board[row][column] === 'O') {// Checks if spot is empty
                this.board[row][column] = this.currentPlayer; // Places piece
                
                const win = this.checkWin(row, column); // Checks if the move won the game
                if (win) {
                    return { row, message: `${this.currentPlayer} won the game!` };
                }
                this.changePlayer(); // Switches turns
                return {row, message: null};
            }
        } 
        return {message : 'Column is full' }; // Error when no spaces in column 
    }
}





/*
* Need checking if a player won 
* Need (get, '/game/:id'),  (post, '/game'), (put, '/game/:id'), (delete, '/game/:id') 

*/


/*let games = {}; // We are just storing the data in our local memory for now

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