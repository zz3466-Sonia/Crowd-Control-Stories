// Voting engine for managing votes and tallying results

class VotingEngine {
  constructor(partyStore) {
    this.partyStore = partyStore;
  }

  // Submit a vote
  vote(partyCode, playerId, choice) {
    const party = this.partyStore.getParty(partyCode);

    if (!party.gameState.started) {
      throw new Error('Game not started');
    }

    const normalizedChoice = choice.toUpperCase();
    if (!['A', 'B', 'C'].includes(normalizedChoice)) {
      throw new Error('Choice must be A, B, or C');
    }

    const playerInParty = party.players.find(p => p.id === playerId);
    if (!playerInParty) {
      throw new Error('Player not found in party');
    }

    // Remove previous vote if exists
    const previousChoice = party.gameState.votes[playerId];
    if (previousChoice) {
      party.gameState.voteCounts[previousChoice] = Math.max(
        0,
        party.gameState.voteCounts[previousChoice] - 1
      );
    }

    // Record new vote
    party.gameState.votes[playerId] = normalizedChoice;
    party.gameState.voteCounts[normalizedChoice] += 1;

    return party.gameState.voteCounts;
  }

  // Get current vote counts
  getVoteCounts(partyCode) {
    const party = this.partyStore.getParty(partyCode);
    return party.gameState.voteCounts;
  }

  // Tally votes and determine winner
  tallyVotes(partyCode) {
    const party = this.partyStore.getParty(partyCode);
    const counts = party.gameState.voteCounts;

    // Find choice with most votes
    const winner = ['A', 'B', 'C'].reduce((best, key) => {
      if (!best) return key;
      return counts[key] > counts[best] ? key : best;
    }, null);

    return {
      winner,
      counts,
      totalVotes: counts.A + counts.B + counts.C
    };
  }

  // Reset votes (called after moving to next round)
  resetVotes(partyCode) {
    const party = this.partyStore.getParty(partyCode);
    party.gameState.votes = {};
    party.gameState.voteCounts = { A: 0, B: 0, C: 0 };
  }

  // Get all votes (for debugging)
  getAllVotes(partyCode) {
    const party = this.partyStore.getParty(partyCode);
    return party.gameState.votes;
  }
}

module.exports = VotingEngine;
