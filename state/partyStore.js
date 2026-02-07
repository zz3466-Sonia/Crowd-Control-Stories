// state/partyStore.js 存
const parties = Object.create(null); 
// 用 Object.create(null) 避免原型链上的奇怪 key（更干净）

function createParty(code, hostUser) {
  // 新建一个 party 的“数据结构”
  const party = {
    code,
    hostId: hostUser.userId,  // 记录 host
    players: Object.create(null), // userId -> playerInfo
    createdAt: Date.now(),

    // game 会在 start game 的时候塞进去（来自 gameState.js）
    game: null,
  };

  // host 自动加入 players
  party.players[hostUser.userId] = {
    userId: hostUser.userId,
    displayName: hostUser.displayName,
    joinedAt: Date.now(),
    isConnected: true,
    lastSeenAt: Date.now(),
  };

  parties[code] = party;
  return party;
}

function getParty(code) {
  return parties[code] || null;
}

function hasParty(code) {
  return Boolean(parties[code]);
}

function joinParty(code, user) {
  const party = getParty(code);
  if (!party) return { ok: false, error: "PARTY_NOT_FOUND" };

  // 把玩家加入/更新到 players
  party.players[user.userId] = {
    userId: user.userId,
    displayName: user.displayName,
    joinedAt: party.players[user.userId]?.joinedAt ?? Date.now(),
    isConnected: true,
    lastSeenAt: Date.now(),
  };

  return { ok: true, party };
}

function leaveParty(code, userId) {
  const party = getParty(code);
  if (!party) return { ok: false, error: "PARTY_NOT_FOUND" };

  delete party.players[userId];

  // 如果 host 走了：重新选 host（最简单：选第一个玩家）
  if (party.hostId === userId) {
    const remainingIds = Object.keys(party.players);
    party.hostId = remainingIds[0] || null;
  }

  // 如果没人了：删除 party（避免内存泄露）
  if (Object.keys(party.players).length === 0) {
    delete parties[code];
    return { ok: true, party: null, deleted: true };
  }

  return { ok: true, party, deleted: false };
}

module.exports = {
  parties,
  createParty,
  getParty,
  hasParty,
  joinParty,
  leaveParty,
};
