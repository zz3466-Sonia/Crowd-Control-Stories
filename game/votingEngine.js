// game/votingEngine.js
const { bumpVersion } = require("./gameState");

function newBallotId() {
  // 足够用的轻量唯一 id（你也可以用 uuid）
  return `b_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function startVoting(game, durationMs = 15000) {
  game.phase = "VOTING";
  game.voting.isActive = true;
  game.voting.ballotId = newBallotId();
  game.voting.startedAt = Date.now();
  game.voting.endsAt = Date.now() + durationMs;
  game.voting.votes = Object.create(null);
  bumpVersion(game);
}

function castVote(game, userId, choiceId) {
  if (game.phase !== "VOTING") return { ok: false, error: "NOT_VOTING" };
  if (!game.voting.isActive) return { ok: false, error: "VOTING_INACTIVE" };
  if (Date.now() > game.voting.endsAt) return { ok: false, error: "VOTING_ENDED" };

  // 覆盖式写入：一人一票，可改票
  game.voting.votes[userId] = choiceId;
  bumpVersion(game);
  return { ok: true };
}

function tallyVotes(game) {
  const tally = Object.create(null); // choiceId -> count
  for (const choiceId of Object.values(game.voting.votes)) {
    tally[choiceId] = (tally[choiceId] || 0) + 1;
  }
  return tally;
}

function resolveVoting(game, choices, tieBreak = "RANDOM") {
  // choices: 当前轮允许的 choiceId 列表（防止客户端乱传）
  const allowed = new Set(choices.map(c => c.id));

  const tallyRaw = tallyVotes(game);
  const tally = Object.create(null);

  // 只统计合法选项
  for (const [choiceId, count] of Object.entries(tallyRaw)) {
    if (allowed.has(choiceId)) tally[choiceId] = count;
  }

  // 找最高票
  let max = -1;
  let winners = [];
  for (const [choiceId, count] of Object.entries(tally)) {
    if (count > max) {
      max = count;
      winners = [choiceId];
    } else if (count === max) {
      winners.push(choiceId);
    }
  }

  // 没人投票：默认随机一个（或保持不变）
  if (winners.length === 0) {
    const fallback = choices[Math.floor(Math.random() * choices.length)]?.id || null;
    endVoting(game);
    return { winningChoiceId: fallback, tally };
  }

  // 平票处理
  let winningChoiceId = winners[0];
  if (winners.length > 1 && tieBreak === "RANDOM") {
    winningChoiceId = winners[Math.floor(Math.random() * winners.length)];
  }

  endVoting(game);
  return { winningChoiceId, tally };
}

function endVoting(game) {
  game.voting.isActive = false;
  game.phase = "RESOLVING";
  bumpVersion(game);
}

module.exports = {
  startVoting,
  castVote,
  resolveVoting,
  tallyVotes,
};
