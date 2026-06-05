import { Game } from './game';

export class Memory extends Game {
    data = {
        size: { width: 0, height: 0 },
        cardOrder: [] as number[],   // Order in that the pairs are on the field
        field: [] as number[],       // Current picture id that is shown on the field
        pictureUrls: [] as string[], // Urls to all pictures
        turnedCards: [] as number[], // Cards from cardOrder that are currently turned
        turnedIndexes: [] as number[], // Indexes from field that are currently turned
        foundPairs: [] as number[],  // Found pairs
    };

    constructor(size: { width: number | string; height: number | string }, name: string, allPictureUrls: string[]) {
        super(name);
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

        // Fill cardOrder [1,1,2,2,3,3,...] and field [0,0,0,...]
        for (let i = 1; i <= pairCount; i++) {
            this.data.cardOrder.push(i, i);
            this.data.field.push(0, 0);
        }

        // Shuffle cardOrder (Fisher-Yates)
        for (let i = this.data.cardOrder.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.data.cardOrder[i], this.data.cardOrder[j]] =
                [this.data.cardOrder[j], this.data.cardOrder[i]];
        }

        // pictureUrls[0] is the card back, indexes 1..pairCount are the unique motifs
        this.data.pictureUrls.push('/memory.jpg');
        const available = [...allPictureUrls];
        for (let i = 0; i < pairCount; i++) {
            const index = Math.floor(Math.random() * available.length);
            this.data.pictureUrls.push(available.splice(index, 1)[0]);
        }
    }

    waitAndTurnCards() {
        setTimeout(() => {
            // Set next player
            this.currentPlayer = this.nextPlayer;

            // Turn all turned fields back to 0 (backside) and clear the buffers
            for (const index of this.data.turnedIndexes)
                this.data.field[index] = 0;
            this.data.turnedIndexes = [];
            this.data.turnedCards = [];
        }, 1000);
    }

    makeTurn(sessionID: number, index: number) {
        this.turn++;

        this.data.turnedCards.push(this.data.cardOrder[index]);
        this.data.turnedIndexes.push(index);
        this.data.field[index] = this.data.cardOrder[index];

        if (this.turn === 2) {
            this.turn = 0;
            // Check if both cards were of the same type
            if (this.data.turnedCards[0] === this.data.turnedCards[1]) {
                this.data.foundPairs.push(this.data.turnedCards[0]);
                this.data.turnedCards = [];
                this.data.turnedIndexes = [];

                // Give currentPlayer a point
                this.playerData[this.getPlayerIndex(sessionID)].points++;

                // Check if all pairs were found
                if (this.data.foundPairs.length == (this.data.size.height * this.data.size.width) / 2)
                    this.won = 1;
            } else {
                // Save the next player and hide the cards again after a short delay
                let i = this.sessions.indexOf(this.currentPlayer) + 1;
                if (i === this.sessions.length) i = 0;
                this.nextPlayer = this.sessions[i];
                this.currentPlayer = -1;
                this.waitAndTurnCards();
            }
        }
    }
}
