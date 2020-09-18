import deckPack from "@andrewcreated/deck-of-cards.js";
const { baseDeck } = deckPack;
import promptMaker from "prompt-sync";
const prompt = promptMaker({ sigint: true });
import { GameState } from "./GameState";
import { cL, LevelStates } from "./LevelState";
import { isSpecial, handleSpecialCard, pullOutDiamonds } from "./CardUtilities";
import { Announce } from "./Announce";

/** @typedef {import("@andrewcreated/deck-of-cards.js/dist/standard52CardsAndJokers").Standard52Card} Standard52Card */

/** @param {Standard52Card} card */
const checkForObstacle = (card) => {
  cL.obstacleAttempted = true;

  // If no obstacle, make this card the obstacle
  if (!cL.obstacle) {
    cL.obstacle = card;
    return;
  }

  // Check if card beats the obstacle
  if (cL.obstacle.numberRank > card.numberRank) {
    // Card doesn't beat obstacle, check if monster (keep trying) or lose the level
    if (cL.obstacleType === "Monster") {
      // Reduce monsterHP by card's value
      cL.monsterHP -= card.numberRank;

      // Check if we cleared the level
      if (cL.monsterHP <= 0) {
        cL.obstacleCleared = true;
      } else {
        /** Health has to be subtracted by numberRank + 2 due to rank[0] === 2 */
        GameState.health -= cL.obstacle.numberRank + 2;
      }
    } else {
      // Take damage and lose treasure if Trap, just lose treasure if Door
      const diamondCards = pullOutDiamonds(cL.cards);

      // Make sure at least one card remains, even if it's a diamond
      if (cL.cards.length < 1) {
        const lowestDiamond = cL.cards.reduce((lowestCard, card) => {
          if (card.numberRank > lowestCard.numberRank) lowestCard = card;
          return lowestCard;
        }, diamondCards[0]);
        cL.cards.push(lowestDiamond);
      }

      if (cL.obstacleType === "Trap") {
        GameState.health -= cL.obstacle.numberRank + 2;
      }
    }
  } else {
    // Card beats the obstacle, so we mark it cleared
    cL.obstacleCleared = true;
  }
};

/** @returns {() => void} */
const handleRoundEnd = () => {
  // Check if at least one torch remains
  if (GameState.torchesBlownOut === 4) {
    GameState.gameOver = true;
    return Announce.lostInTheDark;
  }

  // Check if out of health
  if (GameState.health <= 0) {
    GameState.gameOver = true;
    return Announce.died;
  }

  // Didn't lose, so assign treasure
  if (cL.obstacleCleared) cL.assignTreasures();

  // Check if won
  if (GameState.level === 0 && GameState.travelingUp) {
    GameState.gameOver = true;
    return Announce.won;
  }

  let hasObstacle = false;
  if (cL.obstacle && !cL.obstacleCleared) {
    hasObstacle = true;
  }

  // Ask user if they want to draw another card (if *allowed*), continue going down (if allowed), continue going up, or use a spell (Jack of Hearts or Spell of Light).
  return () => Announce.askForNextMove(hasObstacle ? cL.obstacleType : "None");
};

export function beginGame() {
  Announce.preamble();

  baseDeck.shuffle(3);

  GameState.moveToNewFloor();

  while (!GameState.gameOver) {
    const newCard = baseDeck.drawFromDrawPile(1)[0];
    console.log("You drew the ", newCard.name);

    /** @param {boolean} specialCard */
    const specialCard = isSpecial(newCard);

    if (specialCard) return handleSpecialCard(newCard);

    // Check if user has a spell available
    const relatedSpells = GameState.getRelatedSpells(cL.obstacleType);
    if (relatedSpells) {
      // Ask user if they want to use the spell
      Announce.askToUseSpell(relatedSpells);
    }

    // Add the card to the stack of cards for this level
    cL.cards.unshift(newCard);

    // See if there's an obstacle, add an obstacle if not, try and beat it if present
    if (newCard.suit !== "Diamonds") checkForObstacle(newCard);

    const nextAction = handleRoundEnd();
    if (nextAction) nextAction();
  }
}

beginGame();
