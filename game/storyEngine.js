// Story generation engine using Gemini API or fallback

const { GoogleGenerativeAI } = require('@google/generative-ai');

// Configuration
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-1.5-flash';

// Fallback story rounds
const STORY_ROUNDS = [
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
];

class StoryEngine {
  constructor() {
    this.hasApiKey = !!GEMINI_API_KEY;
  }

  // Get fallback story round
  getFallbackRound(roundIndex) {
    const fallback = STORY_ROUNDS[roundIndex % STORY_ROUNDS.length];
    return {
      story: fallback.story,
      choices: fallback.choices
    };
  }

  // Build Gemini prompt
  buildPrompt(roundIndex, previousChoice) {
    return [
      '=== INTERACTIVE SCI-FI STORY GENERATOR ===',
      'You are continuing an interactive sci-fi story with THREE CHARACTERS:',
      '- An astronaut (human explorer)',
      '- An AI (advanced artificial intelligence)',
      '- An alien (mysterious extraterrestrial)',
      '',
      'SETTING: They are on a silent space station where an unknown signal has appeared.',
      '',
      'THEME: Maintain suspense, mystery, and sci-fi atmosphere throughout.',
      'Keep the same three characters in every scene.',
      '',
      `ROUND: ${roundIndex + 1}`,
      previousChoice ? `PREVIOUS CHOICE: The audience chose "${previousChoice}" in the last round. Continue the story based on this choice.` : 'This is the first round. Start the story.',
      '',
      'OUTPUT FORMAT (JSON ONLY):',
      '{',
      '  "story": "A short scene description (50-70 words). Show what the characters do/say based on the previous choice.",',
      '  "choices": [',
      '    "A) [Action option related to astronaut]",',
      '    "B) [Action option related to AI]",',
      '    "C) [Action option related to alien]"',
      '  ]',
      '}',
      '',
      'RULES:',
      '- Story must be 50-70 words',
      '- Choices must start with A), B), C)',
      '- Each choice <= 12 words',
      '- Keep sci-fi theme consistent',
      '- Return ONLY the JSON, no extra text'
    ].join('\n');
  }

  // Parse JSON from Gemini response
  safeParseJSON(text) {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return null;
    try {
      return JSON.parse(match[0]);
    } catch {
      return null;
    }
  }

  // Generate story content (with API or fallback)
  async generateRound(roundIndex, previousChoice) {
    if (!this.hasApiKey) {
      console.log('⚠️  No API key, using fallback story');
      return this.getFallbackRound(roundIndex);
    }

    try {
      const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });
      const prompt = this.buildPrompt(roundIndex, previousChoice);

      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.8,
          maxOutputTokens: 256
        }
      });

      const text = result.response.text();
      const parsed = this.safeParseJSON(text);

      if (!parsed || !parsed.story || !Array.isArray(parsed.choices)) {
        console.log('⚠️  API returned invalid format, using fallback');
        return this.getFallbackRound(roundIndex);
      }

      const cleanedChoices = parsed.choices
        .filter(c => typeof c === 'string')
        .slice(0, 3);

      if (cleanedChoices.length !== 3) {
        console.log('⚠️  Invalid choices count, using fallback');
        return this.getFallbackRound(roundIndex);
      }

      console.log('✅ Generated story via Gemini API');
      return {
        story: String(parsed.story),
        choices: cleanedChoices
      };
    } catch (err) {
      console.error('❌ Gemini API error:', err.message || err);
      return this.getFallbackRound(roundIndex);
    }
  }
}

module.exports = new StoryEngine();
