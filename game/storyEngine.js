// Story generation engine using Dedalus AI API or fallback

const Dedalus = require('dedalus-labs').default;

// Configuration
const DEDALUS_API_KEY = process.env.DEDALUS_API_KEY;
const DEDALUS_MODEL = process.env.DEDALUS_MODEL || 'anthropic/claude-sonnet-4-20250514';
const DEDALUS_MODEL_FALLBACKS = [
  DEDALUS_MODEL,
  'anthropic/claude-opus-4-6',
  'openai/gpt-4o',
  'google/gemini-1.5-pro',
  'xai/grok-2-latest'
].filter((value, index, self) => value && self.indexOf(value) === index);

// Fallback story rounds by theme
const STORY_ROUNDS = {
  scifi: [
    {
      story: 'The astronaut, the AI, and the alien meet in a silent space station. The AI warns of an unknown signal.',
      choices: ['A) Trust the AI', 'B) Question the AI', 'C) Contact the alien']
    },
    {
      story: 'The signal grows louder. The alien reveals a hidden hatch. The astronaut hesitates.',
      choices: ['A) Open the hatch', 'B) Ask for proof', 'C) Walk away']
    },
    {
      story: 'A strange light spills out. The AI begins to glitch. The alien offers a deal.',
      choices: ['A) Accept the deal', 'B) Refuse and run', 'C) Shut down the AI']
    }
  ],
  romance: [
    {
      story: 'Two Columbia undergrads lock eyes across the library table at Butler. An awkward moment stretches between them. Neither looks away.',
      choices: ['A) Smile and open up', 'B) Pretend to study', 'C) Friend texts—leave']
    },
    {
      story: 'Coffee after class. They talk about everything except what matters. The rain starts outside. They stay inside.',
      choices: ['A) Share headphones walking', 'B) Say goodbye quickly', 'C) Phone rings—family call']
    },
    {
      story: 'Late night on College Walk. The city glows around them. A moment of silence that says everything.',
      choices: ['A) Take their hand', 'B) Keep hands in pockets', 'C) Roommate catches up to them']
    }
  ],
  mystery: [
    {
      story: 'A detective arrives at a quiet coastal town. A mysterious package arrives at the harbor. No one claims it.',
      choices: ['A) Open the package', 'B) Question the dock workers', 'C) Wait for more clues']
    },
    {
      story: 'The suspect suddenly appears at the café. They seem nervous. The witness from earlier walks in.',
      choices: ['A) Confront them directly', 'B) Follow them discreetly', 'C) Interview the witness']
    },
    {
      story: 'A hidden letter is discovered in the old library. It changes everything. The plot thickens.',
      choices: ['A) Demand answers', 'B) Do more investigation', 'C) Contact the authorities']
    }
  ],
  adventure: [
    {
      story: 'The explorer discovers an ancient temple deep in the jungle. Strange markings glow on the walls. Your companions look nervous.',
      choices: ['A) Enter the temple', 'B) Set up camp outside', 'C) Search the perimeter first']
    },
    {
      story: 'A treasure chest appears before you. But the ground beneath is trembling. The guide hesitates.',
      choices: ['A) Grab the treasure', 'B) Run for higher ground', 'C) Help your companion']
    },
    {
      story: 'You stand at a crossroads. One path glows with ancient light. The other is shrouded in darkness.',
      choices: ['A) Choose the light', 'B) Choose the darkness', 'C) Ask for the guide\'s wisdom']
    }
  ]
};

class StoryEngine {
  constructor() {
    this.initializeClient();
  }

  initializeClient() {
    const apiKey = process.env.DEDALUS_API_KEY;
    if (apiKey) {
      this.hasApiKey = true;
      this.client = new Dedalus({ apiKey });
      console.log('🎨 Story engine: Dedalus AI API');
    } else {
      this.hasApiKey = false;
      this.client = null;
      console.log('⚠️  Story engine: Using fallback stories (no API key)');
    }
  }

  buildFallbackBranch(theme, previousChoice, roundIndex) {
    const byTheme = {
      scifi: {
        A: ['The astronaut trusts the AI and follows its warning deeper into the station.', 'The AI takes control and guides them toward the signal source.'],
        B: ['The astronaut questions the AI, forcing it to reveal hidden logs.', 'The AI hesitates, and the alien grows more uneasy.'],
        C: ['The astronaut addresses the alien, who hints at a breach nearby.', 'The alien steps forward, revealing a sealed hatch.']
      },
      romance: {
        A: ['They open up a little, and the air feels warmer between them.', 'A small confession slips out, changing the mood.'],
        B: ['They keep it light, but the distance is noticeable.', 'A polite silence returns as they hold back.'],
        C: ['An interruption breaks the moment, leaving things unsaid.', 'The campus noise cuts in, and the chance slips by.']
      },
      mystery: {
        A: ['They dig deeper and uncover a clue tied to the suspect.', 'A hidden detail links the case to the harbor.'],
        B: ['They follow intuition and spot a pattern in the witness\' story.', 'A hunch points to a familiar face nearby.'],
        C: ['A secret surfaces, casting doubt on earlier testimony.', 'A locked drawer hints at a quiet cover‑up.']
      },
      adventure: {
        A: ['They take the risky path, and the ground trembles beneath them.', 'A daring move reveals a new passage.'],
        B: ['They play it safe, but danger circles closer.', 'Caution buys time, though the threat grows.'],
        C: ['They trust instincts and find a hidden route.', 'A bold hunch leads to an unexpected ally.']
      }
    };

    const options = byTheme[theme]?.[previousChoice] || [];
    if (!options.length) return '';
    return options[roundIndex % options.length];
  }

  buildFallbackContinuation(theme, previousChoice) {
    const flavor = {
      scifi: 'The signal shifts again, hinting at a deeper trap.',
      romance: 'A small pause lingers between them as the moment stretches.',
      mystery: 'A fresh clue surfaces, complicating the case.',
      adventure: 'The path shifts and a new hazard reveals itself.'
    };

    const choiceLine = previousChoice
      ? `They follow choice ${previousChoice}, and the tension rises.`
      : 'A new turn unfolds without warning.';

    return `${choiceLine} ${flavor[theme] || flavor.scifi}`;
  }

  // Get fallback story round for specific theme
  getFallbackRound(roundIndex, theme = 'scifi', previousChoice = null) {
    const themeStories = STORY_ROUNDS[theme] || STORY_ROUNDS.scifi;
    const fallback = themeStories[Math.min(roundIndex, themeStories.length - 1)];
    const needsContinuation = roundIndex >= themeStories.length;
    const branch = previousChoice ? this.buildFallbackBranch(theme, previousChoice, roundIndex) : '';
    return {
      story: needsContinuation
        ? `${fallback.story} ${this.buildFallbackContinuation(theme, previousChoice)} ${branch}`.trim()
        : `${fallback.story} ${branch}`.trim(),
      choices: fallback.choices
    };
  }

  // Build prompt based on story theme
  buildPrompt(roundIndex, previousChoice, theme = 'scifi', previousStory = '') {
    const prompts = {
      scifi: this.buildSciFiPrompt(roundIndex, previousChoice, previousStory),
      romance: this.buildRomancePrompt(roundIndex, previousChoice, previousStory),
      mystery: this.buildMysteryPrompt(roundIndex, previousChoice, previousStory),
      adventure: this.buildAdventurePrompt(roundIndex, previousChoice, previousStory)
    };
    return prompts[theme] || prompts.scifi;
  }

  buildSciFiPrompt(roundIndex, previousChoice, previousStory) {
    const continuity = previousStory
      ? `Previous story: "${previousStory}" Continue directly from it without resetting.`
      : 'This is round 1. Begin the story.';
    const choiceLine = previousChoice ? `The audience chose "${previousChoice}" in round ${roundIndex}. Continue from that choice.` : '';
    const context = `${continuity} ${choiceLine}`.trim();
    return `Write a simple sci-fi story with 3 characters: an astronaut, an AI, and an alien on a space station. ${context} 
    REQUIREMENTS: 
    - EXACTLY 40-50 words (no more than 50)
    - Use simple words a child could understand
    - Short sentences only (max 10 words per sentence)
    - No fancy descriptions
    - Return ONLY this JSON:
    {"story": "[YOUR STORY]", "choices": ["A) [simple action]", "B) [simple action]", "C) [simple action]"]}
    Example: "The signal beeps. The astronaut looks worried. The AI says something is wrong. The alien points at a door."`;
  }

  buildRomancePrompt(roundIndex, previousChoice, previousStory) {
    const continuity = previousStory
      ? `Previous story: "${previousStory}" Continue directly from it without resetting.`
      : 'Round 1. Begin with a simple Columbia moment.';
    const choiceLine = previousChoice ? `The audience chose "${previousChoice}" in round ${roundIndex}. Continue from that choice.` : '';
    const context = `${continuity} ${choiceLine}`.trim();
    return `Write a simple romance story about two college students at Columbia. ${context}
    REQUIREMENTS:
    - EXACTLY 40-50 words (no more than 50)
    - Use simple words a child could understand
    - Short sentences only (max 10 words per sentence)
    - No fancy descriptions
    - Return ONLY this JSON:
    {"story": "[YOUR STORY]", "choices": ["A) [simple choice]", "B) [simple choice]", "C) [simple choice]"]}

    Example: "Maya studies at the library. Ethan sits next to her. They smile. Their hands almost touch."`;
  }

  buildMysteryPrompt(roundIndex, previousChoice, previousStory) {
    const continuity = previousStory
      ? `Previous story: "${previousStory}" Continue directly from it without resetting.`
      : 'Round 1. Begin with something mysterious.';
    const choiceLine = previousChoice ? `The audience chose "${previousChoice}" in round ${roundIndex}. Continue the mystery.` : '';
    const context = `${continuity} ${choiceLine}`.trim();
    return `Write a simple mystery story with a detective, a suspect, and a witness. ${context}
    REQUIREMENTS:
    - EXACTLY 40-50 words (no more than 50)
    - Use simple words a child could understand
    - Short sentences only (max 10 words per sentence)
    - No fancy descriptions
    - Return ONLY this JSON:
    {"story": "[YOUR STORY]", "choices": ["A) [simple action]", "B) [simple action]", "C) [simple action]"]}

    Example: "A box appears on the table. Nobody knows who put it there. The detective looks inside. There is a note."`;
  }

  buildAdventurePrompt(roundIndex, previousChoice, previousStory) {
    const continuity = previousStory
      ? `Previous story: "${previousStory}" Continue directly from it without resetting.`
      : 'Round 1. Begin with something exciting.';
    const choiceLine = previousChoice ? `The audience chose "${previousChoice}" in round ${roundIndex}. Continue the adventure.` : '';
    const context = `${continuity} ${choiceLine}`.trim();
    return `Write a simple adventure story with an explorer, a companion, and a guide. ${context}
    REQUIREMENTS:
    - EXACTLY 40-50 words (no more than 50)
    - Use simple words a child could understand
    - Short sentences only (max 10 words per sentence)
    - No fancy descriptions
    - Return ONLY this JSON:
    {"story": "[YOUR STORY]", "choices": ["A) [simple choice]", "B) [simple choice]", "C) [simple choice]"]}

    Example: "The explorer finds a cave. It is dark inside. The guide says go in. The companion is scared."`;
  }

  // Parse JSON from AI response (handles code blocks)
  safeParseJSON(text) {
    // Remove markdown code block markers if present
    let cleanText = text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
    
    const match = cleanText.match(/\{[\s\S]*\}/);
    if (!match) return null;
    try {
      return JSON.parse(match[0]);
    } catch {
      return null;
    }
  }

  // Count words in text
  countWords(text) {
    return text.trim().split(/\s+/).length;
  }

  // Enforce word limit without awkward cut-offs
  enforcWordLimit(story, maxWords = 50) {
    const words = story.trim().split(/\s+/);
    if (words.length <= maxWords) {
      return story;
    }

    const trimmed = words.slice(0, maxWords).join(' ');
    const lastStop = Math.max(
      trimmed.lastIndexOf('.'),
      trimmed.lastIndexOf('!'),
      trimmed.lastIndexOf('?')
    );

    if (lastStop > 20) {
      return trimmed.slice(0, lastStop + 1);
    }

    return trimmed.replace(/[.,!?]?$/, '.')
  }

  // Generate story content (with API or fallback)
  async generateRound(roundIndex, previousChoice, theme = 'scifi', previousStory = '') {
    if (!this.hasApiKey || !this.client) {
      // Silently use fallback (no warning)
      return this.getFallbackRound(roundIndex, theme, previousChoice);
    }

    try {
      const prompt = this.buildPrompt(roundIndex, previousChoice, theme, previousStory);
      
      let lastError = null;
      let parsed = null;

      for (const model of DEDALUS_MODEL_FALLBACKS) {
        try {
          console.log(`🤖 Trying model: ${model}`);
          const completion = await this.client.chat.completions.create({
            model: model,
            messages: [
              { role: 'system', content: 'You are a creative storyteller. Always respond with valid JSON only.' },
              { role: 'user', content: prompt }
            ],
            temperature: 0.7,
            max_tokens: 1024
          });

          const text = completion.choices[0]?.message?.content;
          if (!text) continue;
          
          parsed = this.safeParseJSON(text);
          if (parsed && parsed.story && Array.isArray(parsed.choices)) {
            // Enforce 50 word limit
            const wordCount = this.countWords(parsed.story);
            if (wordCount > 50) {
              parsed.story = this.enforcWordLimit(parsed.story, 50);
              console.log(`✅ Generated ${theme} story via ${model} (truncated to 50 words)`);
            } else {
              console.log(`✅ Generated ${theme} story via ${model} (${wordCount} words)`);
            }
            break;
          }
        } catch (err) {
          lastError = err;
          console.log(`⚠️  Model ${model} failed: ${err.message}`);
          continue;
        }
      }

      if (!parsed || !parsed.story || !Array.isArray(parsed.choices)) {
        console.log(`⚠️  All models failed or returned invalid format for ${theme}, using fallback`);
        return this.getFallbackRound(roundIndex, theme, previousChoice);
      }

      const cleanedChoices = parsed.choices
        .filter(c => typeof c === 'string')
        .slice(0, 3);

      if (cleanedChoices.length !== 3) {
        console.log(`⚠️  Invalid choices count for ${theme}, using fallback`);
        return this.getFallbackRound(roundIndex, theme, previousChoice);
      }

      return {
        story: String(parsed.story),
        choices: cleanedChoices
      };
    } catch (err) {
      console.error(`❌ Dedalus API error for ${theme}:`, err.message || err);
      console.log(`↩️  Falling back to offline ${theme} story`);
      return this.getFallbackRound(roundIndex, theme, previousChoice);
    }
  }
}

module.exports = new StoryEngine();
