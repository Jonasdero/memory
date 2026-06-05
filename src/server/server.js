"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const memory_1 = require("./memory");
const PORT = Number(process.env.PORT) || 4200;
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
let playerSessionIDs = [];
let games = [];
const picturesDir = path_1.default.join(__dirname, '../../pictures');
const allPictureURLS = fs_1.default
    .readdirSync(picturesDir)
    .filter((item) => item !== 'memory.jpg')
    .map((item) => '/' + item);
const createSessionID = function () {
    const sessionID = playerSessionIDs.length;
    playerSessionIDs.push(sessionID);
    return sessionID;
};
const findGame = function (gameID) {
    return games[gameID] ?? null;
};
const requireGame = function (req, res) {
    const game = findGame(+req.params.game);
    const session = +req.params.session;
    if (!game || game.sessions.indexOf(session) === -1) {
        res.status(404).json({ error: 'Session not in game or game not found' });
        return null;
    }
    return game;
};
app.get('/', (req, res) => {
    res.sendFile(path_1.default.join(__dirname, '../../dist', 'index.html'));
});
app.post('/connect', (req, res) => {
    console.log('POST -> connect/');
    const { sessionName, playerName, size, type } = req.body;
    if (!sessionName || !playerName) {
        res.status(400).json({ error: 'sessionName and playerName are required' });
        return;
    }
    const sessionID = createSessionID();
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
            const game = new memory_1.Memory(size, sessionName, allPictureURLS);
            game.addPlayer(sessionID, playerName);
            games.push(game);
            game.gameID = games.indexOf(game);
            gameID = game.gameID;
        }
        catch (err) {
            res.status(400).json({ error: String(err) });
            return;
        }
    }
    res.json({ gameID: gameID, sessionID: sessionID });
});
app.get('/connected/:game/:session', (req, res) => {
    const game = requireGame(req, res);
    if (!game)
        return;
    const session = +req.params.session;
    console.log('GET  -> connected/' + req.params.game + '/' + session);
    game.checkOnlineTime(session);
    res.json({ connectedPlayers: game.getAllPlayerNames() });
});
app.get('/init/:game/:session', (req, res) => {
    const game = requireGame(req, res);
    if (!game)
        return;
    const session = +req.params.session;
    console.log('GET  -> init/' + req.params.game + '/' + session);
    game.joinGame(session);
    res.json({ connectedPlayers: game.getAllPlayerNames(), data: game.data });
});
app.get('/game/:game/:session', (req, res) => {
    const game = requireGame(req, res);
    if (!game)
        return;
    const session = +req.params.session;
    console.log('GET  -> game/' + req.params.game + '/' + session);
    game.checkOnlineTime(session);
    res.json({
        data: game.data, connectedPlayers: game.getAllPlayerNames(),
        points: game.getAllPlayerPoints(), currentPlayer: game.currentPlayer,
        won: game.won, playingPlayer: game.getPlayerName(game.currentPlayer)
    });
});
app.post('/turn/:game/:session', (req, res) => {
    const game = requireGame(req, res);
    if (!game)
        return;
    const session = +req.params.session;
    const index = req.body.index;
    console.log('POST -> turn/' + req.params.game + '/' + session + ' on field ' + index);
    game.makeTurn(session, index);
    res.json({
        data: game.data, connectedPlayers: game.getAllPlayerNames(),
        points: game.getAllPlayerPoints(), currentPlayer: game.currentPlayer
    });
});
app.use(express_1.default.static(picturesDir));
app.use(express_1.default.static(path_1.default.join(__dirname, '../../dist')));
app.listen(PORT, () => {
    console.log(`App is running at http://localhost:${PORT}`);
});
//# sourceMappingURL=server.js.map