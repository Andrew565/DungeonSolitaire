/** @typedef {import("@andrewcreated/deck-of-cards.js/dist/standard52CardsAndJokers").Standard52Card} Standard52Card */

import { GameState } from "./GameState";

/**
 * @typedef {object} LevelTemplate
 * @property {string} floorId
 * @property {Standard52Card[]} cards
 * @property {number} monsterHP
 * @property {Standard52Card} obstacle
 * @property {boolean} obstacleAttempted
 * @property {boolean} obstacleCleared
 * @property  {"Door" | "Monster" | "Trap" | undefined} obstacleType
 * @property {boolean} goddessFound
 * @property {function} getObstacleName
 * @property {function} assignTreasures
 * @property {function} announceFloor
 * @property {function} announceLevelState
 */
export const levelTemplate = {
  floorId: 0,
  cards: [],
  monsterHP: 0,
  obstacle: undefined,
  obstacleAttempted: false,
  obstacleCleared: false,
  obstacleType: undefined,
  goddessFound: false,

  /** @returns {string | undefined} */
  getObstacleName() {
    return this.obstacle.name || undefined;
  },

  assignTreasures() {
    // Find all of the diamonds
    /** @type {Standard52Card[]} */
    const diamondCards = this.cards.filter((card) => card.suit === "Diamonds").splice(0);

    // Check if there are any cards left
    if (this.cards.length === 0) {
      const lowestDiamond = diamondCards.reduce((acc, card) => (card.numberRank < acc.numberRank ? card : acc));
      this.cards.push(lowestDiamond);
    }
  },

  announceFloor() {
    const newFloor = this.cards.length === 0;
    console.log(`You are ${newFloor ? "now" : "still"} on Floor ${GameState.level}`);
  },

  announceLevelState() {
    const levelObstacleName = this.getObstacleName();
    console.log(`Before you lies a ${levelObstacleName}`);
  },
};

// Initializes the "LevelStates" container, along with an example of adding a new level
/** @type {LevelTemplate[]} */
export const LevelStates = [{ ...levelTemplate, floorId: "0" }];

/** @returns {LevelTemplate} */
export const currentLevel = LevelStates[0];
export const cL = currentLevel;
