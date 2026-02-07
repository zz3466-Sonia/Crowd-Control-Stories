// Game state management

class GameState {
  constructor(partyStore) {
    this.partyStore = partyStore;
  }

  // Initialize game for a party
  startGame(partyCode, initialStory, initialChoices) {
    const party = this.partyStore.getParty(partyCode);
    
    party.gameState.started = true;
    party.gameState.currentRound = 1;
    party.gameState.currentStory = initialStory;
    party.gameState.currentChoices = initialChoices;
    party.gameState.votes = {};
    party.gameState.voteCounts = { A: 0, B: 0, C: 0 };
    party.gameState.lastWinner = null;

    return party.gameState;
  }

  // Update game state for next round
  nextRound(partyCode, winner, newStory, newChoices) {
    const party = this.partyStore.getParty(partyCode);
    
    if (!party.gameState.started) {
      throw new Error('Game not started');
    }

    party.gameState.lastWinner = winner;
    party.gameState.currentRound += 1;
    party.gameState.currentStory = newStory;
    party.gameState.currentChoices = newChoices;
    party.gameState.votes = {};
    party.gameState.voteCounts = { A: 0, B: 0, C: 0 };

    return party.gameState;
  }

  // Get current game state
  getGameState(partyCode) {
    const party = this.partyStore.getParty(partyCode);
    return party.gameState;
  }

  // Check if game has started
  isGameStarted(partyCode) {
    const party = this.partyStore.getParty(partyCode);
    return party.gameState.started;
  }

  // Get current round number
  getCurrentRound(partyCode) {
    const party = this.partyStore.getParty(partyCode);
    return party.gameState.currentRound;
  }
}

module.exports = GameState;
