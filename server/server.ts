import * as express from 'express';
import * as bodyParser from 'body-parser';
import { Router, Request, Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';

import * as classes from './classes';
import * as memory from './memory';

const PORT = 4200;
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

var playerSessionIDs: number[] = [];

var games: classes.Game[] = [];

const allPictureURLS = [];
fs.readdir('./pictures', function (err, items) {
    for (var i = 0; i < items.length; i++) {
        if (items[i] != 'memory.jpg')
            allPictureURLS.push('/' + items[i]);
    }
});

var createSessionID = function (): number {
    let sessionID = playerSessionIDs.length;
    playerSessionIDs.push(sessionID);
    return sessionID;
}

var findgame = function (sessionID: number): classes.Game {
    for (let game of games)
        if (game.sessions.indexOf(sessionID) !== -1) return game;
    return null;
}

// GET -> /
// Get HTML site
app.get('/', (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, '../client', 'index.html'));
});

// POST -> /connect
// Post sessionName, size and playerName to Server
// returns sessionID
app.post('/connect', (req: Request, res: Response) => {
    console.log('POST -> connect/');
    let sessionID = createSessionID();
    for (let game of games) {
        if (game.name === req.body.sessionName) {
            game.addPlayer(sessionID, req.body.playerName);
            res.json({ sessionID: sessionID });
            return;
        }
    }
    if (req.body.type === 'memory') {
        let game = new memory.Memory(req.body.size, req.body.sessionName, allPictureURLS);
        game.addPlayer(sessionID, req.body.playerName);
        games.push(game);
    }
    res.json({ sessionID: sessionID });
});

// gets game from current sessionID
app.param('id', (req, res, next, val) => {
    req.game = findgame(+val);
    req.session = +val;
    next();
});

// GET -> /connected
// Gets connected players from current session
// returns string array with player names
app.get('/connected/:id', (req: Request, res: Response, next) => {
    let game: classes.Game = req.game;
    game.checkOnlineTime(req.session);
    res.json({ connectedPlayers: game.getAllPlayerNames() });
    next();
});

// GET -> /init
// Initialises the game
// returns pictureUrls, connectedPlayers, field
app.get('/init/:id', (req: Request, res: Response, next) => {
    console.log('GET  -> init/' + req.session);
    let game: classes.Game = req.game;
    game.joinGame(req.session);
    res.json({ connectedPlayers: game.sessions, data: game.data });
    next();
})

// GET -> /game
// Get current game status
// returns points, field, turn, won
app.get('/game/:id', (req: Request, res: Response, next) => {
    let game: classes.Game = req.game;
    game.checkOnlineTime(req.session);
    res.json({ data: game.data, points: game.getAllPlayerPoints(), currentPlayer: game.currentPlayer, won: game.won, playingPlayer: game.getPlayerName(game.currentPlayer) });
    next();
});

// POST -> /turn
// posts index
// returns points, field, turn, won
app.post('/turn/:id', (req: Request, res: Response, next) => {
    let index = req.body.index;
    console.log('POST -> turn/' + req.session + ' on field ' + index);
    let game: classes.Game = req.game;
    game.makeTurn(req.session, index);
    res.json({ data: game.data, points: game.getAllPlayerPoints(), currentPlayer: game.currentPlayer, won: game.won });
    next();
})
app.use(express.static('pictures'))
app.use(express.static('client'));
app.listen(PORT, () => {
    console.log(`App is running at http://localhost:${PORT}`);
});


