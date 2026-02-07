// Story generation engine using Gemini API or fallback

const https = require('https');

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
      'CRITICAL RULES:',
      '- Write ONLY in English (no other languages)',
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
      const prompt = this.buildPrompt(roundIndex, previousChoice);
      
      // Use REST API instead of SDK to avoid encoding issues
      const requestBody = {
        contents: [{
          role: 'user',
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1024
        }
      };

      const result = await this.callGeminiAPI(requestBody);
      const text = result;
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
      console.log('↩️  Falling back to offline story');
      return this.getFallbackRound(roundIndex);
    }
  }

  // Call Gemini API via REST
  callGeminiAPI(requestBody) {
    return new Promise((resolve, reject) => {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;
      
      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 5000
      };

      const req = https.request(url, options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            console.log('API Response:', JSON.stringify(parsed).substring(0, 200));
            
            if (parsed.error) {
              reject(new Error(`API Error: ${parsed.error.message}`));
              return;
            }
            
            if (parsed.candidates && parsed.candidates[0] && parsed.candidates[0].content) {
              const text = parsed.candidates[0].content.parts[0].text;
              resolve(text);
            } else {
              reject(new Error('Invalid API response structure'));
            }
          } catch (e) {
            reject(e);
          }
        });
      });

      req.on('error', reject);
      req.on('timeout', () => {
        req.destroy();
        reject(new Error('API timeout'));
      });

      req.write(JSON.stringify(requestBody));
      req.end();
    });
  }
}

module.exports = new StoryEngine();
