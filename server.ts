import * as express from 'express';
import * as bodyParser from 'body-parser';
import { Router, Request, Response } from 'express';
import * as classes from './classes';
import * as fs from 'fs';

const PORT = 4200;
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

var playerSessionIDs: number[] = [];
var allPictureURLS: string[] = [];
var games: classes.Game[] = [];

var createSessionID = function () {
    let sessionID = this.playerSessionIDs[this.playerSessionIDs.length - 1] + 1;
    this.playerSessionIDs.push(sessionID);
    return sessionID;
}

var findgame = function (sessionID: number) {
    for (let game of games)
        for (let data of game.playerData)
            if (sessionID === data.id) return game;
    return null;
}

var getSessionID = function (playerName: string) {
    for (let game of games)
        for (let data of game.playerData)
            if (data.name === playerName) return data.id;
    return -1;
}

const path = './pictures'
fs.readdir(path, function (err, items) {
    for (var i = 0; i < items.length; i++) {
        if (items[i] != 'memory.jpg')
            allPictureURLS.push('/' + items[i]);
    }
    // console.log(allPictureURLS);
});


// GET -> /
// Get HTML site
app.get('/', (req: Request, res: Response) => {
    // res.sendFile('a html');
    res.send('HI');
});

// POST -> /connect
// Post sessionName, size and playerName to Server
// returns sessionID
app.post('/connect', (req: Request, res: Response) => {
    console.log('connect/' + req.body);
    let data = JSON.parse(req.body);
    let sessionName = data.sessionName;
    for (let game of this.games) {
        if (game.sessionName === sessionName) {
            let sessionID = createSessionID();
            game.playerData.push(new classes.PlayerData(sessionID, data.playerName));
            res.json(sessionID);
            return;
        }
    }
    let size = data.size;
    let game = new classes.Game(data.size);
    game.name = data.sessionName;
    let sessionID = createSessionID();
    game.playerData.push(new classes.PlayerData(sessionID, data.playerName));
    game.addPictures((game.size.height * game.size.width) / 2, allPictureURLS);
    games.push(game);
    res.json({ sessionID: sessionID });
});

// gets game from current sessionID
app.param('id', (req, res, next, val) => {
    req.game = findgame(val);
    req.session = val;
    next();
});

// GET -> /connected
// Gets connected players from current session
// returns string array with player names
app.get('/connected/:id', (req: Request, res: Response, next) => {
    console.log('connected/' + req.session);
    let game: classes.Game = req.game;
    next();
    res.json({ connectedPlayers: game.getPlayers() });
});

// GET -> /init
// Initialises the game
// returns pictureUrls, connectedPlayers, field
app.get('/init/:id', (req: Request, res: Response, next) => {
    console.log('init/' + req.session);
    let game: classes.Game = req.game;
    game.currentPlayer = game.playerData[0].id;
    res.json({ pictureUrls: game.pictureUrls, connectedPlayers: game.getPlayers(), field: game.field });
    next();
})

// GET -> /game
// Get current game status
// returns points, field, turn, won
app.get('/game/:id', (req: Request, res: Response, next) => {
    console.log('game/' + req.session);
    let game: classes.Game = req.game;
    res.json({ points: game.getPlayerPoints(), field: game.field, currentPlayer: game.currentPlayer, won: game.won });
    next();
});

// POST -> /turn
// posts index
// returns points, field, turn, won
app.post('/turn/:id', (req: Request, res: Response, next) => {
    let index = JSON.parse(req.body).index;
    console.log('turn/' + req.session + '/' + index);
    let game: classes.Game = req.game;
    game.makeTurn(req.session, index);
    res.json({ points: game.getPlayerPoints(), field: game.field, currentPlayer: game.currentPlayer, won: game.won });
    next();
})
app.use(express.static('pictures'))
app.listen(PORT, () => {
    console.log(`App is running at http://localhost:${PORT}`);
});


