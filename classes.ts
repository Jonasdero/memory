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
    turnedCards: number[] = [];
    turnedIndexes: number[] = [];
    sessions: number[] = [];
    foundPairs: number[] = [];
    // Picture
    constructor(size) {
        this.size.width = +size.width;
        this.size.height = +size.height;
        this.turn = 0;
        this.currentPlayer = -1;
        this.won = -1;
        let a = 0;
        for (let i = 0; i < this.size.width * this.size.height; i++) {
            this.cardOrder.push(a);
            this.field.push(0);
            if (i % 2 != 0) a++;
        }
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

    waitAndTurnCards() {
        setInterval(() => {
            this.currentPlayer = this.nextPlayer;
            this.turn = 0;
            for (let index of this.turnedIndexes)
                this.field[index] = 0;
            this.turnedIndexes = [];
            this.turnedCards = [];
        }, 2500)
    }

    makeTurn(sessionID: number, index: number) {
        this.turn++;
        this.turnedCards.push(this.cardOrder[index]);
        this.turnedIndexes.push(index);

        if (this.turn === 2) {
            if (this.turnedCards[0] === this.turnedCards[1]) {
                this.foundPairs.push(this.turnedCards[0]);
                this.turnedCards = [];
                this.turnedIndexes = [];
                this.playerData[this.getPlayerIndex(sessionID)].points++;
                if (this.foundPairs.length == (this.size.height * this.size.width) / 2) this.won = 1;
            } else {
                let index = this.getPlayerIndex(this.currentPlayer) + 1;
                if (index = this.playerData.length) index = 0;
                this.nextPlayer = this.playerData[index].id
                this.currentPlayer = -1;
                this.waitAndTurnCards();
            }
        }
    }

    addPictures(count: number, pictures: string[]) {
        this.pictureUrls.push('/memory.txt')
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