"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Game = (function () {
    function Game(size) {
        this.size = { width: 0, height: 0 };
        this.pictureUrls = [];
        this.cardOrder = [];
        this.playerData = [];
        this.field = [];
        this.turnedCards = [];
        this.turnedIndexes = [];
        this.sessions = [];
        this.foundPairs = [];
        this.joinedSessions = [];
        this.connected = [];
        this.size.width = +size.width;
        this.size.height = +size.height;
        this.turn = 0;
        this.currentPlayer = -1;
        this.won = -1;
        var a = 1;
        for (var i = 0; i < this.size.width * this.size.height; i++) {
            this.cardOrder.push(a);
            this.field.push(0);
            if (i % 2 != 0)
                a++;
        }
        var newCardOrder = [];
        while (this.cardOrder.length > 0) {
            newCardOrder.push(this.cardOrder.splice(Math.random() * this.cardOrder.length, 1)[0]);
        }
        this.cardOrder = newCardOrder;
    }
    Game.prototype.getPlayers = function () {
        var players = [];
        for (var _i = 0, _a = this.playerData; _i < _a.length; _i++) {
            var data = _a[_i];
            players.push(data.name);
        }
        return players;
    };
    Game.prototype.getPlayerPoints = function () {
        var points = [];
        for (var _i = 0, _a = this.playerData; _i < _a.length; _i++) {
            var data = _a[_i];
            points.push(data.points);
        }
        return points;
    };
    Game.prototype.getPlayerIndex = function (sessionID) {
        for (var i = 0; i < this.playerData.length; i++)
            if (this.playerData[i].id === sessionID)
                return i;
        return -1;
    };
    Game.prototype.getPlayerName = function (sessionID) {
        for (var _i = 0, _a = this.playerData; _i < _a.length; _i++) {
            var data = _a[_i];
            if (data.id === sessionID)
                return data.name;
        }
        return "Waiting";
    };
    Game.prototype.waitAndTurnCards = function () {
        var _this = this;
        setTimeout(function () {
            _this.currentPlayer = _this.nextPlayer;
            for (var _i = 0, _a = _this.turnedIndexes; _i < _a.length; _i++) {
                var index = _a[_i];
                _this.field[index] = 0;
            }
            _this.turnedIndexes = [];
            _this.turnedCards = [];
        }, 300);
    };
    Game.prototype.deletePlayer = function (index) {
        if (this.currentPlayer == this.sessions[index]) {
            this.currentIndex++;
            if (this.currentIndex == this.sessions.length)
                this.currentIndex = 0;
            this.currentPlayer = this.sessions[this.currentIndex];
        }
        this.playerData.splice(index, 1);
        this.joinedSessions.splice(index, 1);
        this.sessions.splice(index, 1);
        this.connected.splice(index, 1);
    };
    Game.prototype.makeTurn = function (sessionID, index) {
        this.turn++;
        this.turnedCards.push(this.cardOrder[index]);
        this.turnedIndexes.push(index);
        this.field[index] = this.cardOrder[index];
        console.log(this.field);
        console.log(this.turnedCards);
        if (this.turn === 2) {
            this.turn = 0;
            if (this.turnedCards[0] === this.turnedCards[1]) {
                this.foundPairs.push(this.turnedCards[0]);
                this.turnedCards = [];
                this.turnedIndexes = [];
                this.playerData[this.getPlayerIndex(sessionID)].points++;
                if (this.foundPairs.length == (this.size.height * this.size.width) / 2)
                    this.won = 1;
            }
            else {
                this.currentIndex++;
                if (this.currentIndex == this.sessions.length)
                    this.currentIndex = 0;
                this.nextPlayer = this.sessions[this.currentIndex];
                this.currentPlayer = -1;
                this.waitAndTurnCards();
            }
        }
    };
    Game.prototype.addPictures = function (count, pictures) {
        this.pictureUrls.push('/memory.jpg');
        var taken = [];
        while (count > 0) {
            var index = Math.floor(Math.random() * (pictures.length - 1));
            if (taken.indexOf(index) != -1)
                continue;
            taken.push(index);
            this.pictureUrls.push(pictures[index]);
            count--;
        }
    };
    return Game;
}());
exports.Game = Game;
var PlayerData = (function () {
    function PlayerData(id, name) {
        this.id = id;
        this.name = name;
        this.points = 0;
    }
    return PlayerData;
}());
exports.PlayerData = PlayerData;
//# sourceMappingURL=classes.js.map