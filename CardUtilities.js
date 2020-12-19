/** @typedef {import("@andrewcreated/deck-of-cards.js/dist/standard52CardsAndJokers").Standard52Card} Standard52Card */

import { cL } from "./LevelState";
import { GameState } from "./GameState";
import { baseDeck } from ".";

/** @param {Standard52Card} card */
export const isSpecial = (card) => ["Jack", "Queen", "Ace", "Joker"].includes(card.nameRank);

const applyQueen = () => {
  console.log(
    "One of the four goddesses has deemed to shine down on you. Whatever obstacle you encounter this level will automatically be defeated."
  );
  cL().goddessFound = true;
};

const applyAce = () => {
  console.log("A strong wind rushes through the tunnel you stand in, blowing out one of your torches.");
  GameState.torchesBlownOut++;
  console.log(`You have ${4 - GameState.torchesBlownOut} torches left.`);
};

/** @param {Standard52Card} card */
export const applyJack = (card) => {
  // TODO: applyJack - WIP
  const { suit } = card;
  switch (suit) {
    case "Hearts":
      // TODO: Prevents 1 round's damage
      break;
    case "Spades":
      // Defeats a monster
      cL().monsterHP = 0;
    default:
      cL().obstacleCleared = true;
  }
  // Discard the card for rest of the game
  baseDeck.addToDiscardPile([card]);
};

/** @param {Standard52Card} card */
export const applyJoker = (card) => {
  GameState.torchesBlownOut--;
  const firstAceIndex = cL().cards.findIndex((/** @type {Standard52Card} */ card) => card.nameRank === "Ace");

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
