import React, { useState } from 'react';
import './App.css';

export default function App() {
  // Navigation State
  const [view, setView] = useState('home'); // home, hostLobby, enterCode, enterName, memberLobby, game, end
  
  // Data State
  const [username, setUsername] = useState('');
  const [roomCode, setRoomCode] = useState('');
  
  // --- VIEWS ---

  // 1. HOME PAGE
  const HomeScreen = () => (
    <div className="screen-card">
      <h1 className="logo">CROWDSTORY</h1>
      <p className="subtitle">A party RPG game to play with your friends!</p>
      
      <button className="btn-primary" onClick={() => {
        setRoomCode("DEVFEST2026"); // Simulate generating code
        setView('hostLobby');
      }}>CREATE PARTY</button>
      
      <button className="btn-primary btn-secondary" onClick={() => setView('enterCode')}>
        JOIN PARTY
      </button>
    </div>
  );

  // 2. HOST LOBBY
  const HostLobby = () => (
    <div className="screen-card">
      <button className="btn-primary btn-red" onClick={() => setView('home')}>LEAVE GROUP</button>
      <h1 className="logo" style={{fontSize: '1.5rem'}}>CROWDSTORY</h1>
      
      <h3>CODE: {roomCode}</h3>
      
      <div className="player-list">
        <div className="player-chip host-chip">Khine (HOST)</div>
        <div className="player-chip">Username</div>
        <div className="player-chip">Username</div>
        <div className="player-chip">Username</div>
      </div>

      <div style={{marginTop: 'auto'}}>
        <button className="btn-primary" onClick={() => setView('game')}>START GAME</button>
      </div>
    </div>
  );

  // 3. ENTER CODE (Member View)
  const EnterCodeScreen = () => (
    <div className="screen-card">
      <h1 className="logo" style={{fontSize: '1.5rem'}}>CROWDSTORY</h1>
      <div style={{marginTop: '3rem'}}>
        <h3>ENTER CODE</h3>
        <input 
          type="text" 
          placeholder="ex. DEVFEST2026"
          onChange={(e) => setRoomCode(e.target.value)}
        />
        <button className="btn-primary" onClick={() => setView('enterName')}>CONTINUE</button>
      </div>
    </div>
  );

  // 4. ENTER NAME (Member View)
  const EnterNameScreen = () => (
    <div className="screen-card">
      <h1 className="logo" style={{fontSize: '1.5rem'}}>CROWDSTORY</h1>
      <div style={{marginTop: '3rem'}}>
        <h3>ENTER USERNAME</h3>
        <input 
          type="text" 
          placeholder="Your Name" 
          onChange={(e) => setUsername(e.target.value)}
        />
        <button className="btn-primary" onClick={() => setView('memberLobby')}>JOIN</button>
      </div>
    </div>
  );

  // 5. MEMBER LOBBY
  const MemberLobby = () => (
    <div className="screen-card">
      <button className="btn-primary btn-red" onClick={() => setView('home')}>LEAVE GROUP</button>
      <h1 className="logo" style={{fontSize: '1.5rem'}}>CROWDSTORY</h1>
      <h3>CODE: {roomCode || "DEVFEST2026"}</h3>
      
      <div className="player-list">
        <div className="player-chip host-chip">Khine (HOST)</div>
        <div className="player-chip" style={{background: '#d1f7d6'}}>{username || "You"}</div>
        <div className="player-chip">Username</div>
        <div className="player-chip">Username</div>
      </div>
      
      <p style={{marginTop: 'auto', color: '#888'}}>Waiting for host to start...</p>
    </div>
  );

  // 6. GAME SCREEN (The Story)
  const GameScreen = () => (
    <div className="screen-card" style={{alignItems: 'flex-start', textAlign: 'left'}}>
      <h1 className="logo" style={{fontSize: '1.2rem'}}>CROWDSTORY</h1>
      
      {/* Story Text */}
      <div style={{fontSize: '1.2rem', margin: '20px 0', lineHeight: '1.5'}}>
        You walk into a forest and you hear loud footsteps approaching...
      </div>

      {/* Choices */}
      <div style={{width: '100%', marginTop: 'auto'}}>
        <button className="choice-btn" onClick={() => setView('end')}>Go in a nearby cave</button>
        <button className="choice-btn" onClick={() => setView('end')}>Run in opposite direction</button>
        <button className="choice-btn" onClick={() => setView('end')}>Find a stick to fight</button>
      </div>
    </div>
  );

  // 7. END SCREEN
  const EndScreen = () => (
    <div className="screen-card">
      <button className="btn-primary btn-red" onClick={() => setView('home')}>HOME</button>
      <h1 className="logo" style={{fontSize: '1.5rem'}}>CROWDSTORY</h1>
      
      <h2 style={{color: '#555'}}>YOUR ENDING</h2>
      
      <div style={{background: '#eee', padding: '20px', borderRadius: '10px', fontSize: '1rem', lineHeight: '1.4'}}>
        Congratulations! You have beaten the monster. But at what cost? You go back to your home village and you are celebrated as a hero.
      </div>
      
      <button className="btn-primary" style={{marginTop: 'auto'}} onClick={() => setView('home')}>PLAY AGAIN</button>
    </div>
  );

  // --- RENDER CONTROLLER ---
  return (
    <div className="app-container">
      {view === 'home' && <HomeScreen />}
      {view === 'hostLobby' && <HostLobby />}
      {view === 'enterCode' && <EnterCodeScreen />}
      {view === 'enterName' && <EnterNameScreen />}
      {view === 'memberLobby' && <MemberLobby />}
      {view === 'game' && <GameScreen />}
      {view === 'end' && <EndScreen />}
    </div>
  );
}