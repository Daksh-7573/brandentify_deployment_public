import React, { useState } from 'react';
import { 
  NeoPageContainer, 
  NeoGlassCard, 
  NeoGlassButton, 
  NeoGlassAvatar,
  NeoGlassInput,
  NeoGlassBadge
} from '@/components/ui/neo-glass';
import { cn } from '@/lib/utils';
import { 
  Home, 
  Search, 
  Library,
  Heart,
  ListMusic,
  Plus,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  Maximize2,
  X,
  Menu,
  Clock,
  Laptop,
  MoreHorizontal,
  CheckCircle
} from 'lucide-react';

// Song type
interface Song {
  id: number;
  title: string;
  artist: string;
  album: string;
  duration: string; // Format: "3:42"
  plays: number;
  image: string;
}

// Playlist type
interface Playlist {
  id: number;
  name: string;
  description: string;
  image: string;
}

export default function NeoGlassDemo3Page() {
  const [backgroundStyle, setBackgroundStyle] = useState<'gradient' | 'white-room' | 'mixed' | 'guitar'>('guitar');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSongIndex, setCurrentSongIndex] = useState(1);
  const [volume, setVolume] = useState(70);
  const [progress, setProgress] = useState(30);

  // Current artist data
  const artist = {
    name: "Musk Career AI",
    followers: "71,478,075",
    isVerified: true,
    image: "https://images.unsplash.com/photo-1530893609608-32a9af3aa95c?auto=format&fit=crop&w=600&h=600",
    profileColor: "bg-lime-400"
  };

  // User data
  const user = {
    name: "Jane Cooper",
    level: "Pro Subscriber",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=64&h=64"
  };

  // Playlist data
  const playlists: Playlist[] = [
    {
      id: 1,
      name: "My Happy Career Path",
      description: "Morning inspiration",
      image: "https://images.unsplash.com/photo-1579547945413-497e1b99dac0?auto=format&fit=crop&w=64&h=64"
    },
    {
      id: 2,
      name: "A Path to Success",
      description: "Step by step guide",
      image: "https://images.unsplash.com/photo-1648737966326-77843e9e1f83?auto=format&fit=crop&w=64&h=64"
    },
    {
      id: 3,
      name: "Professional Growth",
      description: "Career development",
      image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=64&h=64"
    },
    {
      id: 4,
      name: "Interview Confidence",
      description: "Prep tracks",
      image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=64&h=64"
    }
  ];

  // Songs data
  const songs: Song[] = [
    {
      id: 1,
      title: "What was I made for? (From Career Passion)",
      artist: "Musk Career AI",
      album: "Career Foundations",
      duration: "3:42",
      plays: 177922797,
      image: "https://images.unsplash.com/photo-1518133910546-b6c2fb7d79e3?auto=format&fit=crop&w=48&h=48"
    },
    {
      id: 2,
      title: "Find Your Passion",
      artist: "Musk Career AI",
      album: "Career Discovery",
      duration: "3:20",
      plays: 2393349,
      image: "https://images.unsplash.com/photo-1519834785169-98be25ec3f84?auto=format&fit=crop&w=48&h=48"
    },
    {
      id: 3,
      title: "Happier than ever in your job",
      artist: "Musk Career AI",
      album: "Job Satisfaction",
      duration: "4:58",
      plays: 1093349,
      image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=48&h=48"
    },
    {
      id: 4,
      title: "Time Management Masterclass",
      artist: "Musk Career AI",
      album: "Productivity",
      duration: "4:41",
      plays: 361893,
      image: "https://images.unsplash.com/photo-1557862921-37829c790f19?auto=format&fit=crop&w=48&h=48"
    },
    {
      id: 5,
      title: "Hot Skills (trending 2025)",
      artist: "Musk Career AI",
      album: "Skill Development",
      duration: "5:00",
      plays: 105469,
      image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=48&h=48"
    }
  ];

  // Suggested songs
  const suggestedSongs = [
    {
      id: 101,
      title: "No time to waste",
      artist: "Musk Career AI",
      image: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=150&h=150"
    },
    {
      id: 102,
      title: "Ranked in order of importance",
      artist: "Musk Career AI",
      image: "https://images.unsplash.com/photo-1580894732444-8ecded7900cd?auto=format&fit=crop&w=150&h=150"
    }
  ];

  // Get current song
  const currentSong = songs.find(song => song.id === currentSongIndex) || songs[0];

  // Format number with commas
  const formatNumber = (num: number): string => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  return (
    <NeoPageContainer background={backgroundStyle} className="min-h-screen flex items-center justify-center p-4">
      {/* Main app container */}
      <NeoGlassCard className="max-w-[1200px] w-full h-[700px] mx-auto rounded-3xl overflow-hidden relative">
        <div className="flex h-full">
          {/* Left sidebar - icons only */}
          <div className="w-16 h-full flex flex-col items-center py-6 border-r border-white/10">
            <div className="flex flex-col items-center gap-6">
              <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white">
                <span className="text-xl font-bold">M</span>
              </div>
              
              <div className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 text-white">
                <Home className="w-5 h-5" />
              </div>
              
              <div className="w-10 h-10 flex items-center justify-center text-white/70 hover:text-white transition-colors">
                <Search className="w-5 h-5" />
              </div>
              
              <div className="w-10 h-10 flex items-center justify-center text-white/70 hover:text-white transition-colors">
                <Library className="w-5 h-5" />
              </div>
            </div>
          </div>
          
          {/* Left content area - library */}
          <div className="w-64 h-full border-r border-white/10">
            {/* User info */}
            <div className="p-4 flex items-center gap-3">
              <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full object-cover" />
              <div>
                <h3 className="text-white text-sm font-semibold">{user.name}</h3>
                <p className="text-white/60 text-xs">{user.level}</p>
              </div>
            </div>
            
            {/* Library header */}
            <div className="px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-white/70">
                <ListMusic className="w-5 h-5" />
                <span className="text-sm font-medium">Your Library</span>
              </div>
              <div className="flex items-center gap-1">
                <button className="text-white/70 hover:text-white transition-colors">
                  <Plus className="w-4 h-4" />
                </button>
                <button className="text-white/70 hover:text-white transition-colors ml-1">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            {/* Filter pills */}
            <div className="px-4 flex gap-2 mb-2">
              <span className="text-white text-xs bg-white/10 px-3 py-1 rounded-full">Playlist</span>
              <span className="text-white text-xs bg-white/10 px-3 py-1 rounded-full">Career</span>
            </div>
            
            {/* Playlists */}
            <div className="px-2 overflow-y-auto">
              {playlists.map(playlist => (
                <div key={playlist.id} className="px-2 py-2 flex items-center gap-3 hover:bg-white/5 rounded-md cursor-pointer">
                  <img src={playlist.image} alt={playlist.name} className="w-12 h-12 rounded-md object-cover" />
                  <div>
                    <h4 className="text-white text-sm font-medium">{playlist.name}</h4>
                    <p className="text-white/60 text-xs">{playlist.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Main content area */}
          <div className="flex-grow h-full overflow-y-auto relative">
            {/* Navigation */}
            <div className="sticky top-0 z-10 px-6 py-4 flex items-center justify-between bg-black/30 backdrop-blur-md">
              <div className="flex items-center gap-2">
                <button className="w-7 h-7 flex items-center justify-center rounded-full bg-black/40 text-white">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button className="w-7 h-7 flex items-center justify-center rounded-full bg-black/40 text-white">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-center gap-3">
                <NeoGlassButton variant="primary" className="text-xs py-1 px-3">
                  Upgrade
                </NeoGlassButton>
                <button className="flex items-center justify-center rounded-full bg-black/40 text-white px-3 py-1 text-xs">
                  <Laptop className="w-3 h-3 mr-1" /> Web App
                </button>
              </div>
            </div>
            
            {/* Artist header */}
            <div className={`p-6 flex items-end gap-6 h-60 ${artist.profileColor}`}>
              <img 
                src={artist.image} 
                alt={artist.name} 
                className="w-44 h-44 object-cover shadow-lg" 
              />
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-white fill-black" />
                  <span className="text-black text-sm font-medium">Verified Account</span>
                </div>
                <h1 className="text-5xl font-bold text-black mb-4">{artist.name}</h1>
                <div className="flex items-center text-black/80 text-sm">
                  <span className="font-medium mr-1">{artist.followers}</span> monthly engagement
                </div>
              </div>
            </div>
            
            {/* Action buttons */}
            <div className="px-6 py-4 flex items-center gap-4">
              <button 
                className="bg-white rounded-full w-10 h-10 flex items-center justify-center"
                onClick={() => setIsPlaying(!isPlaying)}
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5 text-black" />
                ) : (
                  <Play className="w-5 h-5 text-black ml-0.5" />
                )}
              </button>
              <button className="text-white/70 hover:text-white">
                <Heart className="w-6 h-6" />
              </button>
              <button className="text-white/70 hover:text-white">
                <MoreHorizontal className="w-6 h-6" />
              </button>
            </div>
            
            {/* Song list header */}
            <div className="px-6 py-2">
              <h2 className="text-white text-xl font-bold mb-4">Your Library</h2>
              <div className="grid grid-cols-[16px_4fr_3fr_2fr_1fr] gap-4 py-2 border-b border-white/10 text-white/60 text-sm">
                <div className="text-center">#</div>
                <div>Title</div>
                <div>Album</div>
                <div className="text-right">Plays</div>
                <div className="flex justify-end">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
            </div>
            
            {/* Song list */}
            <div className="px-6">
              {songs.map((song, index) => (
                <div 
                  key={song.id}
                  className={cn(
                    "grid grid-cols-[16px_4fr_3fr_2fr_1fr] gap-4 py-2 text-sm hover:bg-white/5 rounded-md cursor-pointer",
                    song.id === currentSongIndex ? "bg-white/10" : ""
                  )}
                  onClick={() => {
                    setCurrentSongIndex(song.id);
                    setIsPlaying(true);
                  }}
                >
                  <div className="flex items-center justify-center text-white/60">
                    {song.id === currentSongIndex && isPlaying ? (
                      <div className="w-4 h-4 flex items-center justify-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      </div>
                    ) : (
                      <span>{index + 1}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <img src={song.image} alt={song.title} className="w-10 h-10 rounded object-cover" />
                    <div>
                      <div className={cn(
                        "font-medium",
                        song.id === currentSongIndex ? "text-green-500" : "text-white"
                      )}>
                        {song.title}
                      </div>
                      <div className="text-white/60">{song.artist}</div>
                    </div>
                  </div>
                  <div className="flex items-center text-white/60">
                    {song.album}
                  </div>
                  <div className="flex items-center justify-end text-white/60">
                    {formatNumber(song.plays)}
                  </div>
                  <div className="flex items-center justify-end text-white/60">
                    {song.duration}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Right panel - now playing */}
          <div className="w-72 h-full border-l border-white/10 overflow-hidden">
            <div className="p-3 flex justify-between items-center">
              <h3 className="text-white font-semibold">Musk Career Mix</h3>
              <button className="text-white/70 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            {/* Current track details */}
            <div className="p-3">
              <div className="mb-2">
                <img 
                  src={suggestedSongs[0].image} 
                  alt={suggestedSongs[0].title} 
                  className="w-full aspect-square object-cover rounded-md"
                />
              </div>
              <h4 className="text-white font-semibold mt-2">{suggestedSongs[0].title}</h4>
              <p className="text-white/60 text-sm">{suggestedSongs[0].artist}</p>
            </div>
            
            {/* More from artist */}
            <div className="p-3 mt-4">
              <h3 className="text-white font-semibold mb-3">More from {artist.name}</h3>
              <div className="space-y-3">
                {suggestedSongs.map(song => (
                  <div key={song.id} className="flex items-center gap-2">
                    <img 
                      src={song.image} 
                      alt={song.title} 
                      className="w-14 h-14 object-cover rounded"
                    />
                    <div>
                      <h5 className="text-white text-sm font-medium">{song.title}</h5>
                      <p className="text-white/60 text-xs">{song.artist}</p>
                    </div>
                    <button className="ml-auto text-white/60 hover:text-white transition-colors">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Bottom player bar */}
        <div className="absolute bottom-0 left-0 right-0 h-16 border-t border-white/10 px-4 flex items-center justify-between bg-black/50 backdrop-blur-sm">
          <div className="flex items-center gap-3 w-1/4">
            <img 
              src={currentSong.image} 
              alt={currentSong.title} 
              className="w-10 h-10 rounded object-cover"
            />
            <div>
              <h4 className="text-white text-sm font-medium">{currentSong.title.length > 20 ? currentSong.title.substring(0, 20) + '...' : currentSong.title}</h4>
              <p className="text-white/60 text-xs">{currentSong.artist}</p>
            </div>
            <button className="text-white/60 hover:text-white ml-2">
              <Heart className="w-4 h-4" />
            </button>
          </div>
          
          <div className="flex flex-col items-center w-2/4">
            <div className="flex items-center gap-4 mb-1">
              <button className="text-white/70 hover:text-white">
                <SkipBack className="w-4 h-4" />
              </button>
              <button 
                className="w-8 h-8 rounded-full bg-white flex items-center justify-center"
                onClick={() => setIsPlaying(!isPlaying)}
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4 text-black" />
                ) : (
                  <Play className="w-4 h-4 text-black ml-0.5" />
                )}
              </button>
              <button className="text-white/70 hover:text-white">
                <SkipForward className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex items-center gap-2 w-full">
              <span className="text-white/60 text-xs">1:00</span>
              <div className="flex-grow h-1 bg-white/20 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-white rounded-full" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <span className="text-white/60 text-xs">4:30</span>
            </div>
          </div>
          
          <div className="flex items-center justify-end gap-3 w-1/4">
            <button className="text-white/60 hover:text-white">
              <Menu className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-white/60" />
              <div className="w-20 h-1 bg-white/20 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-white rounded-full" 
                  style={{ width: `${volume}%` }}
                ></div>
              </div>
            </div>
            <button className="text-white/60 hover:text-white">
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </NeoGlassCard>
      
      {/* Background style switcher */}
      <div className="fixed top-4 right-4 z-30">
        <NeoGlassCard className="p-1 flex items-center gap-1 rounded-full">
          <NeoGlassButton 
            variant={backgroundStyle === 'gradient' ? 'primary' : undefined}
            onClick={() => setBackgroundStyle('gradient')}
            className="py-1 px-2 text-xs"
          >
            Gradient
          </NeoGlassButton>
          <NeoGlassButton 
            variant={backgroundStyle === 'white-room' ? 'primary' : undefined}
            onClick={() => setBackgroundStyle('white-room')}
            className="py-1 px-2 text-xs"
          >
            White Room
          </NeoGlassButton>
          <NeoGlassButton 
            variant={backgroundStyle === 'mixed' ? 'primary' : undefined}
            onClick={() => setBackgroundStyle('mixed')}
            className="py-1 px-2 text-xs"
          >
            Mixed
          </NeoGlassButton>
          <NeoGlassButton 
            variant={backgroundStyle === 'guitar' ? 'primary' : undefined}
            onClick={() => setBackgroundStyle('guitar')}
            className="py-1 px-2 text-xs"
          >
            Guitar
          </NeoGlassButton>
        </NeoGlassCard>
      </div>
    </NeoPageContainer>
  );
}