import { GameState } from "./GameState";
import { cL } from "./LevelState";
import * as CardUtilities from "./CardUtilities";
import { Announce } from "./Announce";
import { baseDeck } from ".";

/** @param {Standard52Card} card */
export const checkForObstacle = (card) => {
  const cLevel = cL();
  cLevel.obstacleAttempted = true;

  // If no obstacle, make this card the obstacle
  if (!cLevel.obstacle) {
    cLevel.obstacle = card;
    return;
  }

  // Check if card beats the obstacle
  if (cLevel.obstacle.numberRank > card.numberRank) {
    // Card doesn't beat obstacle, check if monster (keep trying) or lose the level
    if (cLevel.obstacleType === "Monster") {
      // Reduce monsterHP by card's value
      cLevel.monsterHP -= card.numberRank;

      // Check if we cleared the level
      if (cLevel.monsterHP <= 0) {
        cLevel.obstacleCleared = true;
      } else {
        /** Check if there is an active Jack of Hearts to apply */
        if (cLevel.applyJackOfHearts) {
          // Take no damage this round, but use up the Jack
          cLevel.applyJackOfHearts = false;
        } else {
          /** Health has to be subtracted by numberRank + 2 due to rank[0] === 2 */
          GameState.health -= cLevel.obstacle.numberRank + 2;
        }
      }
    } else {
      // Take damage and lose treasure if Trap, just lose treasure if Door
      const diamondCards = CardUtilities.pullOutDiamonds(cLevel.cards);

      // Make sure at least one card remains, even if it's a diamond
      if (cLevel.cards.length < 1) {
        const lowestDiamond = cLevel.cards.reduce((lowestCard, aCard) => {
          if (aCard.numberRank > lowestCard.numberRank) lowestCard = aCard;
          return lowestCard;
        }, diamondCards[0]);
        cLevel.cards.push(lowestDiamond);
      }

      if (cLevel.obstacleType === "Trap") {
        GameState.health -= cLevel.obstacle.numberRank + 2;
      }
    }
  } else {
    // Card beats the obstacle, so we mark it cleared
    cLevel.obstacleCleared = true;
  }
};

/** @returns {VoidFunc | void} */
export const handleRoundEnd = () => {
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
  if (cL().obstacleCleared) cL().assignTreasures();

  // Check if won
  if (GameState.level === 0 && GameState.travelingUp) {
    GameState.gameOver = true;
    return Announce.won;
  }

  // Ask user if they want to (d)raw another card (if *allowed*), continue going down (if allowed), continue going up, or use a spell (Jack of Hearts or Spell of Light).
  const choice = Announce.askForNextMove();

  // Going dow(n) or (u)p
  if (["n", "u"].includes(choice)) {
    GameState.moveToNextFloor(choice === "u" ? "up" : "down");
  }

  // Use a (s)pell
  if (choice === "s") {
    const spells = GameState.getRelatedSpells(cL().obstacleType);
    Announce.announceRelatedSpells(spells);
  }

  // done with this round, continue on.
  return;
};

export const doAGameRound = () => {
  const newCard = baseDeck.drawFromDrawPile(1)[0];
  Announce.newCard(newCard);

  const specialCard = CardUtilities.isSpecial(newCard);
  if (specialCard) return CardUtilities.handleSpecialCard(newCard);

  // Check if user has a spell available (skipped if no obstacle yet)
  const relatedSpells =
    cL().obstacleType && GameState.getRelatedSpells(cL().obstacleType);
  if (relatedSpells) {
    // Ask user if they want to use the spell
    Announce.announceRelatedSpells(relatedSpells);
  }

  // Add the card to the stack of cards for this level
  cL().cards.unshift(newCard);

  // See if there's an obstacle, add an obstacle if not, try and beat it if present
  checkForObstacle(newCard);

  // Process everything to make sure player didn't die or win, then ask what to do next
  handleRoundEnd();
};

export const beginGame = () => {
  Announce.preamble();

  baseDeck.shuffle(3);
  GameState.moveToNextFloor();

  while (!GameState.gameOver) {
    doAGameRound();
  }
};

export const DungeonSolitaire = {
  beginGame,
  checkForObstacle,
  doAGameRound,
  handleRoundEnd,
};
