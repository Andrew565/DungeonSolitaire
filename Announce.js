import promptMaker from "prompt-sync";
import { DungeonSolitaire } from "./DungeonSolitaireGame";
import { cL } from "./LevelState.js";
const prompt = promptMaker({ sigint: true });
const { GameState } = require("./GameState");

async function askForNextMove() {
  //TODO: askForNextMove - WIP
  // Ask user if they want to draw another card (if *allowed*), continue going down (if allowed), continue going up, or use a spell (Jack of Hearts or Spell of Light).
  const obstacleType = cL().obstacleType;
  if (obstacleType !== "None") {
    const usableSpells = GameState.getRelatedSpells(obstacleType);
    console.log("You have in your spellbook the following:\n");
    usableSpells.forEach((card, i) => console.log(`${i + 1}) ${card.name}\n`));
    const choice = prompt("Type the number of the spell you would like to use, or type 'c' to continue.");

    if (choice !== "c" && choice !== null) {
      await GameState.useSpell(usableSpells[Number(choice)]);
    }
  }

  // Stashed until needed: GameState.moveToNewFloor
}

function died() {
  console.log(
    "Little did you know when you started searching this level, that it would prove to be your last. You have encountered one obstacle too many, and paid the ultimate price. You are dead, and you will be mourned."
  );
  const score = GameState.currentScore;
  console.log(`Your final score is ${score} points.`);
  console.log("GAME OVER");
}

function lostInTheDark() {
  console.log(
    "From out of nowhere, the slightest burst of wind comes along and blows out your last torch. You have only a second to examine your surroundings before you are plunged into total darkness. Within minutes, you are hopelessly lost, and consign yourself to your fate: a living ghost, haunting the halls and hallows of this tomb, which will be your final resting place as well."
  );
  console.log("GAME OVER");
}

function preamble() {
  console.log(
    "Greetings explorer! You are about to embark upon your most dangerous adventure yet: The Tomb of the Four Kings. Said to contain enough riches for five lifetimes, rumors also state it is guarded by impenetrable sealed doors, nefarious traps, and the monsters that make the tomb their home."
  );

  const name = prompt("But first, by what name do you wish history to remember you? ");
  GameState.playerName = name;

  console.log(`Well met, ${GameState.playerName}!`);

  prompt("Are you ready to begin?");
}

function won() {
  console.log(
    "Up ahead you see something you weren't sure you'd ever see again: daylight! You've made it back to the entrance to the tomb! Congratulations!"
  );
  console.log(
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
 * @typedef {object} Announcer
 * @property {() => Promise<void>} askForNextMove
 * @property {() => void} died
 * @property {() => void} lostInTheDark
 * @property {() => void} preamble
 * @property {() => void} won
 */

/** @type {Announcer} */
export const Announce = {
  askForNextMove,
  died,
  lostInTheDark,
  preamble,
  won,
};
