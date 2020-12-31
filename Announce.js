import promptMaker from "prompt-sync";
import { DungeonSolitaire } from "./DungeonSolitaireGame";
import { GameState } from "./GameState";
import { cL } from "./LevelState.js";
import { getCardType } from "./CardUtilities";
const prompt = promptMaker({ sigint: true });
const log = console.log;

//TODO: askForNextMove - WIP
// Ask user if they want to draw another card (if *allowed*), continue going down (if allowed), continue/start going up, or use a spell (Jack of Hearts or Spell of Light).
function askForNextMove() {
  const canDrawCard = cL().obstacleCleared !== true;
  log("You have the following options: ");
  if (canDrawCard) log("You may (d)raw another card for this level,");
  if (!GameState.travelingUp) {
    log("You may continue going dow(n),");
    log("You may start going (u)p,");
  } else {
    log("You may continue going (u)p,");
  }
  log("You may use a (s)pell, if you have one you can use.");
  const choice = prompt("What do you decide to do?");
  // TODO: Handle next move choice (maybe return to DSG to handle?)
  return choice;
}

/** @param {Standard52Card[]} relatedSpells */
function announceRelatedSpells(relatedSpells) {
  log("You have in your spellbook the following:\n");
  relatedSpells.forEach((card, i) => log(`${i + 1}) ${card.name}\n`));
  const choice = prompt(
    "Type the number of the spell you would like to use, or type 'c' to continue."
  );

  if (choice !== "c" && choice !== null) {
    GameState.useSpell(relatedSpells[Number(choice)]);
  }
}

function cannotUseJackOfHeartsHere() {
  log(
    "You try to use the Jack of Hearts, but nothing happens. Perhaps if you tried in the midst of combat, or when facing a trap?"
  );
}

function died() {
  log(
    "Little did you know when you started searching this level, that it would prove to be your last. You have encountered one obstacle too many, and paid the ultimate price. You are dead, and you will be mourned."
  );
  const score = GameState.currentScore;
  log(`Your final score is ${score} points.`);
  log("GAME OVER");
}

function lostInTheDark() {
  log(
    "From out of nowhere, the slightest burst of wind comes along and blows out your last torch. You have only a second to examine your surroundings before you are plunged into total darkness. Within minutes, you are hopelessly lost, and consign yourself to your fate: a living ghost, haunting the halls and hallows of this tomb, which will be your final resting place as well."
  );
  log("GAME OVER");
}

/**
 * @param {Standard52Card} card
 */
function newCard(card) {
  const cardType = getCardType(card);
  log("You drew the ", card.name);
  log(`It's a ${cardType}!`);
}

function preamble() {
  log(
    "Greetings explorer! You are about to embark upon your most dangerous adventure yet: The Tomb of the Four Kings. Said to contain enough riches for five lifetimes, rumors also state it is guarded by impenetrable sealed doors, nefarious traps, and the monsters that make the tomb their home."
  );

  const name = prompt(
    "But first, by what name do you wish history to remember you? "
  );
  GameState.playerName = name;

  log(`Well met, ${GameState.playerName}!`);

  prompt("Are you ready to begin?");
}

function won() {
  log(
    "Up ahead you see something you weren't sure you'd ever see again: daylight! You've made it back to the entrance to the tomb! Congratulations!"
  );
  log(
    `This time, you managed to collect ${
      GameState.currentScore * 100
    } gold pieces worth of treasure! (Out of a possible 10,000gp)`
  );
  const answer = prompt("Do you wish to try again? Y/N");

  if (answer === "Y" || answer === "y") {
    DungeonSolitaire.beginGame();
  }
}

/**
 * @typedef Announcer
 * @property {(relatedSpells: Standard52Card[]) => void} announceRelatedSpells
 * @property {() => string} askForNextMove
 * @property {VoidFunc} cannotUseJackOfHeartsHere
 * @property {VoidFunc} died
 * @property {VoidFunc} lostInTheDark
 * @property {(card: Standard52Card) => void} newCard
 * @property {VoidFunc} preamble
 * @property {VoidFunc} won
 */

/** @type {Announcer} */
export const Announce = {
  announceRelatedSpells,
  askForNextMove,
  cannotUseJackOfHeartsHere,
  died,
  lostInTheDark,
  newCard,
  preamble,
  won,
};
