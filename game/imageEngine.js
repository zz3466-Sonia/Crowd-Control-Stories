// Image generation engine (currently disabled - can be enabled with Dedalus or other AI image APIs)

const https = require('https');

const API_KEY = process.env.DEDALUS_API_KEY;

class ImageEngine {
  constructor() {
    this.hasApiKey = !!API_KEY;
    console.log('🖼️  Image generation: Currently disabled');
  }

  buildPrompt({ story, choice, visualProfile }) {
    return [
      'Create a single cinematic illustration that matches the story context.',
      'Keep character designs consistent with the profile below.',
      '',
      `CHARACTER PROFILE: ${visualProfile}`,
      '',
      `STORY CONTEXT: ${story}`,
      `SELECTED CHOICE: ${choice}`,
      '',
      'STYLE: cinematic, clean sci-fi, soft lighting, high detail, consistent character faces.'
    ].join('\n');
  }

  extractBase64(payload) {
    if (!payload) return null;
    if (payload.generatedImages && payload.generatedImages[0] && payload.generatedImages[0].bytesBase64Encoded) {
      return payload.generatedImages[0].bytesBase64Encoded;
    }
    if (payload.predictions && payload.predictions[0] && payload.predictions[0].bytesBase64Encoded) {
      return payload.predictions[0].bytesBase64Encoded;
    }
    if (payload.candidates && payload.candidates[0] && payload.candidates[0].content) {
      const part = payload.candidates[0].content.parts?.[0];
      if (part && part.inlineData && part.inlineData.data) {
        return part.inlineData.data;
      }
    }
    return null;
  }

  callImageAPI(url, requestBody) {
    return new Promise((resolve, reject) => {
      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 15000
      };

      const req = https.request(url, options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            if (!data) {
              reject(new Error(`Empty response from image API (HTTP ${res.statusCode})`));
              return;
            }
            const parsed = JSON.parse(data);
            if (parsed.error) {
              reject(new Error(`API Error: ${parsed.error.message}`));
              return;
            }
            resolve(parsed);
          } catch (e) {
            reject(new Error(`Invalid JSON from image API (HTTP ${res.statusCode})`));
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

  async generateImage({ story, choice, visualProfile }) {
    // Image generation temporarily disabled
    // Can be re-enabled with Dedalus image models or other AI image APIs
    // Return graceful fallback instead of error
    return { 
      imageDataUrl: null, 
      error: null  // No error shown to user - graceful degradation
    };
  }
}

module.exports = new ImageEngine();
