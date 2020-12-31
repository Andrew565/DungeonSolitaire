import { GameState } from "./GameState";
import { cL } from "./LevelState";
import * as CardUtilities from "./CardUtilities";
import { Announce } from "./Announce";
import { baseDeck } from ".";

/**
 * @param {Standard52Card} card
 */
export const checkForObstacle = (card) => {
  const currentLevel = cL();
  currentLevel.obstacleAttempted = true;

  // If no obstacle, make this card the obstacle
  if (!currentLevel.obstacle) {
    currentLevel.obstacle = card;
    return;
  }

  // Check if card beats the obstacle
  if (currentLevel.obstacle.numberRank > card.numberRank) {
    // Card doesn't beat obstacle, check if monster (keep trying) or lose the level
    if (currentLevel.obstacleType === "Monster") {
      // Reduce monsterHP by card's value
      currentLevel.monsterHP -= card.numberRank;

      // Check if we cleared the level
      if (currentLevel.monsterHP <= 0) {
        currentLevel.obstacleCleared = true;
      } else {
        /** Health has to be subtracted by numberRank + 2 due to rank[0] === 2 */
        GameState.health -= currentLevel.obstacle.numberRank + 2;
      }
    } else {
      // Take damage and lose treasure if Trap, just lose treasure if Door
      const diamondCards = CardUtilities.pullOutDiamonds(currentLevel.cards);

      // Make sure at least one card remains, even if it's a diamond
      if (currentLevel.cards.length < 1) {
        const lowestDiamond = currentLevel.cards.reduce((lowestCard, aCard) => {
          if (aCard.numberRank > lowestCard.numberRank) lowestCard = aCard;
          return lowestCard;
        }, diamondCards[0]);
        currentLevel.cards.push(lowestDiamond);
      }

      if (currentLevel.obstacleType === "Trap") {
        GameState.health -= currentLevel.obstacle.numberRank + 2;
      }
    }
  } else {
    // Card beats the obstacle, so we mark it cleared
    currentLevel.obstacleCleared = true;
  }
};

/** @returns {() => void} */
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

  // Ask user if they want to draw another card (if *allowed*), continue going down (if allowed), continue going up, or use a spell (Jack of Hearts or Spell of Light).
  return () => Announce.askForNextMove();
};

export const doAGameRound = () => {
  GameState.moveToNextFloor();
  const newCard = baseDeck.drawFromDrawPile(1)[0];
  Announce.newCard(newCard);

  const specialCard = CardUtilities.isSpecial(newCard);
  if (specialCard) return CardUtilities.handleSpecialCard(newCard);

  // Check if user has a spell available
  const relatedSpells =
    cL().obstacleType && GameState.getRelatedSpells(cL().obstacleType);
  if (relatedSpells) {
    // Ask user if they want to use the spell
    // TODO: Need to fix where exactly we're handling spell usage stuff (here, GameState, Announce?)
    // Much of the desired functionality can be found in Announcer#askForNextMove, which could probably move to a controller of some kind, perhaps?
    Announce.announceRelatedSpells(relatedSpells);
  }

  // Add the card to the stack of cards for this level
  cL().cards.unshift(newCard);

  // See if there's an obstacle, add an obstacle if not, try and beat it if present
  checkForObstacle(newCard);

  const nextAction = handleRoundEnd();
  if (nextAction) nextAction();
};

export const beginGame = () => {
  Announce.preamble();

  baseDeck.shuffle(3);

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
