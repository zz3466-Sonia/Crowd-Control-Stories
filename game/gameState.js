// game/gameState.js

function createInitialGameState() {
  return {
    phase: "LOBBY",  // LOBBY | STORY | VOTING | RESOLVING | ENDED
    round: 0,

    // 当前剧情（由 storyEngine 提供）
    story: null, // { nodeId, text, choices: [{id,text}] }

    // 投票状态（由 votingEngine 控制）
    voting: {
      isActive: false,
      ballotId: null,   // 每轮投票唯一 id
      startedAt: null,
      endsAt: null,
      votes: Object.create(null), // userId -> choiceId
    },

    // 并发/一致性（建议加上，后面很重要）
    version: 0,  // 每次 state 变动 +1
    updatedAt: Date.now(),
  };
}

function bumpVersion(game) {
  game.version += 1;
  game.updatedAt = Date.now();
}

module.exports = {
  createInitialGameState,
  bumpVersion,
};
