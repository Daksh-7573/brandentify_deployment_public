import React, { useState } from 'react';
import { SpatialLayout, FloatingWindow, ControlPanel } from '@/components/spatial/SpatialLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Play, Pause, Home, Settings, Plus, X } from 'lucide-react';

// Mock data for demonstration
const mockPulses = [
  {
    id: 1,
    author: 'Alex Johnson',
    authorAvatar: 'AJ',
    title: 'Product Manager Role Analysis',
    content: 'Just published an analysis on emerging skills in Product Management for 2025. Key insights show that AI literacy and data interpretation are becoming must-haves.',
    category: 'Career Insights',
    timestamp: '2 hours ago',
    likes: 24,
    comments: 8
  },
  {
    id: 2,
    author: 'Sarah Chen',
    authorAvatar: 'SC',
    title: 'User Research Methodologies',
    content: 'Breaking down how to conduct effective user interviews that reveal actionable insights rather than just confirming your existing assumptions.',
    category: 'Skill Development',
    timestamp: '4 hours ago',
    likes: 18,
    comments: 12
  },
  {
    id: 3,
    author: 'Marcus Lee',
    authorAvatar: 'ML',
    title: 'Healthcare Tech Opportunities',
    content: 'The healthcare technology sector is seeing massive growth. Here are the top 5 roles that will be in high demand over the next 3 years.',
    category: 'Industry Trends',
    timestamp: 'Yesterday',
    likes: 42,
    comments: 15
  }
];

const SpatialTestPage: React.FC = () => {
  const [windows, setWindows] = useState(mockPulses.map(pulse => ({ id: pulse.id, visible: true })));
  const [isPlaying, setIsPlaying] = useState(false);
  
  const toggleWindow = (id: number) => {
    setWindows(prev => 
      prev.map(win => 
        win.id === id ? { ...win, visible: !win.visible } : win
      )
    );
  };

  const addWindow = () => {
    const newId = Math.max(...windows.map(w => w.id), 0) + 1;
    setWindows([...windows, { id: newId, visible: true }]);
  };

  return (
    <SpatialLayout>
      {/* Main Content Window */}
      <FloatingWindow 
        title="Industry Pulse Feed" 
        width="800px"
        initialPosition={{ x: 0, y: 0, z: 0 }}
        initialScale={1}
      >
        <div className="bg-white/5 p-4 rounded-lg">
          <h2 className="text-2xl font-bold text-white mb-4">Latest Industry Pulses</h2>
          <div className="space-y-4">
            {mockPulses.map(pulse => (
              <Card key={pulse.id} className="bg-white/10 border-white/20">
                <CardHeader className="pb-2">
                  <div className="flex justify-between">
                    <div className="flex items-center gap-2">
                      <Avatar>
                        <AvatarImage src="" />
                        <AvatarFallback>{pulse.authorAvatar}</AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-white text-lg">{pulse.title}</CardTitle>
                        <CardDescription className="text-gray-300">
                          by {pulse.author} • {pulse.timestamp}
                        </CardDescription>
                      </div>
                    </div>
                    <span className="text-xs font-medium bg-purple-500/20 text-purple-300 px-2 py-1 rounded-full">
                      {pulse.category}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-100">{pulse.content}</p>
                </CardContent>
                <CardFooter className="text-gray-300 text-sm flex justify-between pt-2">
                  <span>{pulse.likes} likes</span>
                  <span>{pulse.comments} comments</span>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </FloatingWindow>

      {/* Now Playing Panel */}
      <FloatingWindow 
        title="Now Playing" 
        width="300px"
        initialPosition={{ x: 400, y: -150, z: -10 }}
        initialScale={0.9}
        onClose={() => toggleWindow(4)}
      >
        <div className="text-white">
          <div className="mb-4">
            <div className="w-full h-40 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-lg flex items-center justify-center">
              <span className="text-4xl">🎵</span>
            </div>
          </div>
          <h3 className="font-medium">Career Growth Podcast</h3>
          <p className="text-sm text-gray-300">Episode 42: Skills of Tomorrow</p>
          <div className="mt-4 flex justify-center items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full bg-white/10 hover:bg-white/20"
              onClick={() => setIsPlaying(!isPlaying)}
            >
              {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </FloatingWindow>

      {/* Mini Player */}
      <FloatingWindow 
        title="Mini Player" 
        width="250px"
        initialPosition={{ x: -350, y: 200, z: -20 }}
        initialScale={0.8}
        onClose={() => toggleWindow(5)}
      >
        <div className="text-white">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded flex items-center justify-center">
              <span>🎵</span>
            </div>
            <div>
              <p className="font-medium">Skills of Tomorrow</p>
              <p className="text-xs text-gray-300">Career Growth Podcast</p>
            </div>
          </div>
          <div className="mt-3">
            <div className="h-1 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 w-1/3" />
            </div>
            <div className="flex justify-between text-xs mt-1 text-gray-400">
              <span>10:42</span>
              <span>32:18</span>
            </div>
          </div>
        </div>
      </FloatingWindow>

      {/* Control Panel */}
      <ControlPanel>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="rounded-full bg-white/10 hover:bg-white/20">
            <Home className="h-5 w-5 text-white" />
          </Button>
          <Button 
            size="icon" 
            className="rounded-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
            onClick={addWindow}
          >
            <Plus className="h-5 w-5 text-white" />
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full bg-white/10 hover:bg-white/20">
            <Settings className="h-5 w-5 text-white" />
          </Button>
        </div>
      </ControlPanel>
    </SpatialLayout>
  );
};

export default SpatialTestPage;