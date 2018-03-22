export class Game {
    name: string;
    playerData: PlayerData[] = [];
    turn: number;
    won: number;
    nextPlayer: number;
    currentPlayer: number;
    currentIndex: number;
    sessions: number[] = [];
    joinedSessions: number[] = [];
    connected: number[] = [];

    data = {
        size: { width: 0, height: 0 },
        cardOrder: [],
        field: [],
        pictureUrls: [],
        turnedCards: [],
        turnedIndexes: [],
        foundPairs: [],
    }

    constructor(size) {
        this.data.size.width = +size.width;
        this.data.size.height = +size.height;
        this.turn = 0;
        this.currentPlayer = -1;
        this.won = -1;
        for (let i = 0; i < this.data.size.width * this.data.size.height / 2; i++) {
            this.data.cardOrder.push(i);
            this.data.cardOrder.push(i);
            this.data.field.push(0);
            this.data.field.push(0);
        }
        var newCardOrder: number[] = [];
        while (this.data.cardOrder.length > 0) {
            newCardOrder.push(this.data.cardOrder.splice(Math.random() * this.data.cardOrder.length, 1)[0]);
        }
        this.data.cardOrder = newCardOrder;
    }

    getPlayers(): string[] {
        let players = [];
        for (let data of this.playerData)
            players.push(data.name);
        return players;
    }

    getPlayerPoints(): number[] {
        let points = [];
        for (let data of this.playerData)
            points.push(data.points);
        return points;
    }

    getPlayerIndex(sessionID: number): number {
        for (let i = 0; i < this.playerData.length; i++)
            if (this.playerData[i].id === sessionID) return i;
        return -1;
    }
    getPlayerName(sessionID: number): string {
        for (let data of this.playerData)
            if (data.id === sessionID) return data.name;
        return "Waiting";
    }
    waitAndTurnCards() {
        setTimeout(() => {
            this.currentPlayer = this.nextPlayer;
            for (let index of this.data.turnedIndexes)
                this.data.field[index] = 0;
            this.data.turnedIndexes = [];
            this.data.turnedCards = [];
        }, 300)
    }
    deletePlayer(index: number) {
        if (this.currentPlayer == this.sessions[index]) {
            this.currentIndex++;
            if (this.currentIndex == this.sessions.length) this.currentIndex = 0;
            this.currentPlayer = this.sessions[this.currentIndex];
        }
        this.playerData.splice(index, 1);
        this.joinedSessions.splice(index, 1);
        this.sessions.splice(index, 1);
        this.connected.splice(index, 1);
    }
    makeTurn(sessionID: number, index: number) {
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
                if (this.data.foundPairs.length == (this.data.size.height * this.data.size.width) / 2) this.won = 1;
            } else {
                this.currentIndex++;
                if (this.currentIndex == this.sessions.length) this.currentIndex = 0;
                this.nextPlayer = this.sessions[this.currentIndex];
                this.currentPlayer = -1;
                this.waitAndTurnCards();
            }
        }
    }

    addPictures(count: number, pictures: string[]) {
        this.data.pictureUrls.push('/memory.jpg')
        let taken = [];
        while (count > 0) {
            var index = Math.floor(Math.random() * (pictures.length - 1));
            if (taken.indexOf(index) != -1)
                continue;
            taken.push(index);
            this.data.pictureUrls.push(pictures[index]);
            count--;
        }
    }
}

export class PlayerData {
    id: number;
    name: string;
    points: number;
    constructor(id: number, name: string) {
        this.id = id;
        this.name = name;
        this.points = 0;
    }
}