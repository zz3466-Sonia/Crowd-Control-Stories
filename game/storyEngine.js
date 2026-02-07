// game/storyEngine.js

const STORY = {
  intro: {
    nodeId: "intro",
    text: "You wake up in a strange room. What do you do?",
    choices: [
      { id: "open_door", text: "Open the door" },
      { id: "look_around", text: "Look around" },
    ],
    next: {
      open_door: "hallway",
      look_around: "desk",
    },
  },

  hallway: {
    nodeId: "hallway",
    text: "A hallway stretches into darkness. You hear a sound.",
    choices: [
      { id: "follow_sound", text: "Follow the sound" },
      { id: "go_back", text: "Go back" },
    ],
    next: {
      follow_sound: "end_good",
      go_back: "intro",
    },
  },

  desk: {
    nodeId: "desk",
    text: "On the desk, there's a note: 'Don't trust the light.'",
    choices: [
      { id: "take_note", text: "Take the note" },
      { id: "ignore_note", text: "Ignore it" },
    ],
    next: {
      take_note: "hallway",
      ignore_note: "end_bad",
    },
  },

  end_good: {
    nodeId: "end_good",
    text: "You find the exit. You win.",
    choices: [],
    isEnd: true,
  },

  end_bad: {
    nodeId: "end_bad",
    text: "The light was a trap. Game over.",
    choices: [],
    isEnd: true,
  },
};

function getInitialStory() {
  return pickNode("intro");
}

function pickNode(nodeId) {
  const node = STORY[nodeId];
  if (!node) throw new Error(`Unknown story node: ${nodeId}`);

  // 返回一个干净对象，避免外部修改 STORY 常量
  return {
    nodeId: node.nodeId,
    text: node.text,
    choices: node.choices.map(c => ({ id: c.id, text: c.text })),
    isEnd: Boolean(node.isEnd),
  };
}

function advanceStory(currentNodeId, winningChoiceId) {
  const current = STORY[currentNodeId];
  if (!current) throw new Error(`Unknown story node: ${currentNodeId}`);

  const nextNodeId = current.next?.[winningChoiceId];

  // 如果没有 next：就停住或结束（看你规则）
  if (!nextNodeId) {
    return {
      nodeId: current.nodeId,
      text: current.text,
      choices: current.choices.map(c => ({ id: c.id, text: c.text })),
      isEnd: false,
    };
  }

  return pickNode(nextNodeId);
}

module.exports = {
  getInitialStory,
  advanceStory,
};
