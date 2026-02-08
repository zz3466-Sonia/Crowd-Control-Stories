// Party data storage and management
const crypto = require('crypto');

const DEFAULT_VISUAL_PROFILE = [
  'Main protagonist: a woman astronaut in her early 30s, short black hair, calm eyes, subtle scar on left cheek.',
  'Signature outfit: blue-white spacesuit with a triangular chest patch and amber-tinted visor.',
  'AI: a floating cyan hologram orb with faint circuit patterns.',
  'Alien: tall, slender, bioluminescent skin with violet glow and elongated fingers.',
  'Visual style: cinematic, soft lighting, consistent character design across scenes.'
].join(' ');

class PartyStore {
  constructor() {
    this.parties = {};
    this.MAX_PLAYERS = 8;
  }

  // Generate random 6-character party code
  generatePartyCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    if (this.parties[code]) {
      return this.generatePartyCode();
    }
    return code;
  }

  // Create a new party
  createParty(playerName) {
    const partyCode = this.generatePartyCode();
    const playerId = crypto.randomUUID ? crypto.randomUUID() : Date.now().toString();
    
    this.parties[partyCode] = {
      players: [{
        id: playerId,
        name: playerName,
        isHost: true,
        joinedAt: new Date().toISOString()
      }],
      createdAt: new Date().toISOString(),
      storyTheme: 'scifi',  // Default theme
      gameState: {
        started: false,
        currentRound: 0,
        currentStory: '',
        currentChoices: [],
        votes: {},
        voteCounts: { A: 0, B: 0, C: 0 },
        lastWinner: null,
        visualProfile: DEFAULT_VISUAL_PROFILE
      }
    };

    return { partyCode, playerId, playerName, isHost: true };
  }

  // Join existing party
  joinParty(partyCode, playerName) {
    const party = this.parties[partyCode.toUpperCase()];
    
    if (!party) {
      throw new Error('Party not found');
    }

    if (party.gameState.started) {
      throw new Error('Game already started');
    }

    if (party.players.length >= this.MAX_PLAYERS) {
      throw new Error(`Party is full (max ${this.MAX_PLAYERS} players)`);
    }

    const existingPlayer = party.players.find(p => p.name === playerName);
    if (existingPlayer) {
      throw new Error('Player name already taken in this party');
    }

    const playerId = crypto.randomUUID ? crypto.randomUUID() : Date.now().toString();
    
    party.players.push({
      id: playerId,
      name: playerName,
      isHost: false,
      joinedAt: new Date().toISOString()
    });

    return { partyCode: partyCode.toUpperCase(), playerId, playerName, isHost: false };
  }

  // Get party info
  getParty(partyCode) {
    const party = this.parties[partyCode.toUpperCase()];
    if (!party) {
      throw new Error('Party not found');
    }
    return party;
  }

  // Leave party
  leaveParty(partyCode, playerId) {
    const party = this.parties[partyCode.toUpperCase()];
    
    if (!party) {
      throw new Error('Party not found');
    }

    const playerIndex = party.players.findIndex(p => p.id === playerId);
    if (playerIndex === -1) {
      throw new Error('Player not found in party');
    }

    const player = party.players[playerIndex];
    party.players.splice(playerIndex, 1);

    // If party is empty, delete it
    if (party.players.length === 0) {
      delete this.parties[partyCode.toUpperCase()];
      return { deleted: true, playerName: player.name };
    }
    
    // If host left, assign new host
    if (player.isHost && party.players.length > 0) {
      party.players[0].isHost = true;
    }

    return { deleted: false, playerName: player.name };
  }

  // Get all active parties (for debugging)
  getAllParties() {
    return Object.keys(this.parties).map(code => ({
      code,
      playerCount: this.parties[code].players.length,
      players: this.parties[code].players.map(p => p.name)
    }));
  }

  // Get party count
  getPartyCount() {
    return Object.keys(this.parties).length;
  }
}

module.exports = new PartyStore();
