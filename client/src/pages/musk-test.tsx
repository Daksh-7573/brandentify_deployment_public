import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import MuskChatPanel from '@/components/musk/musk-chat-panel';
import { useAuth } from '@/hooks/use-auth';

export default function MuskTestPage() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, isDemoMode } = useAuth();

  return (
    <div className="container mx-auto py-8">
      <Card className="p-6">
        <h1 className="text-2xl font-bold mb-4">Musk AI Test Page</h1>
        <p className="mb-4">This page is for testing the Musk AI chat interface and suggested questions feature.</p>
        
        <div className="mb-4">
          <p className="text-sm text-muted-foreground mb-2">
            {isDemoMode ? 'Currently in demo mode' : user ? `Logged in as: ${user.name || user.email}` : 'Not logged in'}
          </p>
          <p className="text-sm text-muted-foreground mb-2">
            User ID: {user?.id || 'Using demo user (ID: 1)'}
          </p>
        </div>
        
        <Button 
          onClick={() => setIsOpen(true)}
          className="mb-4"
        >
          Open Musk Chat
        </Button>
        
        {isOpen && (
          <MuskChatPanel
            context={{ 
              page: 'musk-test',
              userId: user?.id || 1 // Use demo user ID if not logged in
            }}
            onClose={() => setIsOpen(false)}
          />
        )}
      </Card>
    </div>
  );
}