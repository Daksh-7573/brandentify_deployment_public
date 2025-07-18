import React from 'react';

export default function PitchDeckDownload() {
  const downloadPitchDeck = () => {
    const link = document.createElement('a');
    link.href = '/pitch-deck.html';
    link.download = 'Brandentifier-Pitch-Deck.html';
    link.click();
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderRadius: '20px',
        padding: '60px',
        maxWidth: '600px',
        textAlign: 'center',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)'
      }}>
        <h1 style={{
          fontSize: '3em',
          fontWeight: '700',
          marginBottom: '30px',
          background: 'linear-gradient(45deg, #667eea, #764ba2)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          Brandentifier Pitch Deck
        </h1>
        
        <p style={{
          fontSize: '1.2em',
          color: '#666',
          marginBottom: '40px',
          lineHeight: '1.6'
        }}>
          Download the complete investor pitch deck showcasing our AI-powered career development platform with dynamic contextual link generation.
        </p>

        <div style={{
          background: 'rgba(255, 255, 255, 0.8)',
          borderRadius: '15px',
          padding: '30px',
          marginBottom: '40px'
        }}>
          <h3 style={{ color: '#2c3e50', marginBottom: '20px' }}>
            What's Included:
          </h3>
          <ul style={{
            textAlign: 'left',
            color: '#555',
            lineHeight: '1.8',
            listStyle: 'none',
            padding: 0
          }}>
            <li>📊 Complete product overview & features</li>
            <li>💡 Dynamic contextual link generation system</li>
            <li>🤖 AI-powered career guidance capabilities</li>
            <li>📈 Market opportunity ($366B global market)</li>
            <li>💰 Revenue model & investment ask ($5M Series A)</li>
            <li>🏗️ Technology stack & architecture</li>
            <li>📅 Product roadmap & growth strategy</li>
          </ul>
        </div>

        <button
          onClick={downloadPitchDeck}
          style={{
            background: 'linear-gradient(45deg, #e74c3c, #c0392b)',
            color: 'white',
            padding: '20px 40px',
            borderRadius: '30px',
            fontSize: '1.2em',
            fontWeight: '600',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 10px 20px rgba(231, 76, 60, 0.3)',
            transition: 'transform 0.3s',
            marginBottom: '20px'
          }}
          onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-3px)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          Download Pitch Deck
        </button>

        <p style={{
          fontSize: '0.9em',
          color: '#888',
          marginTop: '20px'
        }}>
          Professional HTML presentation with print-to-PDF functionality
        </p>

        <div style={{
          marginTop: '40px',
          padding: '20px',
          background: 'rgba(46, 204, 113, 0.1)',
          borderRadius: '10px',
          borderLeft: '4px solid #2ecc71'
        }}>
          <h4 style={{ color: '#27ae60', marginBottom: '10px' }}>
            Ready for Presentation
          </h4>
          <p style={{ color: '#666', fontSize: '0.95em', margin: 0 }}>
            The pitch deck is optimized for investor meetings, partner presentations, and client demos. 
            Use the built-in print function to generate a professional PDF.
          </p>
        </div>
      </div>
    </div>
  );
}