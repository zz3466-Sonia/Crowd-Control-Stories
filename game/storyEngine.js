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

  // Build Gemini prompt based on story theme
  buildPrompt(roundIndex, previousChoice, theme = 'scifi') {
    const prompts = {
      scifi: this.buildSciFiPrompt(roundIndex, previousChoice),
      romance: this.buildRomancePrompt(roundIndex, previousChoice),
      mystery: this.buildMysteryPrompt(roundIndex, previousChoice),
      adventure: this.buildAdventurePrompt(roundIndex, previousChoice)
    };
    return prompts[theme] || prompts.scifi;
  }

  buildSciFiPrompt(roundIndex, previousChoice) {
    const storyContext = previousChoice 
      ? `PREVIOUS STORY:\n${previousChoice}\n\n⚠️ IMPORTANT: Start your new story by BRIEFLY mentioning what the players chose (in 1 short sentence), then continue the story.`
      : 'START: The signal appears on the silent space station. Introduce the three characters and the mysterious signal.';
    
    return [
      '=== INTERACTIVE SCI-FI STORY GENERATOR ===',
      'THREE CHARACTERS:',
      '- Astronaut (human explorer)',
      '- AI (advanced intelligence)',
      '- Alien (mysterious being)',
      '',
      `ROUND: ${roundIndex + 1}`,
      storyContext,
      '',
      'OUTPUT FORMAT (JSON):',
      '{',
      '  "story": "If continuing: Start with 1 SHORT sentence about what was chosen, then write 2-3 sentences (40-50 words total) continuing the story.",',
      '  "choices": [',
      '    "A) [Astronaut action]",',
      '    "B) [AI action]",',
      '    "C) [Alien action]"',
      '  ]',
      '}',
      '',
      'RULES:',
      '- English only',
      '- 3-4 sentences MAX (40-50 words TOTAL)',
      '- First sentence: briefly mention the choice',
      '- Then: continue the story',
      '- Choices <= 10 words',
      '- JSON only'
    ].join('\n');
  }

  buildRomancePrompt(roundIndex, previousChoice) {
    const storyContext = previousChoice 
      ? `PREVIOUS STORY:\n${previousChoice}\n\n⚠️ IMPORTANT: Start your new story by BRIEFLY mentioning what the players chose (in 1 short sentence), then continue the story.`
      : 'START: Two Columbia students meet in an ordinary campus moment. Make it feel real and slightly awkward.';
    
    return [
      '=== ROMANTIC CAMPUS STORY ===',
      'Columbia University setting. Two students (20-22). Real college life.',
      '',
      `ROUND: ${roundIndex + 1}`,
      storyContext,
      '',
      'OUTPUT FORMAT (JSON):',
      '{',
      '  "story": "If continuing: Start with 1 SHORT sentence about what was chosen, then write 2-3 sentences (40-50 words total) continuing the story.",',
      '  "choices": [',
      '    "A) [Stay/open up]",',
      '    "B) [Leave/distance]",',
      '    "C) [Interruption]"',
      '  ]',
      '}',
      '',
      'RULES:',
      '- English only',
      '- 3-4 sentences MAX (40-50 words TOTAL)',
      '- First sentence: briefly mention the choice',
      '- Then: continue the story',
      '- Choices <= 10 words',
      '- JSON only'
    ].join('\n');
  }

  buildMysteryPrompt(roundIndex, previousChoice) {
    const storyContext = previousChoice 
      ? `PREVIOUS STORY:\n${previousChoice}\n\n⚠️ IMPORTANT: Start your new story by BRIEFLY mentioning what the players chose (in 1 short sentence), then continue the story.`
      : 'START: A detective makes a curious discovery in a coastal town. Introduce the mystery.';
    
    return [
      '=== MYSTERY STORY ===',
      'Detective, suspect, witness in a coastal town.',
      '',
      `ROUND: ${roundIndex + 1}`,
      storyContext,
      '',
      'OUTPUT FORMAT (JSON):',
      '{',
      '  "story": "If continuing: Start with 1 SHORT sentence about what was chosen, then write 2-3 sentences (40-50 words total) continuing the story.",',
      '  "choices": [',
      '    "A) [Investigate deeper]",',
      '    "B) [Trust intuition]",',
      '    "C) [Uncover secret]"',
      '  ]',
      '}',
      '',
      'RULES:',
      '- English only',
      '- 3-4 sentences MAX (40-50 words TOTAL)',
      '- First sentence: briefly mention the choice',
      '- Then: continue the story',
      '- Choices <= 10 words',
      '- JSON only'
    ].join('\n');
  }

  buildAdventurePrompt(roundIndex, previousChoice) {
    const storyContext = previousChoice 
      ? `PREVIOUS STORY:\n${previousChoice}\n\n⚠️ IMPORTANT: Start your new story by BRIEFLY mentioning what the players chose (in 1 short sentence), then continue the story.`
      : 'START: An explorer, companion, and guide face danger in an exotic world. Begin the adventure.';
    
    return [
      '=== ADVENTURE STORY ===',
      'Explorer, companion, guide in a dangerous world.',
      '',
      `ROUND: ${roundIndex + 1}`,
      storyContext,
      '',
      'OUTPUT FORMAT (JSON):',
      '{',
      '  "story": "If continuing: Start with 1 SHORT sentence about what was chosen, then write 2-3 sentences (40-50 words total) continuing the story.",',
      '  "choices": [',
      '    "A) [Risky path]",',
      '    "B) [Safe route]",',
      '    "C) [Follow instinct]"',
      '  ]',
      '}',
      '',
      'RULES:',
      '- English only',
      '- 3-4 sentences MAX (40-50 words TOTAL)',
      '- First sentence: briefly mention the choice',
      '- Then: continue the story',
      '- Choices <= 10 words',
      '- JSON only'
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
  async generateRound(roundIndex, previousChoice, theme = 'scifi') {
    if (!this.hasApiKey) {
      console.log('⚠️  No API key, using fallback story');
      return this.getFallbackRound(roundIndex);
    }

    try {
      const prompt = this.buildPrompt(roundIndex, previousChoice, theme);
      
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

      console.log(`✅ Generated ${theme} story via Gemini API`);
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
