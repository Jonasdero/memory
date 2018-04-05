import { PlayerData } from './playerdata';

export abstract class Game {
    name: string;
    playerData: PlayerData[] = [];
    turn: number;
    won: number;
    currentPlayer: number;
    nextPlayer: number;
    sessions: number[] = [];
    joinedSessions: number[] = [];
    connectCount: number[] = [];
    data: {};
    gameID: number = -1;

    constructor(name) {
        this.turn = 0;
        this.currentPlayer = -1;
        this.won = -1;
        this.name = name;
    }

    // Get all player names
    getAllPlayerNames(): string[] {
        let players = [];
        for (let data of this.playerData) players.push(data.name);
        return players;
    }

    // Get all player points
    getAllPlayerPoints(): number[] {
        let points = [];
        for (let data of this.playerData) points.push(data.points);
        return points;
    }

    // Get the index of a certain player
    getPlayerIndex(sessionID: number): number {
        for (let i = 0; i < this.playerData.length; i++)
            if (this.playerData[i].id === sessionID) return i;
        return -1;
    }

    // Get the name of a certain player
    getPlayerName(sessionID: number): string {
        for (let data of this.playerData)
            if (data.id === sessionID) return data.name;
        return "Waiting";
    }

    // Add a player to the game
    addPlayer(sessionID: number, name: string) {
        this.playerData.push(new PlayerData(sessionID, name));
        this.sessions.push(sessionID);
        this.connectCount.push(0);
    }

    // Remove the player from the game (for example when he exits the game)
    removePlayer(index: number) {
        if (this.currentPlayer == this.sessions[index]) {
            var i = this.sessions.indexOf(this.currentPlayer) + 1;
            if (i === this.sessions.length) i = 0;
            this.currentPlayer = this.sessions[i];
        }
        this.playerData.splice(index, 1);
        this.joinedSessions.splice(index, 1);
        this.sessions.splice(index, 1);
        this.connectCount.splice(index, 1);
    }

    abstract makeTurn(sessionID: number, index: number)

    // Player is in lobby and wants to start the game
    joinGame(sessionID: number) {
        this.joinedSessions.push(sessionID);

        if (this.joinedSessions.length == this.sessions.length)
            this.currentPlayer = this.sessions[0];
    }

    // Check if other players are offline / exited the game
    checkOnlineTime(sessionID: number) {
        if (this.sessions.length < 2) return;
        this.connectCount[this.sessions.indexOf(sessionID)]++;
        let max = 0;
        let min = 100000;
        for (let i = 0; i < this.connectCount.length; i++) {
            if (min > this.connectCount[i]) min = this.connectCount[i];
            if (max < this.connectCount[i]) max = this.connectCount[i];
        }

        // If other players didnt requested something for 8 cycles they are removed from the game
        for (let i = 0; i < this.connectCount.length; i++)
            if (max - this.connectCount[i] >= 10)
                this.removePlayer(i);

        for (let i = 0; i < this.connectCount.length; i++)
            this.connectCount[i] = this.connectCount[i] - min;
    }
}
