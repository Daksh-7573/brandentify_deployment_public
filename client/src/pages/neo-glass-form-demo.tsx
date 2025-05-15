import React, { useState } from 'react';
import { Link } from 'wouter';
import '../styles/neo-glass-theme.css';

const NeoGlassFormDemo = () => {
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    password: '',
    bio: '',
    role: 'developer',
    newsletter: true,
    experience: '3-5'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      setFormState({
        ...formState,
        [name]: (e.target as HTMLInputElement).checked
      });
    } else {
      setFormState({
        ...formState,
        [name]: value
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formState);
    alert('Form submitted! Check console for details.');
  };

  return (
    <div className="neo-glass-container">
      <div className="neo-demo-nav" style={{ 
        position: 'absolute', 
        top: '1rem', 
        left: '1rem', 
        zIndex: 100 
      }}>
        <Link href="/neo-glass-demo-spotify">
          <span style={{ 
            display: 'inline-block',
            background: 'var(--neo-primary)',
            color: 'var(--neo-black)',
            padding: '0.5rem 1rem',
            borderRadius: '2rem',
            fontWeight: 600,
            fontSize: '0.9rem',
            textDecoration: 'none',
            transition: 'all 0.2s'
          }}>
            Back to Spotify Demo
          </span>
        </Link>
      </div>
      
      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto', 
        padding: '4rem 1rem 2rem 1rem'
      }}>
        <h1 style={{ 
          textAlign: 'center', 
          marginBottom: '2rem',
          fontSize: '2.5rem',
          fontWeight: 700 
        }}>
          Neo-Glass Form Demo
        </h1>
        
        <div className="neo-glass-flex" style={{ alignItems: 'stretch' }}>
          {/* Left panel - Form */}
          <div className="neo-glass-panel" style={{ 
            flex: '2',
            padding: '2rem' 
          }}>
            <h2 style={{ marginBottom: '1.5rem' }}>User Profile</h2>
            
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1.5rem' }}>
                <label 
                  htmlFor="name" 
                  style={{ 
                    display: 'block', 
                    marginBottom: '0.5rem',
                    fontWeight: 500 
                  }}
                >
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formState.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  className="neo-glass-input"
                  style={{ 
                    backgroundColor: 'rgba(18, 18, 18, 0.95) !important', 
                    color: 'var(--neo-white) !important' 
                  }}
                  required
                />
              </div>
              
              <div style={{ marginBottom: '1.5rem' }}>
                <label 
                  htmlFor="email" 
                  style={{ 
                    display: 'block', 
                    marginBottom: '0.5rem',
                    fontWeight: 500 
                  }}
                >
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formState.email}
                  onChange={handleChange}
                  placeholder="your.email@example.com"
                  className="neo-glass-input"
                  style={{ 
                    backgroundColor: 'rgba(18, 18, 18, 0.95) !important', 
                    color: 'var(--neo-white) !important' 
                  }}
                  required
                />
              </div>
              
              <div style={{ marginBottom: '1.5rem' }}>
                <label 
                  htmlFor="password" 
                  style={{ 
                    display: 'block', 
                    marginBottom: '0.5rem',
                    fontWeight: 500 
                  }}
                >
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formState.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="neo-glass-input"
                  style={{ 
                    backgroundColor: 'rgba(18, 18, 18, 0.95) !important', 
                    color: 'var(--neo-white) !important'
                  }}
                  required
                />
              </div>
              
              <div style={{ marginBottom: '1.5rem' }}>
                <label 
                  htmlFor="bio" 
                  style={{ 
                    display: 'block', 
                    marginBottom: '0.5rem',
                    fontWeight: 500 
                  }}
                >
                  Bio
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  value={formState.bio}
                  onChange={handleChange}
                  placeholder="Tell us about yourself..."
                  className="neo-glass-input"
                  style={{ 
                    minHeight: '100px', 
                    resize: 'vertical',
                    backgroundColor: 'rgba(18, 18, 18, 0.95) !important', 
                    color: 'var(--neo-white) !important'
                  }}
                ></textarea>
              </div>
              
              <div style={{ marginBottom: '1.5rem' }}>
                <label 
                  htmlFor="role" 
                  style={{ 
                    display: 'block', 
                    marginBottom: '0.5rem',
                    fontWeight: 500 
                  }}
                >
                  Professional Role
                </label>
                <select
                  id="role"
                  name="role"
                  value={formState.role}
                  onChange={handleChange}
                  className="neo-glass-input"
                  style={{ 
                    background: 'rgba(18, 18, 18, 0.95) !important',
                    backgroundColor: 'rgba(18, 18, 18, 0.95) !important',
                    color: 'var(--neo-white) !important'
                  }}
                >
                  <option value="developer" style={{ backgroundColor: 'rgba(18, 18, 18, 0.95) !important', color: 'white !important' }}>Developer</option>
                  <option value="designer" style={{ backgroundColor: 'rgba(18, 18, 18, 0.95) !important', color: 'white !important' }}>Designer</option>
                  <option value="manager" style={{ backgroundColor: 'rgba(18, 18, 18, 0.95) !important', color: 'white !important' }}>Product Manager</option>
                  <option value="marketer" style={{ backgroundColor: 'rgba(18, 18, 18, 0.95) !important', color: 'white !important' }}>Marketer</option>
                  <option value="other" style={{ backgroundColor: 'rgba(18, 18, 18, 0.95) !important', color: 'white !important' }}>Other</option>
                </select>
              </div>
              
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ fontWeight: 500, marginBottom: '0.5rem', display: 'block' }}>
                  Years of Experience
                </label>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  {['0-2', '3-5', '6-9', '10+'].map(option => (
                    <label key={option} style={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      gap: '0.5rem',
                      cursor: 'pointer',
                      padding: '0.5rem 1rem',
                      borderRadius: '0.5rem',
                      background: formState.experience === option 
                        ? 'rgba(30, 215, 96, 0.2)' 
                        : 'rgba(18, 18, 18, 0.7)',
                      border: `1px solid ${formState.experience === option 
                        ? 'var(--neo-primary)' 
                        : 'var(--neo-glass-border)'}`
                    }}>
                      <input
                        type="radio"
                        name="experience"
                        value={option}
                        checked={formState.experience === option}
                        onChange={handleChange}
                        style={{ accentColor: 'var(--neo-primary)' }}
                      />
                      {option} years
                    </label>
                  ))}
                </div>
              </div>
              
              <div style={{ marginBottom: '2rem' }}>
                <label style={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  gap: '0.5rem',
                  cursor: 'pointer' 
                }}>
                  <input
                    type="checkbox"
                    name="newsletter"
                    checked={formState.newsletter}
                    onChange={handleChange}
                    style={{ accentColor: 'var(--neo-primary)' }}
                  />
                  Subscribe to newsletter
                </label>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <button 
                  type="button" 
                  className="neo-glass-button secondary"
                  style={{ width: '48%' }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="neo-glass-button"
                  style={{ width: '48%' }}
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
          
          {/* Right panel - Preview */}
          <div className="neo-glass-panel" style={{ 
            flex: '1',
            padding: '2rem',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <h2 style={{ marginBottom: '1.5rem' }}>Profile Preview</h2>
            
            <div className="neo-glass-card" style={{ flex: 1 }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center',
                gap: '1rem',
                marginBottom: '1.5rem' 
              }}>
                <div className="neo-glass-avatar" style={{ 
                  width: '80px', 
                  height: '80px',
                  fontSize: '2rem'
                }}>
                  {formState.name ? formState.name[0].toUpperCase() : '?'}
                </div>
                
                <div>
                  <h3 style={{ fontSize: '1.5rem' }}>
                    {formState.name || 'Your Name'}
                  </h3>
                  <p style={{ color: 'var(--neo-light-gray)' }}>
                    {formState.role === 'developer' ? 'Software Developer' : 
                     formState.role === 'designer' ? 'UI/UX Designer' :
                     formState.role === 'manager' ? 'Product Manager' :
                     formState.role === 'marketer' ? 'Digital Marketer' : 'Professional'}
                  </p>
                </div>
              </div>
              
              <div style={{ marginBottom: '1rem' }}>
                <p>{formState.bio || 'Your bio will appear here...'}</p>
              </div>
              
              <div style={{
                padding: '0.75rem',
                background: 'rgba(18, 18, 18, 0.7)',
                borderRadius: '0.5rem',
                marginBottom: '1rem'
              }}>
                <p style={{ fontSize: '0.9rem' }}>
                  <strong>Experience:</strong> {formState.experience} years
                </p>
              </div>
              
              <div style={{ marginTop: 'auto' }}>
                <button className="neo-glass-button" style={{ width: '100%' }}>
                  Connect
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NeoGlassFormDemo;