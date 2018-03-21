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
    Game.prototype.waitAndTurnCards = function () {
        var _this = this;
        setInterval(function () {
            _this.currentPlayer = _this.nextPlayer;
            _this.turn = 0;
            for (var _i = 0, _a = _this.turnedIndexes; _i < _a.length; _i++) {
                var index = _a[_i];
                _this.field[index] = 0;
            }
            _this.turnedIndexes = [];
            _this.turnedCards = [];
        }, 2500);
    };
    Game.prototype.makeTurn = function (sessionID, index) {
        this.turn++;
        this.turnedCards.push(this.cardOrder[index]);
        this.turnedIndexes.push(index);
        this.field[index] = this.cardOrder[index];
        if (this.turn === 2) {
            if (this.turnedCards[0] === this.turnedCards[1]) {
                this.foundPairs.push(this.turnedCards[0]);
                this.turnedCards = [];
                this.turnedIndexes = [];
                this.playerData[this.getPlayerIndex(sessionID)].points++;
                if (this.foundPairs.length == (this.size.height * this.size.width) / 2)
                    this.won = 1;
            }
            else {
                var index_1 = this.getPlayerIndex(this.currentPlayer) + 1;
                if (index_1 = this.playerData.length)
                    index_1 = 0;
                this.nextPlayer = this.playerData[index_1].id;
                this.currentPlayer = -1;
                this.waitAndTurnCards();
            }
        }
        console.log(this.field);
        console.log(this.cardOrder);
        console.log(this.turnedCards);
        console.log(this.turnedIndexes);
        console.log(this.currentPlayer);
        console.log(this.nextPlayer);
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