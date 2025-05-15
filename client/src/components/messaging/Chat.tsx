import React, { useState, useEffect, useRef } from 'react';
import { useChat } from '@/contexts/ChatContext';
import ConversationList from './ConversationList';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { 
  ArrowLeft, 
  Users, 
  Search, 
  MessageSquare, 
  MessageCircleMore,
  UserRound,
  ChevronRight,
  Music2,
  Home,
  LibraryBig,
  Plus,
  X,
  ChevronLeft
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Chat: React.FC<{ userId: number }> = ({ userId }) => {
  const { currentConversation, setCurrentConversation, createConversation, markConversationAsRead } = useChat();
  const [isNewConversationModalOpen, setIsNewConversationModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom effect for new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [currentConversation?.messages]);
  
  // Mark conversation as read when it's opened
  useEffect(() => {
    if (currentConversation?.id && currentConversation.unreadCount && currentConversation.unreadCount > 0) {
      markConversationAsRead(currentConversation.id);
    }
  }, [currentConversation?.id, currentConversation?.unreadCount, markConversationAsRead]);

  // Fetch users for creating new conversations
  const { data: users = [], isLoading: loadingUsers } = useQuery({
    queryKey: ['/api/users'],
    enabled: isNewConversationModalOpen,
  });

  // Filter out current user and apply search
  const filteredUsers = Array.isArray(users) ? users.filter(
    (user) => 
      user.id !== userId && 
      (user.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
       user.username?.toLowerCase().includes(searchTerm.toLowerCase()))
  ) : [];

  const handleStartConversation = async (otherUserId: number) => {
    try {
      const newConversation = await createConversation(null, [otherUserId]);
      setCurrentConversation(newConversation);
      setIsNewConversationModalOpen(false);
      
      toast({
        title: "Connection established",
        description: "You can start messaging now",
      });
    } catch (error) {
      console.error('Error creating conversation:', error);
      toast({
        title: "Failed to create conversation",
        description: "Please try again later",
        variant: "destructive",
      });
    }
  };

  // Get details about the other user in the current conversation
  const otherUser = currentConversation?.participants?.find(p => p.userId !== userId);

  return (
    <>
      {/* Spotify-style layout with sidebar, main content, and right sidebar */}
      <div className="neo-spotify-sidebar">
        <div className="sidebar-top">
          <div className="user-profile">
            <div className="neo-spotify-avatar">
              <UserRound className="w-5 h-5 text-spotify-white" />
            </div>
            <div className="user-info">
              <div className="user-name">My Messages</div>
              <div className="user-type">Professional Network</div>
            </div>
          </div>
          
          <div className="sidebar-nav">
            <div className="sidebar-item active">
              <Home className="w-4 h-4 mr-2" />
              Messages
            </div>
            <div className="sidebar-actions">
              <button className="sidebar-action-btn">
                <Plus className="w-4 h-4" onClick={() => setIsNewConversationModalOpen(true)} />
              </button>
            </div>
          </div>
          
          <div className="sidebar-tabs">
            <div className="sidebar-tab active">Recent</div>
            <div className="sidebar-tab">Unread</div>
            <div className="sidebar-tab">All</div>
          </div>
        </div>
        
        <div className="sidebar-playlists">
          <ConversationList onNewConversation={() => setIsNewConversationModalOpen(true)} />
        </div>
      </div>
      
      <div className="neo-spotify-main">
        {currentConversation ? (
          <>
            {/* Message header */}
            <div className="neo-spotify-header">
              <div className="flex items-center">
                <div className="header-nav mr-4 md:hidden">
                  <button 
                    className="header-nav-btn"
                    onClick={() => setCurrentConversation(null)}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                </div>
                
                <div className="neo-spotify-avatar">
                  <AvatarImage 
                    src={otherUser?.photoURL || undefined} 
                    alt={otherUser?.userName || 'User'} 
                  />
                  <span className="avatar-placeholder">
                    {otherUser?.userName?.[0]?.toUpperCase() || 'U'}
                  </span>
                </div>
                
                <div className="ml-3">
                  <div className="font-semibold text-sm">
                    {otherUser?.userName || 'Conversation'}
                  </div>
                  {otherUser?.title && (
                    <div className="text-xs text-spotify-light-gray">
                      {otherUser.title}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center">
                <button className="sidebar-action-btn ml-3">
                  <Users className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            {/* Message content */}
            <div className="neo-spotify-content" ref={scrollRef}>
              <MessageList />
            </div>
            
            {/* Message input */}
            <div className="p-4 border-t border-spotify-glass-border backdrop-filter backdrop-blur-[15px] bg-spotify-glass-bg">
              <MessageInput />
            </div>
          </>
        ) : (
          <div className="neo-spotify-content flex items-center justify-center text-center">
            <div className="max-w-md">
              <div className="w-20 h-20 mx-auto rounded-full bg-spotify-glass-highlight flex items-center justify-center mb-6">
                <MessageSquare className="h-10 w-10 text-spotify-white" />
              </div>
              <h3 className="text-2xl font-bold mb-2 text-spotify-white">Connect & Collaborate</h3>
              <p className="text-spotify-light-gray mb-8 text-lg">
                Start meaningful conversations with professionals in your network
              </p>
              <button 
                onClick={() => setIsNewConversationModalOpen(true)}
                className="px-6 py-3 rounded-full bg-spotify-white text-spotify-black hover:scale-105 transition-transform font-medium"
              >
                Find professionals
                <ChevronRight className="ml-1 h-4 w-4 inline-block" />
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* New conversation modal with Spotify style */}
      <Dialog open={isNewConversationModalOpen} onOpenChange={setIsNewConversationModalOpen}>
        <DialogContent className="sm:max-w-md border-none bg-spotify-glass-bg backdrop-filter backdrop-blur-[15px] text-spotify-white">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl font-bold flex items-center text-spotify-white">
                <UserRound className="h-5 w-5 mr-2" />
                Connect with Professionals
              </DialogTitle>
              <button 
                className="w-8 h-8 rounded-full bg-spotify-glass-bg flex items-center justify-center"
                onClick={() => setIsNewConversationModalOpen(false)}
              >
                <X className="w-4 h-4 text-spotify-light-gray" />
              </button>
            </div>
          </DialogHeader>
          
          <div className="py-4">
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-spotify-light-gray" />
              <input
                placeholder="Find people by name or role..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-10 py-3 bg-spotify-gray/50 rounded-full text-spotify-white border-none focus:outline-none focus:ring-2 focus:ring-spotify-light-gray/30"
              />
            </div>
            
            <ScrollArea className="max-h-[400px] pr-4">
              {loadingUsers ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="p-4 bg-spotify-glass-highlight rounded-lg flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-spotify-gray animate-pulse" />
                      <div className="space-y-2 flex-1">
                        <div className="h-4 bg-spotify-gray animate-pulse rounded-full w-1/2" />
                        <div className="h-3 bg-spotify-gray animate-pulse rounded-full w-1/3" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredUsers.length > 0 ? (
                <div className="space-y-2">
                  {filteredUsers.map((user) => (
                    <div 
                      key={user.id} 
                      className="p-4 bg-spotify-glass-highlight hover:bg-spotify-glass-highlight/80 rounded-lg flex items-center gap-3 transition-all cursor-pointer group"
                      onClick={() => handleStartConversation(user.id)}
                    >
                      <div className="neo-spotify-avatar" style={{width: '48px', height: '48px'}}>
                        <AvatarImage src={user.photoURL || undefined} alt={user.name || 'User'} />
                        <span className="avatar-placeholder">
                          {(user.name?.[0] || user.username?.[0] || 'U').toUpperCase()}
                        </span>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold truncate flex items-center text-spotify-white">
                          {user.name || user.username}
                        </h4>
                        {user.title && (
                          <p className="text-sm text-spotify-light-gray truncate mt-0.5">
                            {user.title}
                          </p>
                        )}
                      </div>
                      
                      <button 
                        className="ml-2 px-4 py-2 rounded-full bg-spotify-green text-spotify-black text-xs font-medium opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <MessageSquare className="h-3 w-3 inline-block mr-1" />
                        Connect
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                  <div className="w-16 h-16 rounded-full bg-spotify-glass-highlight flex items-center justify-center mb-4">
                    <Users className="h-8 w-8 text-spotify-white/40" />
                  </div>
                  <p className="text-spotify-white font-medium mb-1">
                    {searchTerm ? 'No matching users found' : 'No other users available'}
                  </p>
                  <p className="text-sm text-spotify-light-gray">
                    {searchTerm ? 'Try a different search term' : 'Invite colleagues to join Brandentifier'}
                  </p>
                </div>
              )}
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Chat;