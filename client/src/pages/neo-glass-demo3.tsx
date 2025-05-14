import React, { useState } from 'react';
import { 
  NeoPageContainer, 
  NeoGlassCard, 
  NeoGlassButton, 
  NeoGlassProgress,
  NeoGlassAvatar
} from '@/components/ui/neo-glass';
import { Home, Search, Library, BarChart2, Clock, Heart, Plus, Music, ListMusic, Volume2, Play, Pause, SkipBack, SkipForward, Shuffle, Repeat } from 'lucide-react';
import { cn } from '@/lib/utils';

// Define types for our data structures
interface Song {
  id: number;
  title: string;
  artist: string;
  album: string;
  duration: string; // Format: "3:42"
  plays: number;
  image: string;
}

interface Playlist {
  id: number;
  name: string;
  description: string;
  image: string;
}

export default function NeoGlassDemo3Page() {
  const [backgroundStyle, setBackgroundStyle] = useState<'gradient' | 'white-room' | 'mixed' | 'guitar' | 'black-room'>('black-room');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSongIndex, setCurrentSongIndex] = useState(1);
  const [volume, setVolume] = useState(70);
  const [progress, setProgress] = useState(30);
  
  // Sample data
  const songs: Song[] = [
    {
      id: 1,
      title: "Future Career",
      artist: "Career Capsule",
      album: "Goals 2025",
      duration: "3:42",
      plays: 1240,
      image: "https://via.placeholder.com/60?text=FC"
    },
    {
      id: 2,
      title: "Resume Builder",
      artist: "Drop & Define",
      album: "Profile Complete",
      duration: "4:15",
      plays: 890,
      image: "https://via.placeholder.com/60?text=RB"
    },
    {
      id: 3,
      title: "Mentorship Connect",
      artist: "Growth Network",
      album: "Networking",
      duration: "3:21",
      plays: 2100,
      image: "https://via.placeholder.com/60?text=MC"
    },
    {
      id: 4,
      title: "Shadow Resume",
      artist: "Career Tracking",
      album: "Progress Analytics",
      duration: "5:07",
      plays: 760,
      image: "https://via.placeholder.com/60?text=SR"
    },
    {
      id: 5,
      title: "Quest Rewards",
      artist: "Engagement",
      album: "Weekly Tasks",
      duration: "2:55",
      plays: 1520,
      image: "https://via.placeholder.com/60?text=QR"
    }
  ];

  const playlists: Playlist[] = [
    {
      id: 1,
      name: "Career Development",
      description: "Growth opportunities for your career path",
      image: "https://via.placeholder.com/120?text=Career"
    },
    {
      id: 2,
      name: "Networking Made Easy",
      description: "Tools for better professional connections",
      image: "https://via.placeholder.com/120?text=Network"
    },
    {
      id: 3,
      name: "Resume Perfection",
      description: "Get your resume noticed by employers",
      image: "https://via.placeholder.com/120?text=Resume"
    },
    {
      id: 4,
      name: "Industry Insights",
      description: "Latest trends in your professional field",
      image: "https://via.placeholder.com/120?text=Industry"
    },
    {
      id: 5,
      name: "Leadership Skills",
      description: "Develop your leadership abilities",
      image: "https://via.placeholder.com/120?text=Lead"
    },
    {
      id: 6,
      name: "Technical Growth",
      description: "Enhance your technical capabilities",
      image: "https://via.placeholder.com/120?text=Tech"
    }
  ];

  const currentSong = songs[currentSongIndex - 1];

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handlePrevious = () => {
    setCurrentSongIndex(prev => prev === 1 ? songs.length : prev - 1);
  };

  const handleNext = () => {
    setCurrentSongIndex(prev => prev === songs.length ? 1 : prev + 1);
  };

  return (
    <NeoPageContainer background={backgroundStyle} className="min-h-screen flex overflow-hidden">
      {/* Sidebar */}
      <NeoGlassCard className="w-60 h-screen p-4 rounded-none flex flex-col mr-1">
        <div className="flex items-center mb-7">
          <div className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-500">
            Musk Career
          </div>
        </div>
        
        {/* Main Navigation */}
        <div className="flex flex-col gap-2 mb-8">
          <button className="flex items-center gap-3 py-2 px-3 bg-white/10 rounded-md text-white font-medium">
            <Home size={20} />
            <span>Home</span>
          </button>
          <button className="flex items-center gap-3 py-2 px-3 hover:bg-white/5 rounded-md text-gray-300">
            <Search size={20} />
            <span>Search</span>
          </button>
          <button className="flex items-center gap-3 py-2 px-3 hover:bg-white/5 rounded-md text-gray-300">
            <Library size={20} />
            <span>Your Library</span>
          </button>
        </div>
        
        {/* Playlists */}
        <div className="flex flex-col gap-2 mb-6">
          <button className="flex items-center gap-3 py-2 px-3 hover:bg-white/5 rounded-md text-gray-300">
            <Plus size={18} className="p-1 bg-gray-300 text-gray-800 rounded-sm" />
            <span>Create Playlist</span>
          </button>
          <button className="flex items-center gap-3 py-2 px-3 hover:bg-white/5 rounded-md text-gray-300">
            <Heart size={18} className="p-1 bg-gradient-to-br from-purple-500 to-blue-500 text-white rounded-sm" />
            <span>Liked Content</span>
          </button>
        </div>
        
        {/* Playlist List */}
        <div className="border-t border-white/10 pt-4 flex-1 overflow-y-auto">
          <div className="flex flex-col gap-1">
            {Array(15).fill(0).map((_, i) => (
              <button key={i} className="text-left py-1 px-3 hover:bg-white/5 rounded-md text-gray-300 truncate text-sm">
                Career Playlist {i + 1}
              </button>
            ))}
          </div>
        </div>
      </NeoGlassCard>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top bar */}
        <NeoGlassCard className="p-4 flex items-center justify-between rounded-tl-none rounded-tr-none">
          <div className="flex gap-2">
            <NeoGlassButton className="w-8 h-8 rounded-full p-0" variant="secondary" isIcon>
              <SkipBack size={16} />
            </NeoGlassButton>
            <NeoGlassButton className="w-8 h-8 rounded-full p-0" variant="secondary" isIcon>
              <SkipForward size={16} />
            </NeoGlassButton>
          </div>
          
          <div className="flex items-center gap-3">
            <NeoGlassButton className="text-sm">
              Upgrade
            </NeoGlassButton>
            <NeoGlassButton className="w-8 h-8 rounded-full p-0" variant="primary" isIcon>
              <span className="text-xs font-bold">FB</span>
            </NeoGlassButton>
          </div>
        </NeoGlassCard>
        
        {/* Main content scrollable area */}
        <div className="flex-1 overflow-auto p-4">
          <h1 className="text-2xl font-bold mb-4">Career Focus Made For You</h1>
          
          {/* Playlists Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 mb-8">
            {playlists.map(playlist => (
              <NeoGlassCard key={playlist.id} className="p-3 transition-all hover:translate-y-[-5px]">
                <div className="aspect-square rounded-md overflow-hidden mb-3">
                  <img 
                    src={playlist.image} 
                    alt={playlist.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="font-bold text-sm mb-1">{playlist.name}</h3>
                <p className="text-xs text-gray-300">{playlist.description}</p>
              </NeoGlassCard>
            ))}
          </div>
          
          {/* Recently Played */}
          <h2 className="text-xl font-bold mb-4">Recently Explored</h2>
          <div className="mb-8">
            <NeoGlassCard className="p-4">
              <div className="flex flex-col">
                <div className="grid grid-cols-12 py-2 px-4 border-b border-white/10 text-sm text-gray-400">
                  <div className="col-span-1">#</div>
                  <div className="col-span-6">TITLE</div>
                  <div className="col-span-3">ALBUM</div>
                  <div className="col-span-2 text-right">DURATION</div>
                </div>
                
                {songs.map((song, index) => (
                  <div key={song.id} 
                    className={cn(
                      "grid grid-cols-12 py-2 px-4 text-sm items-center hover:bg-white/5 rounded-md",
                      currentSongIndex === song.id ? "bg-white/10" : ""
                    )}
                  >
                    <div className="col-span-1">{song.id}</div>
                    <div className="col-span-6 flex items-center gap-3">
                      <img src={song.image} alt={song.title} className="w-10 h-10 rounded-md" />
                      <div>
                        <div className={cn("font-medium", currentSongIndex === song.id ? "text-blue-400" : "")}>
                          {song.title}
                        </div>
                        <div className="text-gray-400">{song.artist}</div>
                      </div>
                    </div>
                    <div className="col-span-3 text-gray-400">{song.album}</div>
                    <div className="col-span-2 text-right text-gray-400">{song.duration}</div>
                  </div>
                ))}
              </div>
            </NeoGlassCard>
          </div>
        </div>
        
        {/* Player bar */}
        <NeoGlassCard className="py-2 px-4 rounded-bl-none rounded-br-none border-t border-white/10">
          <div className="flex items-center justify-between">
            {/* Now playing */}
            <div className="flex items-center gap-3 w-1/4">
              <img 
                src={currentSong.image} 
                alt={currentSong.title} 
                className="w-14 h-14 rounded-md"
              />
              <div>
                <div className="font-medium text-sm">{currentSong.title}</div>
                <div className="text-xs text-gray-400">{currentSong.artist}</div>
              </div>
              <Heart size={16} className="text-blue-500 ml-2" />
            </div>
            
            {/* Player controls */}
            <div className="flex flex-col items-center w-2/4">
              <div className="flex items-center gap-3 mb-1">
                <Shuffle size={16} className="text-gray-400 hover:text-white cursor-pointer" />
                <SkipBack size={19} className="text-gray-400 hover:text-white cursor-pointer" onClick={handlePrevious} />
                <NeoGlassButton 
                  className="w-8 h-8 rounded-full p-0 bg-white text-black hover:bg-white/90" 
                  onClick={togglePlayPause}
                  isIcon
                >
                  {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                </NeoGlassButton>
                <SkipForward size={19} className="text-gray-400 hover:text-white cursor-pointer" onClick={handleNext} />
                <Repeat size={16} className="text-gray-400 hover:text-white cursor-pointer" />
              </div>
              
              <div className="flex items-center gap-2 w-full">
                <span className="text-xs text-gray-400">1:09</span>
                <NeoGlassProgress value={progress} className="flex-1" />
                <span className="text-xs text-gray-400">{currentSong.duration}</span>
              </div>
            </div>
            
            {/* Volume controls */}
            <div className="flex items-center gap-2 w-1/4 justify-end">
              <ListMusic size={16} className="text-gray-400 hover:text-white cursor-pointer" />
              <Volume2 size={16} className="text-gray-400 hover:text-white cursor-pointer" />
              <NeoGlassProgress value={volume} className="w-24" />
            </div>
          </div>
        </NeoGlassCard>
      </div>
      
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
          <NeoGlassButton 
            variant={backgroundStyle === 'black-room' ? 'primary' : undefined}
            onClick={() => setBackgroundStyle('black-room')}
            className="py-1 px-2 text-xs"
          >
            Black Room
          </NeoGlassButton>
        </NeoGlassCard>
      </div>
    </NeoPageContainer>
  );
}