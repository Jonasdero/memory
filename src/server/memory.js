"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Memory = void 0;
const game_1 = require("./game");
class Memory extends game_1.Game {
    constructor(size, name, allPictureUrls) {
        super(name);
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
        const gameSize = this.data.size.width * this.data.size.height;
        if (!Number.isInteger(gameSize) || gameSize <= 0 || gameSize % 2 !== 0) {
            throw new Error('Invalid game size: the number of cards must be a positive even number');
        }
        const pairCount = gameSize / 2;
        if (pairCount > allPictureUrls.length) {
            throw new Error('Not enough pictures for the requested game size');
        }
        for (let i = 1; i <= pairCount; i++) {
            this.data.cardOrder.push(i, i);
            this.data.field.push(0, 0);
        }
        for (let i = this.data.cardOrder.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.data.cardOrder[i], this.data.cardOrder[j]] =
                [this.data.cardOrder[j], this.data.cardOrder[i]];
        }
        this.data.pictureUrls.push('/memory.jpg');
        const available = [...allPictureUrls];
        for (let i = 0; i < pairCount; i++) {
            const index = Math.floor(Math.random() * available.length);
            this.data.pictureUrls.push(available.splice(index, 1)[0]);
        }
    }
    waitAndTurnCards() {
        setTimeout(() => {
            this.currentPlayer = this.nextPlayer;
            for (const index of this.data.turnedIndexes)
                this.data.field[index] = 0;
            this.data.turnedIndexes = [];
            this.data.turnedCards = [];
        }, 1000);
    }
    makeTurn(sessionID, index) {
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
                let i = this.sessions.indexOf(this.currentPlayer) + 1;
                if (i === this.sessions.length)
                    i = 0;
                this.nextPlayer = this.sessions[i];
                this.currentPlayer = -1;
                this.waitAndTurnCards();
            }
        }
    }
}
exports.Memory = Memory;
//# sourceMappingURL=memory.js.map