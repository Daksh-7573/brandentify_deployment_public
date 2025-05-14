import React, { useState } from 'react';
import { Link } from 'wouter';
import { Home, Search, Library, Clock, Heart, ChevronLeft, ChevronRight, Play, SkipBack, SkipForward, Pause, Repeat, ListMusic, Volume2, Shuffle, X, MoreVertical } from 'lucide-react';
import '../styles/neo-glass-spotify.css';

// User profile avatar component
const Avatar = ({ src, alt }: { src?: string; alt: string }) => (
  <div className="neo-spotify-avatar">
    {src ? <img src={src} alt={alt} /> : <div className="avatar-placeholder">{alt.charAt(0)}</div>}
  </div>
);

// Track component
interface TrackProps {
  id: number;
  title: string;
  artist: string;
  plays: string;
  duration: string;
  image?: string;
  isActive?: boolean;
}

const Track = ({ id, title, artist, plays, duration, image, isActive }: TrackProps) => (
  <div className={`neo-spotify-track ${isActive ? 'active' : ''}`}>
    <div className="track-number">{id}</div>
    <div className="track-image">
      {image ? <img src={image} alt={title} /> : <div className="track-placeholder"></div>}
    </div>
    <div className="track-info">
      <div className="track-title">{title}</div>
      <div className="track-artist">{artist}</div>
    </div>
    <div className="track-plays">{plays}</div>
    <div className="track-actions">
      <Heart className="w-4 h-4" />
    </div>
    <div className="track-duration">{duration}</div>
    <div className="track-more">
      <MoreVertical className="w-4 h-4" />
    </div>
  </div>
);

// Album Card component
interface AlbumCardProps {
  title: string;
  artist: string;
  image?: string;
}

const AlbumCard = ({ title, artist, image }: AlbumCardProps) => (
  <div className="neo-spotify-album-card">
    <div className="album-image">
      {image ? <img src={image} alt={title} /> : <div className="album-placeholder"></div>}
    </div>
    <div className="album-info">
      <div className="album-title">{title}</div>
      <div className="album-artist">{artist}</div>
    </div>
  </div>
);

// Playlist component
interface PlaylistProps {
  title: string;
  description: string;
  isActive?: boolean;
}

const Playlist = ({ title, description, isActive }: PlaylistProps) => (
  <div className={`neo-spotify-playlist ${isActive ? 'active' : ''}`}>
    <div className="playlist-info">
      <div className="playlist-title">{title}</div>
      <div className="playlist-description">{description}</div>
    </div>
  </div>
);

// Main component
const NeoGlassSpotifyDemo = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState('1:24');
  const [totalTime, setTotalTime] = useState('3:45');

  return (
    <div className="neo-spotify-container">
      <div className="neo-spotify-wrapper">
        <div className="neo-spotify-sidebar">
          <div className="sidebar-top">
            <div className="user-profile">
              <Avatar alt="Jane" />
              <div className="user-info">
                <div className="user-name">Jane Cooper</div>
                <div className="user-type">Pro Subscriber</div>
              </div>
            </div>
            <div className="sidebar-nav">
              <div className="sidebar-item active">
                <Library className="w-5 h-5" />
                <span>Your Library</span>
              </div>
              <div className="sidebar-actions">
                <button className="sidebar-action-btn">
                  <ListMusic className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="sidebar-tabs">
              <div className="sidebar-tab active">Playlist</div>
              <div className="sidebar-tab">Artists</div>
            </div>
          </div>
          
          <div className="sidebar-playlists">
            <Playlist 
              title="My Happy Melodies" 
              description="Morning" 
              isActive={true}
            />
            <Playlist 
              title="An Overture To Happiness" 
              description="Hip-hop" 
            />
            <Playlist 
              title="Early, Early Morning" 
              description="Relaxing" 
            />
            <Playlist 
              title="Sunny Days" 
              description="Trip songs" 
            />
          </div>
        </div>
        
        <div className="neo-spotify-main">
          <div className="neo-spotify-header">
            <div className="header-nav">
              <button className="header-nav-btn">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button className="header-nav-btn">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          <div className="neo-spotify-artist-header">
            <div className="artist-verified">
              <span className="verified-badge">✓</span>
              Verified Account
            </div>
            <h1 className="artist-name">Billie Eilish</h1>
            <div className="artist-stats">
              <span className="stats-icon">🎧</span>
              71,478,075 Monthly listener
            </div>
            <div className="artist-actions">
              <button className="action-button primary">
                <Play className="w-4 h-4" />
                Play
              </button>
              <button className="action-button secondary">
                Follow
              </button>
            </div>
          </div>
          
          <div className="neo-spotify-content">
            <h2 className="content-title">Your Library</h2>
            
            <div className="tracks-list">
              <Track 
                id={1}
                title="What was I made for? (From the Barbie Album)"
                artist="Billie Eilish"
                plays="177,922,797"
                duration="3:42"
                isActive={true}
              />
              <Track 
                id={2}
                title="Lovely with Khalid"
                artist="Billie Eilish"
                plays="2,393,349,232"
                duration="3:20"
              />
              <Track 
                id={3}
                title="Happier than ever"
                artist="Billie Eilish"
                plays="1,093,349,232"
                duration="4:58"
              />
              <Track 
                id={4}
                title="TV"
                artist="Billie Eilish"
                plays="361,893,551"
                duration="4:41"
              />
              <Track 
                id={5}
                title="Hotline (edit)"
                artist="Billie Eilish"
                plays="105,469,932"
                duration="1:00"
              />
            </div>
          </div>
        </div>
        
        <div className="neo-spotify-sidebar-right">
          <div className="sidebar-right-header">
            <div className="sidebar-title">Billie Eilish Mix</div>
            <button className="close-btn">
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="sidebar-right-content">
            <div className="featured-track">
              <div className="featured-track-image"></div>
              <div className="featured-track-info">
                <div className="featured-track-title">No time to die</div>
                <div className="featured-track-artist">Billie Eilish</div>
              </div>
              <div className="featured-track-actions">
                <Heart className="w-4 h-4" />
                <MoreVertical className="w-4 h-4" />
              </div>
            </div>
            
            <div className="featured-track">
              <div className="featured-track-image second"></div>
              <div className="featured-track-info">
                <div className="featured-track-title">Ranked in order of</div>
                <div className="featured-track-artist">Billie Eilish</div>
              </div>
              <div className="featured-track-actions">
                <Heart className="w-4 h-4" />
                <MoreVertical className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="neo-spotify-player">
        <div className="player-track-info">
          <div className="player-track-image"></div>
          <div className="player-info">
            <div className="player-track-title">lovely with Khalid</div>
            <div className="player-track-artist">Billie Eilish</div>
          </div>
          <div className="player-favorite">
            <Heart className="w-4 h-4" />
          </div>
        </div>
        
        <div className="player-controls">
          <div className="player-buttons">
            <button className="player-button">
              <Shuffle className="w-4 h-4" />
            </button>
            <button className="player-button">
              <SkipBack className="w-4 h-4" />
            </button>
            <button className="player-button play">
              {isPlaying ? 
                <Pause className="w-5 h-5" onClick={() => setIsPlaying(false)} /> : 
                <Play className="w-5 h-5" onClick={() => setIsPlaying(true)} />
              }
            </button>
            <button className="player-button">
              <SkipForward className="w-4 h-4" />
            </button>
            <button className="player-button">
              <Repeat className="w-4 h-4" />
            </button>
          </div>
          
          <div className="player-progress">
            <div className="progress-time">{currentTime}</div>
            <div className="progress-bar">
              <div className="progress-filled"></div>
            </div>
            <div className="progress-time">{totalTime}</div>
          </div>
        </div>
        
        <div className="player-volume">
          <div className="volume-controls">
            <Volume2 className="w-4 h-4" />
            <div className="volume-bar">
              <div className="volume-filled"></div>
            </div>
          </div>
          <div className="player-views">
            <button className="view-button active">
              <ListMusic className="w-4 h-4" />
            </button>
            <button className="view-button">
              <Library className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
      
      <div className="neo-demo-nav">
        <Link href="/neo-glass-demo">
          <a className="neo-demo-link">
            Back to Demo 1
          </a>
        </Link>
      </div>
    </div>
  );
};

export default NeoGlassSpotifyDemo;