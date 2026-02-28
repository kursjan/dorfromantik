import React from 'react';
import { useNavigate } from 'react-router-dom';

const MainMenu: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      height: '100vh',
      backgroundColor: '#f0f0f0',
      fontFamily: 'sans-serif'
    }}>
      <h1>Dorfromantik</h1>
      <button 
        onClick={() => navigate('/game')}
        style={{ padding: '10px 20px', fontSize: '1.2rem', cursor: 'pointer' }}
      >
        Start Game
      </button>
    </div>
  );
};

export default MainMenu;
