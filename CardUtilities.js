import { cL } from "./LevelState";
import { GameState } from "./GameState";
import { baseDeck } from ".";
import { Announce } from "./Announce";

/** @param {Standard52Card} card */
export const isSpecial = (card) =>
  ["Jack", "Queen", "Ace", "Joker"].includes(card.nameRank);

const applyQueen = () => {
  console.log(
    "One of the four goddesses has deemed to shine down on you. Whatever obstacle you encounter this level will automatically be defeated."
  );
  cL().goddessFound = true;
};

const applyAce = () => {
  console.log(
    "A strong wind rushes through the tunnel you stand in, blowing out one of your torches."
  );
  GameState.torchesBlownOut++;
  console.log(`You have ${4 - GameState.torchesBlownOut} torches left.`);
};

/** @param {Standard52Card} card */
export const applyJack = (card) => {
  // TODO: applyJack - WIP
  const { suit } = card;
  switch (suit) {
    case "Hearts":
      // Prevents 1 round's damage
      if (cL().obstacleType === "Monster") {
        // TODO: Figure out when applyJack is being called so we can figure out how to apply the 'healing'.
      }
      Announce.cannotUseJackOfHeartsHere();
      break;
    case "Spades":
      // Defeats a monster
      cL().monsterHP = 0;
      break;
    default:
      cL().obstacleCleared = true;
  }
  // Discard the card for rest of the game
  baseDeck.addToDiscardPile([card]);
};

/** @param {Standard52Card} card */
export const applyJoker = (card) => {
  GameState.torchesBlownOut--;
  const firstAceIndex = cL().cards.findIndex(
    (/** @type {Standard52Card} */ thisCard) => thisCard.nameRank === "Ace"
  );

  /** @type {Standard52Card[]} */
  const firstAce = cL().cards.splice(firstAceIndex, 1);
  baseDeck.addToBottomOfDrawPile(firstAce);

  baseDeck.addToDiscardPile([card]);
};

const SpecialCardHandlers = {
  Jack: GameState.addToSpellBook,
  Queen: applyQueen,
  Ace: applyAce,
  Joker: GameState.addToSpellBook,
};

/**
 * @param {Standard52Card} card
 * @returns {string}
 */
export const getCardType = (card) => {
  const obstacleSuitTypesMap = {
    Clubs: "Sealed Door",
    Hearts: "Fluke",
    Spades: "Monster",
    Diamonds: "Trap",
  };
  const cardRankTypes = {
    Jack: "Spell of ",
    Queen: "Goddess",
    King: "King's Tomb",
  };
  const jackSuitTypes = {
    Clubs: "Lockpicking",
    Hearts: "Healing",
    Spades: "Destruction",
    Diamonds: "Disarming",
  };

  if (isSpecial(card)) {
    const baseType = cardRankTypes[card.nameRank];
    return card.nameRank === "Jack"
      ? `${baseType}${jackSuitTypes[card.suit]}`
      : baseType;
  }

  return obstacleSuitTypesMap[card.suit];
};

/** @param {Standard52Card} card */
export const handleSpecialCard = (card) => {
  SpecialCardHandlers[card.nameRank](card);
};

/** @param {Standard52Card[]} cards */
export const pullOutDiamonds = (cards) => {
  const diamondCards = [];

  for (let i = cards.length; i--; ) {
    const card = cards[i];
    if (card.suit === "Diamonds") {
      cards.splice(i, 1);
      diamondCards.push(card);
    }
  }

  return diamondCards;
};
