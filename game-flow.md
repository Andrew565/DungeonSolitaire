1. Initializers
   1. Create a baseDeck
   1. GameState
   1. CurrentLevel
   1. Announcer
1. Call beginGame()
   1. Announce.preamble()
   1. Shuffle baseDeck 3 times
   1. \*\*\*Call GameState.moveToNewFloor()
      1. Determine direction of travel
      1. Get what the next level will be
      1. Create new level with new level number, add to LevelStates
   1. Start the game loop
      1. Draw a new card
      1. Check if the card isSpecial()
         1. If isSpecial, return the run of the handleSpecialCard() function
      1. Check if there are any spells related to the current obstacle
         1. If getRelatedSpells(), askForNextMove()
      1. Add the new card to the stack of cards for this level
      1. checkForObstacle()
         1. Set cL().obstacleAttempted to true
         1. If there is no current obstacle,
            1. set the new card as the obstacle and return
         1. \*\*\*Check if obstacle's rank beats card's rank
            1. If so, check if obstacle is a monster
               1. If so, reduce monster's HP appropriately
               1. Then, check if monster defeated
                  1. If yes, set obstacleCleared = true
                  1. If not, reduce player HP
            1. If not a monster:
               1. \*\*\*Pull out any diamonds from the current level
               1. \*\*\*Ensure at least one card remains to "mark" the level
               1. If obstacle is a trap, reduce player HP
         1. If card's rank is higher, set obstacleCleared = true
         1. _NOTE: At this point, the 'check for' function is over, but the round has not 'ended', this is handled currently by the handleRoundEnd() function. Some of the bits above with \*\*\* would probably make more sense if moved to the handleRoundEnd func._
      1. Determine if there is a `nextAction` by calling `handleRoundEnd()`
         1. Check if at least one torch remains
            1. If no, return `Announce.lostInTheDark`
         1. Check if out of health
            1. If yes, return `Announce.died`
         1. Check if obstacleCleared
            1. If yes, assignTreasures()
         1. Check if player won the game
            1. If yes, return `Announce.won`
         1. Reset hasObstacle, if needed
         1. If nothing else has returned, return `Announce.askForNextMove`
      1. If there is a nextAction, call it
