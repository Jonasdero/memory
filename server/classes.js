"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Game = (function () {
    function Game(name) {
        this.playerData = [];
        this.sessions = [];
        this.joinedSessions = [];
        this.connectCount = [];
        this.turn = 0;
        this.currentPlayer = -1;
        this.won = -1;
        this.name = name;
    }
    Game.prototype.getAllPlayerNames = function () {
        var players = [];
        for (var _i = 0, _a = this.playerData; _i < _a.length; _i++) {
            var data = _a[_i];
            players.push(data.name);
        }
        return players;
    };
    Game.prototype.getAllPlayerPoints = function () {
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
    Game.prototype.addPlayer = function (sessionID, name) {
        this.playerData.push(new PlayerData(sessionID, name));
        this.sessions.push(sessionID);
        this.connectCount.push(0);
    };
    Game.prototype.removePlayer = function (index) {
        if (this.currentPlayer == this.sessions[index]) {
            var i = this.sessions.indexOf(this.currentPlayer);
            if (i === this.sessions.length)
                i = 0;
            this.currentPlayer = this.sessions[i];
        }
        this.playerData.splice(index, 1);
        this.joinedSessions.splice(index, 1);
        this.sessions.splice(index, 1);
        this.connectCount.splice(index, 1);
    };
    Game.prototype.joinGame = function (sessionID) {
        this.joinedSessions.push(sessionID);
        if (this.joinedSessions.length == this.sessions.length) {
            this.currentPlayer = this.sessions[0];
        }
    };
    Game.prototype.checkOnlineTime = function (sessionID) {
        this.connectCount[this.sessions.indexOf(sessionID)]++;
        var max = 0;
        for (var i = 0; i < this.connectCount.length; i++)
            if (max < this.connectCount[i])
                max = this.connectCount[i];
        for (var i = 0; i < this.connectCount.length; i++)
            if (this.connectCount[i] - max > 8)
                this.removePlayer(i);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xhc3Nlcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImNsYXNzZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTtJQWFJLGNBQVksSUFBSTtRQVhoQixlQUFVLEdBQWlCLEVBQUUsQ0FBQztRQUs5QixhQUFRLEdBQWEsRUFBRSxDQUFDO1FBQ3hCLG1CQUFjLEdBQWEsRUFBRSxDQUFDO1FBQzlCLGlCQUFZLEdBQWEsRUFBRSxDQUFDO1FBS3hCLElBQUksQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDO1FBQ2QsSUFBSSxDQUFDLGFBQWEsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUN4QixJQUFJLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQ2QsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7SUFDckIsQ0FBQztJQUdELGdDQUFpQixHQUFqQjtRQUNJLElBQUksT0FBTyxHQUFHLEVBQUUsQ0FBQztRQUNqQixHQUFHLENBQUMsQ0FBYSxVQUFlLEVBQWYsS0FBQSxJQUFJLENBQUMsVUFBVSxFQUFmLGNBQWUsRUFBZixJQUFlO1lBQTNCLElBQUksSUFBSSxTQUFBO1lBQXFCLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQUE7UUFDMUQsTUFBTSxDQUFDLE9BQU8sQ0FBQztJQUNuQixDQUFDO0lBR0QsaUNBQWtCLEdBQWxCO1FBQ0ksSUFBSSxNQUFNLEdBQUcsRUFBRSxDQUFDO1FBQ2hCLEdBQUcsQ0FBQyxDQUFhLFVBQWUsRUFBZixLQUFBLElBQUksQ0FBQyxVQUFVLEVBQWYsY0FBZSxFQUFmLElBQWU7WUFBM0IsSUFBSSxJQUFJLFNBQUE7WUFBcUIsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7U0FBQTtRQUMzRCxNQUFNLENBQUMsTUFBTSxDQUFDO0lBQ2xCLENBQUM7SUFHRCw2QkFBYyxHQUFkLFVBQWUsU0FBaUI7UUFDNUIsR0FBRyxDQUFDLENB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