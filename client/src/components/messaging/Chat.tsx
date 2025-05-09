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
  ChevronRight
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Chat: React.FC<{ userId: number }> = ({ userId }) => {
  const { currentConversation, setCurrentConversation, createConversation } = useChat();
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
    <div className="h-full flex flex-col md:flex-row overflow-hidden bg-gradient-to-br from-background to-muted/30">
      {/* Mobile header if conversation is selected */}
      {currentConversation && (
        <div className="md:hidden p-4 border-b bg-background/80 backdrop-blur-sm flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentConversation(null)}
            className="mr-3 rounded-full hover:bg-primary/10"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          
          <Avatar className="h-9 w-9 mr-3 ring-2 ring-primary/20 ring-offset-2 ring-offset-background">
            <AvatarImage 
              src={otherUser?.photoURL || undefined} 
              alt={otherUser?.userName || 'User'} 
            />
            <AvatarFallback className="bg-primary/10 text-primary font-medium">
              {otherUser?.userName?.[0]?.toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          
          <div>
            <h2 className="font-semibold line-clamp-1">
              {otherUser?.userName || 'Conversation'}
            </h2>
            {otherUser?.title && (
              <p className="text-xs text-muted-foreground line-clamp-1">
                {otherUser.title}
              </p>
            )}
          </div>
        </div>
      )}
      
      {/* Side panel with conversations */}
      <div className={`${
        currentConversation ? 'hidden md:block' : ''
      } border-r md:w-96 h-full bg-background/70 backdrop-blur-sm`}>
        <div className="p-4 border-b flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-lg flex items-center">
              <MessageCircleMore className="h-5 w-5 mr-2 text-primary" />
              Messages
            </h2>
            <Button
              onClick={() => setIsNewConversationModalOpen(true)}
              variant="outline" 
              size="sm"
              className="gap-1 border-primary/30 text-primary hover:bg-primary/10 hover:text-primary"
            >
              <UserRound className="h-3.5 w-3.5" />
              <span>New</span>
            </Button>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              className="pl-9 bg-muted/50"
            />
          </div>
        </div>
        
        <Tabs defaultValue="all" className="w-full">
          <div className="px-4 pt-2">
            <TabsList className="w-full grid grid-cols-2">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="unread">Unread</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="all" className="mt-0">
            <ScrollArea className="h-[calc(100vh-170px)]">
              <ConversationList onNewConversation={() => setIsNewConversationModalOpen(true)} />
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="unread" className="mt-0">
            <ScrollArea className="h-[calc(100vh-170px)]">
              <div className="py-8 px-4 text-center">
                <MessageSquare className="h-10 w-10 mx-auto text-muted-foreground mb-3 opacity-70" />
                <p className="text-muted-foreground">No unread messages</p>
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Message area */}
      <div className={`${
        !currentConversation ? 'hidden md:flex' : 'flex'
      } flex-col flex-1 h-full`}>
        {currentConversation ? (
          <>
            {/* Desktop header */}
            <div className="hidden md:flex p-4 border-b bg-background/80 backdrop-blur-sm items-center">
              <Avatar className="h-10 w-10 mr-3 ring-2 ring-primary/20 ring-offset-2 ring-offset-background">
                <AvatarImage 
                  src={otherUser?.photoURL || undefined} 
                  alt={otherUser?.userName || 'User'} 
                />
                <AvatarFallback className="bg-primary/10 text-primary font-medium">
                  {otherUser?.userName?.[0]?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="flex items-center">
                  <h2 className="font-semibold">
                    {otherUser?.userName || 'Conversation'}
                  </h2>
                  <Badge 
                    variant="outline" 
                    className="ml-2 text-xs px-1.5 border-primary/30 text-primary bg-primary/5"
                  >
                    Connected
                  </Badge>
                </div>
                {otherUser?.title && (
                  <p className="text-sm text-muted-foreground">
                    {otherUser.title}
                  </p>
                )}
              </div>
              
              <div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-muted-foreground hover:text-foreground"
                >
                  View Profile
                </Button>
              </div>
            </div>
            
            {/* Messages area with custom styling */}
            <ScrollArea 
              className="flex-1 p-4 bg-gradient-to-b from-background/50 to-muted/20"
              ref={scrollRef}
            >
              <MessageList />
            </ScrollArea>
            
            {/* Input area */}
            <div className="p-4 border-t bg-background/80 backdrop-blur-sm">
              <MessageInput />
            </div>
          </>
        ) : (
          <div className="h-full flex items-center justify-center p-6 text-center">
            <div className="max-w-md">
              <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-6">
                <MessageSquare className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">Connect & Collaborate</h3>
              <p className="text-muted-foreground mb-8 text-lg">
                Start meaningful conversations with professionals in your network
              </p>
              <Button 
                onClick={() => setIsNewConversationModalOpen(true)}
                size="lg"
                className="px-6 font-medium rounded-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all duration-300"
              >
                Find professionals
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
      
      {/* New conversation modal with enhanced design */}
      <Dialog open={isNewConversationModalOpen} onOpenChange={setIsNewConversationModalOpen}>
        <DialogContent className="sm:max-w-md border border-primary/20">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center">
              <UserRound className="h-5 w-5 mr-2 text-primary" />
              Connect with Professionals
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Find people by name or role..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-muted/30 border-primary/20 focus-visible:ring-primary/30"
              />
            </div>
            
            <ScrollArea className="max-h-[400px] pr-4">
              {loadingUsers ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Card key={i} className="bg-muted/20 border-primary/10 overflow-hidden">
                      <CardContent className="p-4 flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-full bg-primary/5 animate-pulse" />
                        <div className="space-y-2 flex-1">
                          <div className="h-4 bg-primary/5 animate-pulse rounded-full w-1/2" />
                          <div className="h-3 bg-primary/5 animate-pulse rounded-full w-1/3" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : filteredUsers.length > 0 ? (
                <div className="space-y-2">
                  {filteredUsers.map((user) => (
                    <Card 
                      key={user.id} 
                      className="overflow-hidden border border-primary/10 hover:border-primary/30 transition-all duration-300 group"
                    >
                      <CardContent 
                        className="p-4 flex items-center cursor-pointer" 
                        onClick={() => handleStartConversation(user.id)}
                      >
                        <Avatar className="h-12 w-12 ring-2 ring-primary/10 group-hover:ring-primary/30 transition-all duration-300 mr-4">
                          <AvatarImage src={user.photoURL || undefined} alt={user.name || 'User'} />
                          <AvatarFallback className="bg-primary/10 text-primary font-medium">
                            {(user.name?.[0] || user.username?.[0] || 'U').toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold truncate flex items-center">
                            {user.name || user.username}
                          </h4>
                          {user.title && (
                            <p className="text-sm text-muted-foreground truncate mt-0.5">
                              {user.title}
                            </p>
                          )}
                        </div>
                        
                        <Button 
                          size="sm" 
                          className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-primary/10 hover:bg-primary/20 text-primary border-0"
                        >
                          <MessageSquare className="h-4 w-4 mr-1" />
                          Connect
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                  <div className="w-16 h-16 rounded-full bg-primary/5 flex items-center justify-center mb-4">
                    <Users className="h-8 w-8 text-primary/40" />
                  </div>
                  <p className="text-muted-foreground font-medium mb-1">
                    {searchTerm ? 'No matching users found' : 'No other users available'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {searchTerm ? 'Try a different search term' : 'Invite colleagues to join Brandentifier'}
                  </p>
                </div>
              )}
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Chat;