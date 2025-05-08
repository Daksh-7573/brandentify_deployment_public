import React, { useState } from 'react';
import SpatialPortalLayout from '@/components/spatial/SpatialPortalLayout';
import { SpatialActionButton, SpatialIconButton, GlassCard } from '@/components/spatial/SpatialLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';
import { Home, User, Settings, Play, Pause, Heart, MessageCircle, MoreHorizontal } from 'lucide-react';
import { useLocation } from 'wouter';

export default function SpatialDemoPage() {
  const [, setLocation] = useLocation();
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(45);
  const [activeCategory, setActiveCategory] = useState('Mindfulness');
  
  // Sample data
  const meditations = [
    { id: 1, title: 'Deep Focus', duration: '15 min', category: 'Focus', progress: 65 },
    { id: 2, title: 'Morning Calm', duration: '10 min', category: 'Mindfulness', progress: 100 },
    { id: 3, title: 'Stress Relief', duration: '20 min', category: 'Stress', progress: 30 },
    { id: 4, title: 'Creative Flow', duration: '15 min', category: 'Creativity', progress: 0 },
  ];
  
  const categories = ['Mindfulness', 'Focus', 'Stress', 'Creativity', 'Sleep'];
  
  // Filtered meditations based on selected category
  const filteredMeditations = meditations.filter(
    m => activeCategory === 'All' || m.category === activeCategory
  );

  // Main content for the centered window
  const mainContent = (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Meditation Dashboard</h1>
        <div className="flex space-x-2">
          <SpatialIconButton 
            icon={<Home size={20} />} 
            label="Home" 
            onClick={() => navigate('/')}
          />
          <SpatialIconButton 
            icon={<User size={20} />} 
            label="Profile" 
          />
          <SpatialIconButton 
            icon={<Settings size={20} />} 
            label="Settings" 
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredMeditations.map((meditation) => (
          <GlassCard key={meditation.id} className="group hover:shadow-xl transition-all duration-300">
            <div className="flex flex-col h-full">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-lg font-semibold">{meditation.title}</h3>
                  <p className="text-sm text-muted-foreground">{meditation.duration}</p>
                </div>
                <div className="bg-primary/10 px-3 py-1 rounded-full text-xs font-medium text-primary">
                  {meditation.category}
                </div>
              </div>
              
              <div className="mt-auto">
                <div className="flex justify-between text-xs mb-1">
                  <span>Progress</span>
                  <span>{meditation.progress}%</span>
                </div>
                <Progress value={meditation.progress} className="h-2" />
                
                <div className="mt-4 flex justify-between items-center">
                  <Button variant="outline" size="sm" className="rounded-full">
                    <Heart size={16} className="mr-1" /> Save
                  </Button>
                  
                  <SpatialActionButton 
                    variant="primary" 
                    className="!py-1 !px-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  >
                    {meditation.progress === 0 ? 'Start' : 'Continue'}
                  </SpatialActionButton>
                </div>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );

  // Left sidebar content
  const leftSidebar = (
    <div className="space-y-4">
      <div className="px-2 mb-4">
        <h2 className="text-xl font-semibold mb-4">Categories</h2>
        <div className="space-y-2">
          {categories.map((category) => (
            <button
              key={category}
              className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                activeCategory === category
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'hover:bg-accent'
              }`}
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </div>
      
      <div className="px-2">
        <h2 className="text-xl font-semibold mb-4">Recent</h2>
        <div className="space-y-2">
          {meditations.slice(0, 3).map((meditation) => (
            <div
              key={meditation.id}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-accent"
            >
              <div className="w-2 h-2 rounded-full bg-primary/60"></div>
              <span>{meditation.title}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Right sidebar content
  const rightSidebar = (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold mb-4">Now Playing</h2>
      
      <motion.div
        className="relative w-full aspect-video rounded-xl bg-gradient-to-br from-indigo-500/60 via-purple-500/60 to-pink-500/60 overflow-hidden"
        whileHover={{ scale: 1.02 }}
      >
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
          <div className="text-center">
            <h3 className="text-lg font-medium mb-1">Morning Calm</h3>
            <p className="text-sm opacity-90">10 min • Mindfulness</p>
          </div>
          
          <div className="mt-6 flex items-center space-x-4">
            <motion.button
              className="rounded-full p-3 bg-white/30 hover:bg-white/40"
              whileTap={{ scale: 0.95 }}
              onClick={() => setPlaying(!playing)}
            >
              {playing ? (
                <Pause size={20} className="text-white" />
              ) : (
                <Play size={20} className="text-white" />
              )}
            </motion.button>
          </div>
        </div>
      </motion.div>
      
      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span>4:30</span>
          <span>10:00</span>
        </div>
        <Progress value={progress} className="h-1" />
      </div>
      
      <div className="mt-6">
        <h3 className="text-lg font-medium mb-3">Community Feedback</h3>
        <div className="space-y-4">
          <div className="bg-background/50 p-3 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500"></div>
              <div>
                <p className="text-sm font-medium">Alex K.</p>
                <p className="text-xs text-muted-foreground">2 days ago</p>
              </div>
            </div>
            <p className="text-sm">This meditation helped me focus during a stressful day. Highly recommended!</p>
            <div className="flex items-center justify-end mt-2 space-x-2">
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full">
                <Heart size={14} />
              </Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full">
                <MessageCircle size={14} />
              </Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full">
                <MoreHorizontal size={14} />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Media controls for bottom bar
  const bottomBar = (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center space-x-2">
        <div className="w-10 h-10 rounded-md bg-primary/20"></div>
        <div>
          <p className="text-sm font-medium">Morning Calm</p>
          <p className="text-xs text-muted-foreground">10 min • Mindfulness</p>
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full">
          <Play size={16} />
        </Button>
        <Progress value={45} className="w-24 h-1" />
      </div>
      
      <Button variant="outline" size="sm" className="rounded-full">
        View All
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background/95 to-background/90">
      <SpatialPortalLayout
        mainContent={mainContent}
        leftSidebar={leftSidebar}
        rightSidebar={rightSidebar}
        bottomBar={bottomBar}
      />
    </div>
  );
}