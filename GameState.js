/** @typedef {import("@andrewcreated/deck-of-cards.js/dist/standard52CardsAndJokers").Standard52Card} Standard52Card */

import { LevelStates, levelTemplate } from "./LevelState";

/** @typedef {Object} GameState
 * @property {boolean} gameOver
 * @property {number} health
 * @property {number} level
 * @property {string} playerName
 * @property {Standard52Card[]} spells
 * @property {number} torchesBlownOut
 * @property {boolean} travelingUp
 * @property {Standard52Card[]} treasure
 * @property {string} direction
 * @property {(card: Standard52Card) => void} addToSpellBook
 * @property {(direction?: string) => void} moveToNewFloor
 * @property {number} currentScore
 * @property {(obstacleType: string) => Standard52Card[]} getRelatedSpells
 * @property {(spellNumber: Standard52Card) => Promise<void>} useSpell
 */

/** @type {GameState} */
export const GameState = {
  gameOver: false,
  health: 9,
  level: 0,
  playerName: "Explorer",
  spells: [],
  torchesBlownOut: 0,
  travelingUp: false,
  treasure: [],

  get direction() {
    return this.level === 0 ? "" : this.travelingUp ? "up" : "down";
  },

  /** @param {Standard52Card} card */
  addToSpellBook(card) {
    this.spells.push(card);
  },

  moveToNewFloor(direction = "down") {
    this.travelingUp = direction === "up";
    this.level = this.travelingUp ? ++this.level : --this.level;
    LevelStates.unshift({ ...levelTemplate, floorId: this.level + this.direction });
  },

  get currentScore() {
    const treasureValue = this.treasure.reduce((score, card) => {
      return card.nameRank === "King" ? score + 10 : score + card.numberRank + 2;
    }, 0);
    const hasJoker = this.spells.find((card) => card.nameRank === "Joker");
    return hasJoker ? treasureValue + 6 : treasureValue;
  },

  getRelatedSpells(obstacleType) {
    const obstaclesAndSuitsMap = {
      Monster: "Spades",
      Trap: "Diamonds",
      Door: "Clubs",
    };
    return this.spells.filter((card) => {
      if (obstaclesAndSuitsMap[obstacleType] === card.suit) return card;
      return false;
    });
  },

  async useSpell(spell) {
    // TODO: useSpell()
  },
};