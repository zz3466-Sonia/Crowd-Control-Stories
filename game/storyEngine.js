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

  buildRomancePrompt(roundIndex, previousChoice) {
    return [
      '=== INTERACTIVE ROMANTIC STORY GENERATOR ===',
      'You are a COLUMBIA UNIVERSITY CAMPUS STORY GENERATOR:',
      '- This is a slice-of-life romantic story set at Columbia University. No AI. No sci-fi. No fantasy. Everything must feel REAL.',
      '- Female protagonist: Undergraduate at Columbia (20-22), intelligent, slightly guarded, emotionally self-aware.',
      '- Male protagonist: Undergraduate at Columbia (20-22), calm, low-key confident, shows care through small actions.',
      '- Interrupter/catalyst: A realistic campus element (mutual friend, deadline, class, dining hall, weather, timing).',
      '',
      'SETTING: Real Columbia University locations (Butler Library, Dodge Hall, John Jay dining, College Walk, Low Library steps).',
      '',
      'THEME: Grounded campus realism with subtle slow-burn romance. Tension through proximity, timing, and silence.',
      'TONE: Contemporary college life; slightly awkward; emotionally restrained; realistic for Ivy League students.',
      '',
      `ROUND: ${roundIndex + 1}`,
      previousChoice ? `PREVIOUS CHOICE: The audience chose "${previousChoice}". Continue naturally from this decision.` : 'This is round 1. Begin with an ordinary Columbia moment that feels insignificant but emotionally charged.',
      '',
      'STORY REQUIREMENTS:',
      '- 60-90 words. Focus on small moments (eye contact, walking together, shared food, sitting quietly).',
      '- Include one subtle romantic beat (hesitation, unspoken thought, missed chance).',
      '- The interrupter must affect the scene (delay, awkwardness, or push).',
      '',
      'CHOICES DESIGN:',
      '- A) Emotional risk or closeness (staying longer, opening up, sharing something)',
      '- B) Staying rational/guarded (leaving, studying, keeping distance)',
      '- C) External interruption (friend, event, schedule, campus situation intervenes)',
      '',
      'OUTPUT FORMAT (JSON ONLY):',
      '{',
      '  "story": "A short, cinematic campus scene with subtle emotional tension.",',
      '  "choices": [',
      '    "A) [Emotion-forward: stay longer, open up slightly, share something small]",',
      '    "B) [Practical: leave, study, keep distance, stay neutral]",',
      '    "C) [Interruption: friend, event, schedule intervenes]"',
      '  ]',
      '}',
      '',
      'Return ONLY the JSON, no extra text.'
    ].join('\n');
  }

  buildMysteryPrompt(roundIndex, previousChoice) {
    return [
      '=== INTERACTIVE MYSTERY STORY GENERATOR ===',
      'You are crafting an interactive mystery with THREE CHARACTERS:',
      '- A detective (sharp-minded investigator)',
      '- A suspect (with secrets to hide)',
      '- A witness (knows more than they are saying)',
      '',
      'SETTING: A small coastal town with hidden connections and secrets.',
      '',
      'THEME: Build suspense and intrigue. Each clue leads to more questions.',
      'Keep the same three characters and maintain continuity.',
      '',
      `ROUND: ${roundIndex + 1}`,
      previousChoice ? `PREVIOUS CHOICE: The audience chose "${previousChoice}". This clue or action drives the investigation forward.` : 'This is round 1. Begin with a curious discovery or an unexpected encounter.',
      '',
      'OUTPUT FORMAT (JSON ONLY):',
      '{',
      '  "story": "A 50-70 word scene revealing clues, motives, or unexpected twists.",',
      '  "choices": [',
      '    "A) [Investigate deeper]",',
      '    "B) [Trust intuition]",',
      '    "C) [Uncover a secret]"',
      '  ]',
      '}',
      '',
      'Return ONLY the JSON, no extra text.'
    ].join('\n');
  }

  buildAdventurePrompt(roundIndex, previousChoice) {
    return [
      '=== INTERACTIVE ADVENTURE STORY GENERATOR ===',
      'You are creating an interactive adventure with THREE CHARACTERS:',
      '- A brave explorer (resourceful and quick-thinking)',
      '- A loyal companion (steady and loyal)',
      '- A mysterious guide (knows the secrets of this world)',
      '',
      'SETTING: An exotic, dangerous world full of wonder and peril.',
      '',
      'THEME: Action, discovery, and survival. Each choice has real consequences.',
      'Keep the same three characters and maintain the adventure momentum.',
      '',
      `ROUND: ${roundIndex + 1}`,
      previousChoice ? `PREVIOUS CHOICE: The audience chose "${previousChoice}". This action shapes the adventure ahead.` : 'This is round 1. Begin with an exciting moment of discovery or danger.',
      '',
      'OUTPUT FORMAT (JSON ONLY):',
      '{',
      '  "story": "A 50-70 word scene full of action, discovery, or danger.",',
      '  "choices": [',
      '    "A) [Take the risky path]",',
      '    "B) [Play it safe]",',
      '    "C) [Follow your instincts]"',
      '  ]',
      '}',
      '',
      'Return ONLY the JSON, no extra text.'
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
