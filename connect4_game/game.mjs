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
}

let games = {}; // We are just storing the data in our local memory for now

app.post('/games', (req, res) => {
    let game = new Game();
    games[game.id] = game;
    res.send(JSON.stringify( { id: game.id } );
});

app.listen(port, () => {
    console.log(`Our app is listening pon port ${port}.`);
});
