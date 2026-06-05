"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Game = void 0;
const playerdata_1 = require("./playerdata");
class Game {
    constructor(name) {
        this.playerData = [];
        this.sessions = [];
        this.joinedSessions = [];
        this.connectCount = [];
        this.gameID = -1;
        this.turn = 0;
        this.currentPlayer = -1;
        this.won = -1;
        this.name = name;
    }
    getAllPlayerNames() {
        let players = [];
        for (let data of this.playerData)
            players.push(data.name);
        return players;
    }
    getAllPlayerPoints() {
        let points = [];
        for (let data of this.playerData)
            points.push(data.points);
        return points;
    }
    getPlayerIndex(sessionID) {
        for (let i = 0; i < this.playerData.length; i++)
            if (this.playerData[i].id === sessionID)
                return i;
        return -1;
    }
    getPlayerName(sessionID) {
        for (let data of this.playerData)
            if (data.id === sessionID)
                return data.name;
        return "Waiting";
    }
    addPlayer(sessionID, name) {
        this.playerData.push(new playerdata_1.PlayerData(sessionID, name));
        this.sessions.push(sessionID);
        this.connectCount.push(0);
    }
    removePlayer(index) {
        if (this.currentPlayer == this.sessions[index]) {
            var i = this.sessions.indexOf(this.currentPlayer) + 1;
            if (i === this.sessions.length)
                i = 0;
            this.currentPlayer = this.sessions[i];
        }
        this.playerData.splice(index, 1);
        this.joinedSessions.splice(index, 1);
        this.sessions.splice(index, 1);
        this.connectCount.splice(index, 1);
    }
    joinGame(sessionID) {
        this.joinedSessions.push(sessionID);
        if (this.joinedSessions.length == this.sessions.length)
            this.currentPlayer = this.sessions[0];
    }
    checkOnlineTime(sessionID) {
        if (this.sessions.length < 2)
            return;
        this.connectCount[this.sessions.indexOf(sessionID)]++;
        let max = 0;
        let min = 100000;
        for (let i = 0; i < this.connectCount.length; i++) {
            if (min > this.connectCount[i])
                min = this.connectCount[i];
            if (max < this.connectCount[i])
                max = this.connectCount[i];
        }
        for (let i = 0; i < this.connectCount.length; i++)
            if (max - this.connectCount[i] >= 10)
                this.removePlayer(i);
        for (let i = 0; i < this.connectCount.length; i++)
            this.connectCount[i] = this.connectCount[i] - min;
    }
}
exports.Game = Game;
//# sourceMappingURL=game.js.map