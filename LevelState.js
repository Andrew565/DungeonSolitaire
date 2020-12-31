/** @typedef {import("@andrewcreated/deck-of-cards.js/dist/standard52CardsAndJokers").Standard52Card} Standard52Card */

import { GameState } from "./GameState";

/**
 * @typedef LevelTemplate
 * @property {number} floorId
 * @property {Standard52Card[]} cards
 * @property {number} monsterHP
 * @property {Standard52Card} obstacle
 * @property {boolean} obstacleAttempted
 * @property {boolean} obstacleCleared
 * @property  {ObstacleType | undefined} obstacleType
 * @property {boolean} goddessFound
 * @property {() => string | undefined} getObstacleName
 * @property {VoidFunc} assignTreasures
 * @property {VoidFunc} announceFloor
 * @property {VoidFunc} announceLevelState
 */

/** @type {LevelTemplate} */
export const levelTemplate = {
  floorId: 0,
  cards: [],
  monsterHP: 0,
  obstacle: undefined,
  obstacleAttempted: false,
  obstacleCleared: false,
  obstacleType: undefined,
  goddessFound: false,

  getObstacleName() {
    return this.obstacle ? this.obstacle.name : undefined;
  },

  assignTreasures() {
    // Find all of the diamonds
    /** @type {Standard52Card[]} */
    const diamondCards = this.cards
      .filter((card) => card.suit === "Diamonds")
      .splice(0);

    // Check if there are any cards left
    if (this.cards.length === 0) {
      const lowestDiamond = diamondCards.reduce((acc, card) =>
        card.numberRank < acc.numberRank ? card : acc
      );
      this.cards.push(lowestDiamond);
    }
  },

  announceFloor() {
    const newFloor = this.cards.length === 0;
    console.log(
      `You are ${newFloor ? "now" : "still"} on Floor ${GameState.level}`
    );
  },

  announceLevelState() {
    const levelObstacleName = this.getObstacleName();
    console.log(`Before you lies a ${levelObstacleName}`);
  },
};

class LevelState {
  constructor() {
    /** @type {LevelTemplate[]} */
    this._levels = [{ ...levelTemplate, floorId: 0 }];
  }

  /** @param {number} nextFloorId */
  addLevel(nextFloorId) {
    this._levels.push({ ...levelTemplate, floorId: nextFloorId });
  }

  get current() {
    return this._levels[this._levels.length - 1];
  }
}

export const LevelStates = new LevelState();
export const cL = () => LevelStates.current;
