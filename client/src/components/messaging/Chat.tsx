import React, { useState } from 'react';
import { useChat } from '@/contexts/ChatContext';
import ConversationList from './ConversationList';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Users } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const Chat: React.FC<{ userId: number }> = ({ userId }) => {
  const { currentConversation, setCurrentConversation } = useChat();
  const [isNewConversationModalOpen, setIsNewConversationModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  // Fetch users for creating new conversations
  const { data: users = [], isLoading: loadingUsers } = useQuery({
    queryKey: ['/api/users'],
    enabled: isNewConversationModalOpen,
  });

  // Filter out current user and apply search
  const filteredUsers = users.filter(
    (user) => 
      user.id !== userId && 
      (user.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
       user.username?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleStartConversation = async (otherUserId: number) => {
    try {
      const { createConversation } = useChat();
      const newConversation = await createConversation(null, [otherUserId]);
      setCurrentConversation(newConversation);
      setIsNewConversationModalOpen(false);
      
      toast({
        title: "Conversation created",
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

  return (
    <div className="h-full flex flex-col md:flex-row">
      {/* Mobile header if conversation is selected */}
      {currentConversation && (
        <div className="md:hidden p-4 border-b flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentConversation(null)}
            className="mr-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="font-semibold">
              {currentConversation.title || 
               currentConversation.participants?.find(p => p.userId !== userId)?.userName || 
               'Conversation'}
            </h2>
          </div>
        </div>
      )}
      
      {/* Conversation list (hidden on mobile when conversation is selected) */}
      <div className={`${
        currentConversation ? 'hidden md:block' : ''
      } border-r md:w-80 h-full`}>
        <ConversationList onNewConversation={() => setIsNewConversationModalOpen(true)} />
      </div>
      
      {/* Message area (shown always on desktop, conditionally on mobile) */}
      <div className={`${
        !currentConversation ? 'hidden md:flex' : 'flex'
      } flex-col flex-1 h-full`}>
        {currentConversation ? (
          <>
            <MessageList />
            <MessageInput />
          </>
        ) : (
          <div className="h-full flex items-center justify-center p-4 text-center">
            <div>
              <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-medium mb-2">Select a conversation</h3>
              <p className="text-muted-foreground mb-6">
                Choose an existing conversation or start a new one
              </p>
              <Button onClick={() => setIsNewConversationModalOpen(true)}>
                Start new conversation
              </Button>
            </div>
          </div>
        )}
      </div>
      
      {/* New conversation modal */}
      <Dialog open={isNewConversationModalOpen} onOpenChange={setIsNewConversationModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>New Conversation</DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="mb-4"
            />
            
            <div className="max-h-[400px] overflow-y-auto space-y-2">
              {loadingUsers ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <Card key={i} className="bg-muted/30">
                      <CardContent className="p-4 flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-muted animate-pulse" />
                        <div className="space-y-2 flex-1">
                          <div className="h-4 bg-muted animate-pulse rounded w-1/2" />
                          <div className="h-3 bg-muted animate-pulse rounded w-1/3" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <Card key={user.id} className="hover:bg-accent/50 transition-colors">
                    <CardContent className="p-4 flex items-center cursor-pointer" 
                      onClick={() => handleStartConversation(user.id)}>
                      <div className="w-10 h-10 rounded-full overflow-hidden mr-3">
                        {user.photoURL ? (
                          <img 
                            src={user.photoURL} 
                            alt={user.name || 'User'} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-primary/20 flex items-center justify-center text-primary font-medium">
                            {(user.name?.[0] || 'U').toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div>
                        <h4 className="font-medium">{user.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {user.title || user.username}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  {searchTerm ? 'No users found' : 'No other users available'}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Chat;