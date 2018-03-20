"use strict";
exports.__esModule = true;
var express = require("express");
var bodyParser = require("body-parser");
var classes = require("./classes");
var fs = require("fs");
var path = require("path");
var PORT = 4200;
var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
var playerSessionIDs = [];
var allPictureURLS = [];
var games = [];
var createSessionID = function () {
    var sessionID = playerSessionIDs.length;
    playerSessionIDs.push(sessionID);
    console.log(playerSessionIDs);
    return sessionID;
};
var findgame = function (sessionID) {
    for (var _i = 0, games_1 = games; _i < games_1.length; _i++) {
        var game = games_1[_i];
        // console.log(game.sessions);
        // console.log(sessionID);
        // console.log(typeof(sessionID));
        // console.log(typeof(game.sessions[0]));
        if (game.sessions.indexOf(sessionID) !== -1)
            return game;
    }
};
var getSessionID = function (playerName) {
    for (var _i = 0, games_2 = games; _i < games_2.length; _i++) {
        var game = games_2[_i];
        for (var _a = 0, _b = game.playerData; _a < _b.length; _a++) {
            var data = _b[_a];
            if (data.name === playerName)
                return data.id;
        }
    }
    return -1;
};
var picturePath = './pictures';
fs.readdir(picturePath, function (err, items) {
    for (var i = 0; i < items.length; i++) {
        if (items[i] != 'memory.jpg')
            allPictureURLS.push('/' + items[i]);
    }
    // console.log(allPictureURLS);
});
// GET -> /
// Get HTML site
app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname + '/index.html'));
});
// POST -> /connect
// Post sessionName, size and playerName to Server
// returns sessionID
app.post('/connect', function (req, res) {
    console.log('POST -> connect/');
    var data = req.body;
    for (var _i = 0, games_3 = games; _i < games_3.length; _i++) {
        var game_1 = games_3[_i];
        if (game_1.name === data.sessionName) {
            var sessionID_1 = createSessionID();
            game_1.playerData.push(new classes.PlayerData(sessionID_1, data.playerName));
            game_1.sessions.push(sessionID_1);
            res.json({ sessionID: sessionID_1 });
            return;
        }
    }
    var game = new classes.Game(data.size);
    game.name = data.sessionName;
    var sessionID = createSessionID();
    game.playerData.push(new classes.PlayerData(sessionID, data.playerName));
    game.addPictures((game.size.height * game.size.width) / 2, allPictureURLS);
    game.sessions.push(sessionID);
    games.push(game);
    res.json({ sessionID: sessionID });
});
// gets game from current sessionID
app.param('id', function (req, res, next, val) {
    req.game = findgame(+val);
    req.session = +val;
    next();
});
// GET -> /connected
// Gets connected players from current session
// returns string array with player names
app.get('/connected/:id', function (req, res, next) {
    console.log('GET -> connected/' + req.session);
    var game = req.game;
    next();
    res.json({ connectedPlayers: game.getPlayers() });
});
// GET -> /init
// Initialises the game
// returns pictureUrls, connectedPlayers, field
app.get('/init/:id', function (req, res, next) {
    console.log('GET -> init/' + req.session);
    var game = req.game;
    game.currentPlayer = game.playerData[0].id;
    res.json({ pictureUrls: game.pictureUrls, connectedPlayers: game.getPlayers(), field: game.field });
    next();
});
// GET -> /game
// Get current game status
// returns points, field, turn, won
app.get('/game/:id', function (req, res, next) {
    console.log('GET -> game/' + req.session);
    var game = req.game;
    res.json({ points: game.getPlayerPoints(), field: game.field, currentPlayer: game.currentPlayer, won: game.won });
    next();
});
// POST -> /turn
// posts index
// returns points, field, turn, won
app.post('/turn/:id', function (req, res, next) {
    var index = JSON.parse(req.body).index;
    console.log('POST -> turn/' + req.session + '/' + index);
    console.log(req.body);
    var game = req.game;
    game.makeTurn(req.session, index);
    res.json({ points: game.getPlayerPoints(), field: game.field, currentPlayer: game.currentPlayer, won: game.won });
    next();
});
app.use(express.static('pictures'));
app.listen(PORT, function () {
    console.log("App is running at http://localhost:" + PORT);
});
