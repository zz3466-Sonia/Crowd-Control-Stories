# AI Character Group Chat - Backend

Interactive sci-fi storytelling game where the audience votes to shape the narrative. Features three characters (astronaut, AI, alien) in a space station mystery.

## 🚀 Setup

### 1. Clone & Install
```bash
git clone https://github.com/zz3466-Sonia/Crowd-Control-Stories.git
cd Crowd-Control-Stories
npm install
```

### 2. Configure API Key
```bash
# Copy the example file
cp .env.example .env

# Edit .env and add your Gemini API key
GEMINI_API_KEY=
```

### 3. Run Server
```bash
npm start
# Server runs on http://localhost:3000
```

## 📡 API Documentation

### Party Management

#### Create Party
```bash
POST /api/party/create
Body: { "playerName": "Alice" }
Response: { "success": true, "partyCode": "ABC123", "playerId": "...", "isHost": true }
```

#### Join Party
```bash
POST /api/party/join
Body: { "partyCode": "ABC123", "playerName": "Bob" }
Response: { "success": true, "partyCode": "ABC123", "playerId": "...", "isHost": false }
```

#### Get Party Info
```bash
GET /api/party/:partyCode
Response: { "success": true, "players": [...], "gameState": {...} }
```

#### Leave Party
```bash
POST /api/party/leave
Body: { "partyCode": "ABC123", "playerId": "..." }
```

### Game Flow

#### Start Game (Host)
```bash
POST /api/game/start
Body: { "partyCode": "ABC123" }
Response: {
  "success": true,
  "gameState": {
    "started": true,
    "currentRound": 1,
    "currentStory": "...",
    "currentChoices": ["A) ...", "B) ...", "C) ..."],
    "voteCounts": { "A": 0, "B": 0, "C": 0 }
  }
}
```

#### Vote
```bash
POST /api/game/vote
Body: { "partyCode": "ABC123", "playerId": "...", "choice": "A" }
Response: { "success": true, "voteCounts": { "A": 1, "B": 0, "C": 0 } }
```

#### Next Round (Tally & Continue)
```bash
POST /api/game/next
Body: { "partyCode": "ABC123" }
Response: {
  "success": true,
  "gameState": {
    "currentRound": 2,
    "currentStory": "...",
    "currentChoices": [...],
    "lastWinner": "A"
  }
}
```

## 🎮 Game Rules

- **Max Players**: 8 per party
- **Characters**: Astronaut, AI, Alien (consistent across all rounds)
- **Theme**: Sci-fi mystery on a space station
- **Flow**: Story → Vote → Next Round → Repeat

## 🔧 Tech Stack

- **Backend**: Node.js + Express
- **AI**: Google Gemini API (with fallback stories)
- **CORS**: Enabled for frontend integration

## 📝 Notes for Team

- Frontend should poll `GET /api/party/:partyCode` to update vote counts in real-time
- No API key? Server uses fallback stories automatically
- All players vote, majority wins, story continues based on winning choice
- Frontend connects to: `http://localhost:3000` (local) or deployed URL

## 🌐 For Teammates

**To run on your computer:**
1. Clone this repo
2. Run `npm install`
3. Create `.env` file (copy from `.env.example`)
4. Add your Gemini API key to `.env`
5. Run `npm start`
6. Backend will be on `http://localhost:3000`
