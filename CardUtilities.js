/** @typedef {import("@andrewcreated/deck-of-cards.js/dist/standard52CardsAndJokers").Standard52Card} Standard52Card */

import { cL } from "./LevelState";
import { GameState } from "./GameState";

/** @param {Standard52Card} card */
export const isSpecial = (card) => ["Jack", "Queen", "Ace", "Joker"].includes(card.nameRank);

const handleQueen = () => {
  console.log(
    "One of the four goddesses has deemed to shine down on you. Whatever obstacle you encounter this level will automatically be defeated."
  );
  cL.goddessFound = true;
};

const handleAce = () => {
  console.log("A strong wind rushes through the tunnel you stand in, blowing out one of your torches.");
  GameState.torchesBlownOut++;
  console.log(`You have ${4 - GameState.torchesBlownOut} torches left.`);
};

const SpecialCardHandlers = {
  Jack: GameState.addToSpellBook,
  Queen: handleQueen,
  Ace: handleAce,
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
};
