export class Game {
    name: string;
    size: { width: number, height: number } = { width: 0, height: 0 };
    pictureUrls: string[] = [];
    cardOrder: number[] = [];
    playerData: PlayerData[] = [];
    field: number[] = [];
    turn: number;
    won: number;
    nextPlayer: number;
    currentPlayer: number;
    currentIndex: number;
    turnedCards: number[] = [];
    turnedIndexes: number[] = [];
    sessions: number[] = [];
    foundPairs: number[] = [];
    joinedSessions: number[] = [];

    connected: number[] = [];
    // Picture
    constructor(size) {

        this.size.width = +size.width;
        this.size.height = +size.height;
        this.turn = 0;
        this.currentPlayer = -1;
        this.won = -1;
        for (let i = 0; i < this.size.width * this.size.height/2; i++) {
            this.cardOrder.push(i);
            this.cardOrder.push(i);
            this.field.push(0);
            this.field.push(0);
        }
        var newCardOrder: number[] = [];
        while (this.cardOrder.length > 0) {
            newCardOrder.push(this.cardOrder.splice(Math.random() * this.cardOrder.length, 1)[0]);
        }
        this.cardOrder = newCardOrder;
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
            for (let index of this.turnedIndexes)
                this.field[index] = 0;
            this.turnedIndexes = [];
            this.turnedCards = [];
        }, 300)
    }
    deletePlayer(index: number) {
        if (this.currentPlayer == this.sessions[index]){
            this.currentIndex++;
        if (this.currentIndex == this.sessions.length) this.currentIndex = 0;
        this.currentPlayer = this.sessions[this.currentIndex];}
        this.playerData.splice(index, 1);
        this.joinedSessions.splice(index, 1);
        this.sessions.splice(index, 1);
        this.connected.splice(index, 1);
    }
    makeTurn(sessionID: number, index: number) {
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
                if (this.foundPairs.length == (this.size.height * this.size.width) / 2) this.won = 1;
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
        this.pictureUrls.push('/memory.jpg')
        let taken = [];
        while (count > 0) {
            var index = Math.floor(Math.random() * (pictures.length - 1));
            if (taken.indexOf(index) != -1)
                continue;
            taken.push(index);
            this.pictureUrls.push(pictures[index]);
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