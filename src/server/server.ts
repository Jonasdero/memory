import express, { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';

import { Game } from './game';
import { Memory } from './memory';

const PORT = Number(process.env.PORT) || 4200;
const app = express();

// Express 5 ships with the body parsing middleware built in,
// so the separate body-parser dependency is no longer needed.
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let playerSessionIDs: number[] = [];
let games: Game[] = [];

// Get all pictures from /pictures except the card back (memory.jpg)
const picturesDir = path.join(__dirname, '../../pictures');
const allPictureURLS: string[] = fs
    .readdirSync(picturesDir)
    .filter((item) => item !== 'memory.jpg')
    .map((item) => '/' + item);

const createSessionID = function (): number {
    const sessionID = playerSessionIDs.length;
    playerSessionIDs.push(sessionID);
    return sessionID;
};

// Resolve a game by its id, returning null when it does not exist
const findGame = function (gameID: number): Game | null {
    return games[gameID] ?? null;
};

// Shared guard: make sure the requested game exists and the session belongs to it
const requireGame = function (req: Request, res: Response): Game | null {
    const game = findGame(+req.params.game);
    const session = +req.params.session;
    if (!game || game.sessions.indexOf(session) === -1) {
        res.status(404).json({ error: 'Session not in game or game not found' });
        return null;
    }
    return game;
};

// GET -> /
// Get HTML site
app.get('/', (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, '../../dist', 'index.html'));
});

// POST -> /connect
// Post sessionName, size and playerName to Server
// Returns gameID and sessionID
app.post('/connect', (req: Request, res: Response) => {
    console.log('POST -> connect/');
    const { sessionName, playerName, size, type } = req.body;

    if (!sessionName || !playerName) {
        res.status(400).json({ error: 'sessionName and playerName are required' });
        return;
    }

    const sessionID = createSessionID();

    // Join an existing session if one with the same name is already running
    for (const game of games) {
        if (game.name === sessionName) {
            game.addPlayer(sessionID, playerName);
            res.json({ gameID: game.gameID, sessionID: sessionID });
            return;
        }
    }

    let gameID = -1;
    if (type === 'memory') {
        try {
            const game = new Memory(size, sessionName, allPictureURLS);
            game.addPlayer(sessionID, playerName);
            games.push(game);
            game.gameID = games.indexOf(game);
            gameID = game.gameID;
        } catch (err) {
            res.status(400).json({ error: String(err) });
            return;
        }
    }
    res.json({ gameID: gameID, sessionID: sessionID });
});

// GET -> /connected
// Gets connected players from current session
// Returns string array with player names
app.get('/connected/:game/:session', (req: Request, res: Response) => {
    const game = requireGame(req, res);
    if (!game) return;
    const session = +req.params.session;
    console.log('GET  -> connected/' + req.params.game + '/' + session);

    game.checkOnlineTime(session);
    res.json({ connectedPlayers: game.getAllPlayerNames() });
});

// GET -> /init
// Initialises the game
// Returns connectedPlayers and game data
app.get('/init/:game/:session', (req: Request, res: Response) => {
    const game = requireGame(req, res);
    if (!game) return;
    const session = +req.params.session;
    console.log('GET  -> init/' + req.params.game + '/' + session);

    game.joinGame(session);
    res.json({ connectedPlayers: game.getAllPlayerNames(), data: game.data });
});

// GET -> /game
// Get current game status
// Returns data, connectedPlayers, points, currentPlayer, won, playingPlayer
app.get('/game/:game/:session', (req: Request, res: Response) => {
    const game = requireGame(req, res);
    if (!game) return;
    const session = +req.params.session;
    console.log('GET  -> game/' + req.params.game + '/' + session);

    game.checkOnlineTime(session);
    res.json({
        data: game.data, connectedPlayers: game.getAllPlayerNames(),
        points: game.getAllPlayerPoints(), currentPlayer: game.currentPlayer,
        won: game.won, playingPlayer: game.getPlayerName(game.currentPlayer)
    });
});

// POST -> /turn
// Posts index
// Returns data, connectedPlayers, points, currentPlayer
app.post('/turn/:game/:session', (req: Request, res: Response) => {
    const game = requireGame(req, res);
    if (!game) return;
    const session = +req.params.session;
    const index = req.body.index;
    console.log('POST -> turn/' + req.params.game + '/' + session + ' on field ' + index);

    game.makeTurn(session, index);
    res.json({
        data: game.data, connectedPlayers: game.getAllPlayerNames(),
        points: game.getAllPlayerPoints(), currentPlayer: game.currentPlayer
    });
});

// Serve the card images and the compiled client assets
app.use(express.static(picturesDir));
app.use(express.static(path.join(__dirname, '../../dist')));

app.listen(PORT, () => {
    console.log(`App is running at http://localhost:${PORT}`);
});
