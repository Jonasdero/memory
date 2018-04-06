import * as express from 'express';
import * as bodyParser from 'body-parser';
import { Router, Request, Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';

import { Game } from './game';
import { Memory } from './memory';

const PORT = 4200;
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

var playerSessionIDs: number[] = [];
var games: Game[] = [];

// Get all pictures from /pictures except memory.jpg
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

var findgame = function (sessionID: number): Game {
    for (let game of games)
        if (game.sessions.indexOf(sessionID) !== -1) return game;
    return null;
}

// GET -> /
// Get HTML site
app.get('/', (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, '../../dist', 'index.html'));
});

// POST -> /connect
// Post sessionName, size and playerName to Server
// Returns sessionID
app.post('/connect', (req: Request, res: Response) => {
    console.log('POST -> connect/');
    let sessionID = createSessionID();
    let gameID = -1;
    for (let game of games) {
        if (game.name === req.body.sessionName) {
            game.addPlayer(sessionID, req.body.playerName);
            res.json({ gameID: game.gameID, sessionID: sessionID });
            return;
        }
    }
    if (req.body.type === 'memory') {
        let game = new Memory(req.body.size, req.body.sessionName, allPictureURLS);
        game.addPlayer(sessionID, req.body.playerName);
        games.push(game);
        game.gameID = games.indexOf(game);
        gameID = game.gameID;
    }
    res.json({ gameID: gameID, sessionID: sessionID });
});

// GET -> /connected
// Gets connected players from current session
// Returns string array with player names
app.get('/connected/:game/:session', (req: Request, res: Response, next) => {
    let game: Game = games[+req.params.game];
    let session = +req.params.session;
    console.log('GET  -> connected/' + req.params.game + '/' + session);

    // if (!game || game.sessions.indexOf(session) === -1) {
    //     console.log("ERROR: Session not in game or game not found");
    //     res.send("ERROR: Session not in game or game not found");
    //     return;
    // }

    game.checkOnlineTime(session);
    res.json({ connectedPlayers: game.getAllPlayerNames() });
});

// GET -> /init
// Initialises the game
// Returns connectedPlayers and game data
app.get('/init/:game/:session', (req: Request, res: Response, next) => {
    let game: Game = games[+req.params.game];
    let session = +req.params.session;
    console.log('GET  -> init/' + req.params.game + '/' + session);

    // if (!game || game.sessions.indexOf(session) === -1) {
    //     console.log("ERROR: Session not in game or game not found");
    //     res.send("ERROR: Session not in game or game not found");
    //     return;
    // }

    game.joinGame(session);
    res.json({ connectedPlayers: game.getAllPlayerNames(), data: game.data });
})

// GET -> /game
// Get current game status
// Returns data, connectedPlayers, points, turn, won, playingPlayer
app.get('/game/:game/:session', (req: Request, res: Response, next) => {
    let game: Game = games[+req.params.game];
    let session = +req.params.session;
    console.log('GET  -> game/' + req.params.game + '/' + session);

    // if (!game || game.sessions.indexOf(session) === -1) {
    //     console.log("ERROR: Session not in game or game not found");
    //     res.send("ERROR: Session not in game or game not found");
    //     return;
    // }

    game.checkOnlineTime(session);
    res.json({
        data: game.data, connectedPlayers: game.getAllPlayerNames(),
        points: game.getAllPlayerPoints(), currentPlayer: game.currentPlayer,
        won: game.won, playingPlayer: game.getPlayerName(game.currentPlayer)
    });
});

// POST -> /turn
// Posts index
// Returns data, connectedPlayers, points, turn, won, playingPlayer
app.post('/turn/:game/:session', (req: Request, res: Response, next) => {
    let game: Game = games[+req.params.game];
    let session = +req.params.session;
    let index = req.body.index;
    console.log('POST -> turn/' + req.params.game + '/' + session + ' on field ' + index);

    // if (!game || game.sessions.indexOf(session) === -1) {
    //     console.log("ERROR: Session not in game or game not found");
    //     res.send("ERROR: Session not in game or game not found");
    //     return;
    // }

    game.makeTurn(session, index);
    res.json({
        data: game.data, connectedPlayers: game.getAllPlayerNames(),
        points: game.getAllPlayerPoints(), currentPlayer: game.currentPlayer
    });
})

app.use(express.static('pictures'))
app.use(express.static('client'));
app.listen(PORT, () => {
    console.log(`App is running at http://localhost:${PORT}`);
});
