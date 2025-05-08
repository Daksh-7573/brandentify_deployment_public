import React, { useState } from 'react';
import { SpatialPortalLayout, SpatialWindow } from '@/components/spatial/SpatialPortalLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { useQuery } from '@tanstack/react-query';
import { Plus, Heart, MessageSquare, Share, Bookmark, Play, Pause } from 'lucide-react';
import { useCurrentUser } from '@/hooks/use-current-user';

// Mock data - this would be fetched from the API
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

// Mock suggested connections
const mockConnections = [
  {
    id: 1,
    name: 'Emily Rodriguez',
    title: 'UX Designer at Google',
    avatar: 'ER',
    mutualConnections: 8
  },
  {
    id: 2,
    name: 'David Kim',
    title: 'Product Manager at Microsoft',
    avatar: 'DK',
    mutualConnections: 5
  },
  {
    id: 3,
    name: 'Sophia Patel',
    title: 'Frontend Developer at Meta',
    avatar: 'SP',
    mutualConnections: 3
  }
];

// Trending topics mock data
const trendingTopics = [
  {
    id: 1,
    name: 'AI Ethics',
    count: 1243
  },
  {
    id: 2,
    name: 'Remote Work',
    count: 956
  },
  {
    id: 3,
    name: 'Career Switching',
    count: 782
  },
  {
    id: 4,
    name: 'Web3',
    count: 651
  },
  {
    id: 5,
    name: 'Productivity',
    count: 542
  }
];

// Podcast episode mock data
const podcastEpisode = {
  title: 'Career Transitions in Tech',
  host: 'Tech Career Insights',
  duration: '32:18',
  progress: '10:42',
  image: '🎵'
};

const SpatialIndustryPulsePage: React.FC = () => {
  const { user } = useCurrentUser();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isConnectionsOpen, setConnectionsOpen] = useState(true);
  const [isTrendingOpen, setTrendingOpen] = useState(true);
  const [isNowPlayingOpen, setNowPlayingOpen] = useState(true);
  
  // In a real app, we'd fetch the pulses from the API
  const { data: pulses = mockPulses } = useQuery({
    queryKey: ['/api/pulses'],
    enabled: false, // Disable actual API call for the demo
  });

  return (
    <SpatialPortalLayout title="Industry Pulse">
      {/* Industry Feed - Main Content */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Industry Pulse</h1>
          <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
            <Plus className="h-4 w-4 mr-2" /> New Pulse
          </Button>
        </div>
        
        <div className="relative">
          <Input 
            placeholder="Search pulses..." 
            className="bg-white/5 border-white/10 text-white placeholder:text-gray-400"
          />
        </div>
        
        <div className="space-y-4">
          {pulses.map(pulse => (
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
                <div className="flex gap-4">
                  <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white hover:bg-white/10 p-1 h-auto">
                    <Heart className="h-4 w-4 mr-1" />
                    {pulse.likes}
                  </Button>
                  <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white hover:bg-white/10 p-1 h-auto">
                    <MessageSquare className="h-4 w-4 mr-1" />
                    {pulse.comments}
                  </Button>
                  <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white hover:bg-white/10 p-1 h-auto">
                    <Share className="h-4 w-4 mr-1" />
                    Share
                  </Button>
                </div>
                <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white hover:bg-white/10 p-1 h-auto">
                  <Bookmark className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
      
      {/* Connections Panel */}
      <SpatialWindow
        title="Suggested Connections"
        isOpen={isConnectionsOpen}
        initialPosition={{ x: 450, y: -100, z: -10 }}
        width="300px"
        scale={0.9}
        onClose={() => setConnectionsOpen(false)}
      >
        <div className="space-y-4">
          {mockConnections.map(connection => (
            <div key={connection.id} className="flex items-center gap-3 p-2 bg-white/5 rounded-lg">
              <Avatar>
                <AvatarImage src="" />
                <AvatarFallback>{connection.avatar}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h4 className="text-white text-sm font-medium truncate">{connection.name}</h4>
                <p className="text-gray-400 text-xs truncate">{connection.title}</p>
                <p className="text-gray-500 text-xs">{connection.mutualConnections} mutual connections</p>
              </div>
              <Button size="sm" variant="outline" className="border-white/20 text-white hover:bg-white/10">
                Connect
              </Button>
            </div>
          ))}
          <Button variant="ghost" className="w-full text-center text-blue-400 hover:text-blue-300 hover:bg-white/5">
            View All
          </Button>
        </div>
      </SpatialWindow>
      
      {/* Trending Topics Panel */}
      <SpatialWindow
        title="Trending Topics"
        isOpen={isTrendingOpen}
        initialPosition={{ x: -450, y: 50, z: -15 }}
        width="250px"
        scale={0.85}
        onClose={() => setTrendingOpen(false)}
      >
        <div className="space-y-3">
          {trendingTopics.map(topic => (
            <div key={topic.id} className="flex justify-between items-center p-2 hover:bg-white/5 rounded transition-colors">
              <span className="text-white">#{topic.name}</span>
              <span className="text-gray-400 text-sm">{topic.count}</span>
            </div>
          ))}
        </div>
      </SpatialWindow>
      
      {/* Now Playing Panel */}
      <SpatialWindow
        title="Now Playing"
        isOpen={isNowPlayingOpen}
        initialPosition={{ x: 0, y: -300, z: -5 }}
        width="300px"
        scale={0.8}
        onClose={() => setNowPlayingOpen(false)}
      >
        <div className="text-white">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded flex items-center justify-center">
              <span>{podcastEpisode.image}</span>
            </div>
            <div>
              <p className="font-medium">{podcastEpisode.title}</p>
              <p className="text-xs text-gray-300">{podcastEpisode.host}</p>
            </div>
          </div>
          <div className="mt-3">
            <div className="h-1 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 w-1/3" />
            </div>
            <div className="flex justify-between text-xs mt-1 text-gray-400">
              <span>{podcastEpisode.progress}</span>
              <span>{podcastEpisode.duration}</span>
            </div>
            <div className="mt-3 flex justify-center">
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
        </div>
      </SpatialWindow>
    </SpatialPortalLayout>
  );
};

export default SpatialIndustryPulsePage;