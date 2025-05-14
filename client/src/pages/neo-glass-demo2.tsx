import React, { useState } from 'react';
import { 
  NeoPageContainer, 
  NeoGlassCard, 
  NeoGlassButton, 
  NeoGlassAvatar,
  NeoGlassInput 
} from '@/components/ui/neo-glass';
import { 
  Home, 
  User, 
  Star, 
  List, 
  Settings, 
  Search, 
  Music, 
  PlusCircle, 
  ChevronDown, 
  PlayCircle, 
  PauseCircle, 
  SkipBack, 
  SkipForward, 
  MessageSquare, 
  LayoutList, 
  Volume2
} from 'lucide-react';

// Album type for our data
interface Album {
  id: number;
  title: string;
  artist: string;
  cover: string;
  category: string;
}

export default function NeoGlassDemo2Page() {
  const [backgroundStyle, setBackgroundStyle] = useState<'gradient' | 'white-room' | 'mixed' | 'guitar' | 'black-room'>('black-room');
  const [currentCategory, setCurrentCategory] = useState('All Content');
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Sample albums data
  const albums: Album[] = [
    { 
      id: 1, 
      title: 'Career Growth', 
      artist: 'Professional Development', 
      cover: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=300&h=300', 
      category: 'Growth'
    },
    { 
      id: 2, 
      title: 'Top Skills', 
      artist: 'Skill Building', 
      cover: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=300&h=300', 
      category: 'Skills'
    },
    { 
      id: 3, 
      title: 'Resume Builder', 
      artist: 'Career Tools', 
      cover: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=300&h=300', 
      category: 'Tools'
    },
    { 
      id: 4, 
      title: 'Networking', 
      artist: 'Professional Connections', 
      cover: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&w=300&h=300', 
      category: 'Network'
    },
    { 
      id: 5, 
      title: 'Trends & Analysis', 
      artist: 'Industry Insights', 
      cover: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=300&h=300', 
      category: 'Insights'
    },
    { 
      id: 6, 
      title: 'Project Showcase', 
      artist: 'Portfolio Building', 
      cover: 'https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&w=300&h=300', 
      category: 'Projects'
    },
    { 
      id: 7, 
      title: 'Job Matching', 
      artist: 'Career Opportunities', 
      cover: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=300&h=300', 
      category: 'Jobs'
    },
    { 
      id: 8, 
      title: 'Mentorship', 
      artist: 'Professional Guidance', 
      cover: 'https://images.unsplash.com/photo-1542626991-cbc4e32524cc?auto=format&fit=crop&w=300&h=300', 
      category: 'Mentors'
    }
  ];
  
  // Categories
  const categories = ['All Content', 'Growth', 'Skills', 'Tools', 'Network', 'Insights', 'Projects', 'Jobs', 'Mentors'];
  
  // Current playing item
  const currentPlaying = {
    title: 'Resume Builder',
    artist: 'Career Tools'
  };
  
  return (
    <NeoPageContainer background={backgroundStyle} className="p-0 min-h-screen relative overflow-hidden">
      <div className="container mx-auto flex justify-between relative z-10">
        {/* Left sidebar */}
        <div className="w-16 pt-6 flex flex-col items-center">
          <NeoGlassCard className="p-2 rounded-full mb-6">
            <div className="w-8 h-8 flex items-center justify-center">
              <Home className="w-5 h-5 text-white opacity-70" />
            </div>
          </NeoGlassCard>
          
          <div className="flex flex-col gap-6 items-center">
            <NeoGlassCard className="p-2 rounded-full">
              <div className="w-8 h-8 flex items-center justify-center">
                <User className="w-5 h-5 text-white opacity-70" />
              </div>
            </NeoGlassCard>
            
            <NeoGlassCard className="p-2 rounded-full">
              <div className="w-8 h-8 flex items-center justify-center">
                <Star className="w-5 h-5 text-white opacity-70" />
              </div>
            </NeoGlassCard>
            
            <NeoGlassCard className="p-2 rounded-full">
              <div className="w-8 h-8 flex items-center justify-center">
                <List className="w-5 h-5 text-white opacity-70" />
              </div>
            </NeoGlassCard>
            
            <NeoGlassCard className="p-2 rounded-full">
              <div className="w-8 h-8 flex items-center justify-center">
                <Settings className="w-5 h-5 text-white opacity-70" />
              </div>
            </NeoGlassCard>
          </div>
        </div>
        
        {/* Main content area */}
        <div className="flex-1 mx-2">
          <NeoGlassCard className="mt-6 p-6 pt-4 rounded-2xl overflow-hidden" glow="primary">
            <div className="flex justify-between mb-4">
              <div>
                <h2 className="text-2xl font-medium neo-glass-text mb-1">{currentCategory}</h2>
                <p className="neo-glass-text-muted text-sm">253 Items</p>
              </div>
              <div>
                <NeoGlassButton variant="primary" className="opacity-70">
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Add New
                </NeoGlassButton>
              </div>
            </div>
            
            {/* Search */}
            <div className="mb-6">
              <NeoGlassInput
                placeholder="Search in Content"
                icon={<Search className="w-4 h-4" />}
              />
            </div>
            
            {/* Content grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {albums.map(album => (
                <NeoGlassCard key={album.id} className="overflow-hidden relative group shadow-lg" glow="primary">
                  <div className="aspect-square relative overflow-hidden">
                    <img 
                      src={album.cover} 
                      alt={album.title} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-3">
                      <div>
                        <h3 className="text-white font-semibold">{album.title}</h3>
                        <p className="text-white/70 text-sm">{album.artist}</p>
                      </div>
                    </div>
                    
                    {/* Play overlay */}
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
                      <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 neo-glass-float">
                        <NeoGlassButton variant="primary" isIcon className="shadow-xl">
                          <PlayCircle className="w-12 h-12" />
                        </NeoGlassButton>
                      </div>
                    </div>
                  </div>
                </NeoGlassCard>
              ))}
            </div>
          </NeoGlassCard>
        </div>
        
        {/* Right sidebar */}
        <div className="w-64 pt-6 pl-2 pr-4">
          <NeoGlassCard className="p-4 rounded-2xl mb-4" glow="secondary">
            <div className="flex items-center justify-between mb-3">
              <h3 className="neo-glass-text font-medium text-lg">Categories</h3>
              <ChevronDown className="w-4 h-4 text-white/70 cursor-pointer hover:text-white transition-colors" />
            </div>
            
            <div className="space-y-2">
              {categories.map(category => (
                <div 
                  key={category}
                  onClick={() => setCurrentCategory(category)}
                  className={`px-3 py-2 rounded-lg cursor-pointer transition-all duration-300 ${
                    currentCategory === category 
                      ? 'bg-white/20 neo-glass-text font-medium shadow-md translate-x-1' 
                      : 'neo-glass-text-muted hover:bg-white/10 hover:translate-x-1'
                  }`}
                >
                  {category}
                </div>
              ))}
            </div>
          </NeoGlassCard>
          
          <NeoGlassCard className="p-4 rounded-2xl" glow="tertiary">
            <div className="flex items-center justify-between mb-3">
              <h3 className="neo-glass-text font-medium text-lg">Recent Activity</h3>
              <ChevronDown className="w-4 h-4 text-white/70 cursor-pointer hover:text-white transition-colors" />
            </div>
            
            <div className="space-y-3">
              {albums.slice(0, 4).map(album => (
                <div 
                  key={album.id} 
                  className="flex gap-3 items-center p-2 rounded-lg hover:bg-white/10 transition-all duration-300 cursor-pointer hover:translate-x-1"
                >
                  <div className="w-10 h-10 rounded-md overflow-hidden flex-shrink-0 shadow-md">
                    <img src={album.cover} alt={album.title} className="w-full h-full object-cover transition-transform duration-300 hover:scale-110" />
                  </div>
                  <div className="flex-1">
                    <h4 className="neo-glass-text text-sm font-medium truncate">{album.title}</h4>
                    <p className="neo-glass-text-muted text-xs truncate">{album.artist}</p>
                  </div>
                </div>
              ))}
            </div>
          </NeoGlassCard>
        </div>
      </div>
      
      {/* Bottom player bar */}
      <div className="fixed bottom-0 left-0 right-0 z-20">
        <NeoGlassCard className="mx-auto max-w-6xl m-4 rounded-full p-3 flex items-center justify-between" glow="primary">
          <div className="flex items-center gap-3 pl-3">
            <div className="w-12 h-12 rounded-md overflow-hidden shadow-lg">
              <img 
                src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=300&h=300" 
                alt={currentPlaying.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h4 className="neo-glass-text text-sm font-medium">{currentPlaying.title}</h4>
              <p className="neo-glass-text-muted text-xs">{currentPlaying.artist}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <SkipBack className="w-6 h-6 text-white/70 cursor-pointer hover:text-white transition-colors transform hover:scale-110" />
            <div className="relative neo-glass-float">
              {isPlaying ? (
                <PauseCircle 
                  className="w-10 h-10 text-white cursor-pointer hover:text-white/90 transition-colors transform hover:scale-110" 
                  onClick={() => setIsPlaying(false)}
                />
              ) : (
                <PlayCircle 
                  className="w-10 h-10 text-white cursor-pointer hover:text-white/90 transition-colors transform hover:scale-110" 
                  onClick={() => setIsPlaying(true)}
                />
              )}
            </div>
            <SkipForward className="w-6 h-6 text-white/70 cursor-pointer hover:text-white transition-colors transform hover:scale-110" />
          </div>
          
          <div className="flex items-center gap-3 pr-4">
            <MessageSquare className="w-5 h-5 text-white/60 cursor-pointer hover:text-white/80 transition-colors transform hover:scale-110" />
            <LayoutList className="w-5 h-5 text-white/60 cursor-pointer hover:text-white/80 transition-colors transform hover:scale-110" />
            <Volume2 className="w-5 h-5 text-white/60 cursor-pointer hover:text-white/80 transition-colors transform hover:scale-110" />
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