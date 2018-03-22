"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Game = (function () {
    function Game(size) {
        this.playerData = [];
        this.sessions = [];
        this.joinedSessions = [];
        this.connected = [];
        this.data = {
            size: { width: 0, height: 0 },
            cardOrder: [],
            field: [],
            pictureUrls: [],
            turnedCards: [],
            turnedIndexes: [],
            foundPairs: [],
        };
        this.data.size.width = +size.width;
        this.data.size.height = +size.height;
        this.turn = 0;
        this.currentPlayer = -1;
        this.won = -1;
        for (var i = 0; i < this.data.size.width * this.data.size.height / 2; i++) {
            this.data.cardOrder.push(i);
            this.data.cardOrder.push(i);
            this.data.field.push(0);
            this.data.field.push(0);
        }
        var newCardOrder = [];
        while (this.data.cardOrder.length > 0) {
            newCardOrder.push(this.data.cardOrder.splice(Math.random() * this.data.cardOrder.length, 1)[0]);
        }
        this.data.cardOrder = newCardOrder;
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
            for (var _i = 0, _a = _this.data.turnedIndexes; _i < _a.length; _i++) {
                var index = _a[_i];
                _this.data.field[index] = 0;
            }
            _this.data.turnedIndexes = [];
            _this.data.turnedCards = [];
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
        this.data.turnedCards.push(this.data.cardOrder[index]);
        this.data.turnedIndexes.push(index);
        this.data.field[index] = this.data.cardOrder[index];
        if (this.turn === 2) {
            this.turn = 0;
            if (this.data.turnedCards[0] === this.data.turnedCards[1]) {
                this.data.foundPairs.push(this.data.turnedCards[0]);
                this.data.turnedCards = [];
                this.data.turnedIndexes = [];
                this.playerData[this.getPlayerIndex(sessionID)].points++;
                if (this.data.foundPairs.length == (this.data.size.height * this.data.size.width) / 2)
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
        this.data.pictureUrls.push('/memory.jpg');
        var taken = [];
        while (count > 0) {
            var index = Math.floor(Math.random() * (pictures.length - 1));
            if (taken.indexOf(index) != -1)
                continue;
            taken.push(index);
            this.data.pictureUrls.push(pictures[index]);
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