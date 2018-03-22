"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var classes = require("./classes");
var Memory = (function (_super) {
    __extends(Memory, _super);
    function Memory(size, name, allPictureUrls) {
        var _this = _super.call(this, name) || this;
        _this.data = {
            size: { width: 0, height: 0 },
            cardOrder: [],
            field: [],
            pictureUrls: [],
            turnedCards: [],
            turnedIndexes: [],
            foundPairs: [],
        };
        _this.data.size.width = +size.width;
        _this.data.size.height = +size.height;
        var gameSize = _this.data.size.width * _this.data.size.height;
        for (var i = 1; i <= gameSize / 2; i++) {
            _this.data.cardOrder.push(i);
            _this.data.cardOrder.push(i);
            _this.data.field.push(0);
            _this.data.field.push(0);
        }
        for (var i = 0; i < _this.data.cardOrder.length; i++) {
            var index = Math.floor(Math.random() * _this.data.cardOrder.length);
            var temp = _this.data.cardOrder[index];
            _this.data.cardOrder[index] = _this.data.cardOrder[i];
            _this.data.cardOrder[i] = temp;
        }
        _this.addPictures(gameSize / 2, allPictureUrls);
        return _this;
    }
    Memory.prototype.waitAndTurnCards = function () {
        var _this = this;
        setTimeout(function () {
            _this.currentPlayer = _this.nextPlayer;
            for (var _i = 0, _a = _this.data.turnedIndexes; _i < _a.length; _i++) {
                var index = _a[_i];
                _this.data.field[index] = 0;
            }
            _this.data.turnedIndexes = [];
            _this.data.turnedCards = [];
        }, 300);
    };
    Memory.prototype.makeTurn = function (sessionID, index) {
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
                var i = this.sessions.indexOf(this.currentPlayer);
                if (i === this.sessions.length)
                    i = 0;
                this.nextPlayer = this.sessions[i];
                this.currentPlayer = -1;
                this.waitAndTurnCards();
            }
        }
    };
    Memory.prototype.addPictures = function (count, allPictureUrls) {
        this.data.pictureUrls.push('/memory.jpg');
        while (count > 0) {
            if (count >= allPictureUrls.length)
                throw ('Not enough pictures');
            var index = Math.floor(Math.random() * (allPictureUrls.length - 1));
            var name = '/' + allPictureUrls[index];
            if (this.data.pictureUrls.indexOf(name) != -1)
                continue;
            this.data.pictureUrls.push(name);
            count--;
        }
    };
    return Memory;
}(classes.Game));
exports.Memory = Memory;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVtb3J5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsibWVtb3J5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUFBLG1DQUFxQztBQUdyQztJQUE0QiwwQkFBWTtJQVdwQyxnQkFBWSxJQUFJLEVBQUUsSUFBWSxFQUFFLGNBQXdCO1FBQXhELFlBQ0ksa0JBQU0sSUFBSSxDQUFDLFNBcUJkO1FBaENELFVBQUksR0FBRztZQUNILElBQUksRUFBRSxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUUsTUFBTSxFQUFFLENBQUMsRUFBRTtZQUM3QixTQUFTLEVBQUUsRUFBRTtZQUNiLEtBQUssRUFBRSxFQUFFO1lBQ1QsV0FBVyxFQUFFLEVBQUU7WUFDZixXQUFXLEVBQUUsRUFBRTtZQUNmLGFBQWEsRUFBRSxFQUFFO1lBQ2pCLFVBQVUsRUFBRSxFQUFFO1NBQ2pCLENBQUE7UUFJRyxLQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDO1FBQ25DLEtBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUM7UUFDckMsSUFBSSxRQUFRLEdBQUcsS0FBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQTtRQUczRCxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxJQUFJLFFBQVEsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztZQUNyQyxLQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDNUIsS0FBSSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzVCLEtBQUksQ0FBQyxJQUFJLENB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