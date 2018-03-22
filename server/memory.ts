import * as classes from './classes';
import * as fs from 'fs';

export class Memory extends classes.Game {
    data = {
        size: { width: 0, height: 0 },
        cardOrder: [],
        field: [],
        pictureUrls: [],
        turnedCards: [],
        turnedIndexes: [],
        foundPairs: [],
    }

    constructor(size, name: string, allPictureUrls: string[]) {
        super(name);
        this.data.size.width = +size.width;
        this.data.size.height = +size.height;
        // Fill cardOrder [1,1,2,2,3,3,4,4,...] and field [0,0,0,0,0,...]
        for (let i = 1; i <= this.data.size.width * this.data.size.height / 2; i++) {
            this.data.cardOrder.push(i);
            this.data.cardOrder.push(i);
            this.data.field.push(0);
            this.data.field.push(0);
        }
        // Randomize cardOrder
        for (let i = 0; i < this.data.cardOrder.length; i++) {
            var index = Math.floor(Math.random() * this.data.cardOrder.length);
            var temp = this.data.cardOrder[index];
            this.data.cardOrder[index] = this.data.cardOrder[i];
            this.data.cardOrder[i] = temp;
        }
        // Add pictures
        this.addPictures(this.data.size.width * this.data.size.height / 2, allPictureUrls)
    }

    waitAndTurnCards() {
        setTimeout(() => {
            // Set next player
            this.currentPlayer=this.nextPlayer;

            // turn all turned fields to 0 (backside) and empty turnedIn
            for (let index of this.data.turnedIndexes)
                this.data.field[index] = 0;
            this.data.turnedIndexes = [];
            this.data.turnedCards = [];
        }, 300)
    }

    makeTurn(sessionID: number, index: number) {
        this.turn++;
        this.data.turnedCards.push(this.data.cardOrder[index]);
        this.data.turnedIndexes.push(index);
        this.data.field[index] = this.data.cardOrder[index];
        if (this.turn === 2) {
            this.turn = 0;
            // check if both cards were from the same type
            if (this.data.turnedCards[0] === this.data.turnedCards[1]) {
                this.data.foundPairs.push(this.data.turnedCards[0]);
                this.data.turnedCards = [];
                this.data.turnedIndexes = [];

                // give currentPlayer points
                this.playerData[this.getPlayerIndex(sessionID)].points++;

                // check if all pairs were found
                if (this.data.foundPairs.length == (this.data.size.height * this.data.size.width) / 2)
                    this.won = 1;
            } else {                
                var i = this.sessions.indexOf(this.currentPlayer);
                if (i === this.sessions.length) i = 0;
                this.nextPlayer = this.sessions[i];
                this.currentPlayer = -1;
                this.waitAndTurnCards();
            }
        }
    }

    addPictures(count: number, allPictureUrls: string[]) {
        // Get all pictures from /pictures except memory.jpg
        // Take random pictures out of this list
        this.data.pictureUrls.push('/memory.jpg');
        while (count > 0) {
            if (count >= allPictureUrls.length) throw ('Not enough pictures');
            var index = Math.floor(Math.random() * (allPictureUrls.length - 1));
            var name = '/' + allPictureUrls[index];
            if (this.data.pictureUrls.indexOf(name) != -1) continue;
            this.data.pictureUrls.push(name);
            count--;
        }
    }
}