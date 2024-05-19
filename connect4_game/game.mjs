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
    constuctor(){
        this.id = uuid(); // Import uuid function from the uuid library
        this.hidden_number = Math.floor(Math.random() * 100); // Generate a random number
        console.log(`NEW GAME CREATED: ${this.id} with number: ${this.hidden_number}.`);
    }
    checkGuess(guess){
        let answer = guess - this.hidden_number;
        this.num_guesses = this.num_guesses + 1;
        return answer;
    }
    getNumGuesses(){
        return this.num_guesses;
    }
}

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
