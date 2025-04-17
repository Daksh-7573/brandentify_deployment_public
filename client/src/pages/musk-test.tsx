import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import MuskChatPanel from '@/components/musk/musk-chat-panel';
import { useUser } from '@/hooks/use-user';

export default function MuskTestPage() {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useUser();

  return (
    <div className="container mx-auto py-8">
      <Card className="p-6">
        <h1 className="text-2xl font-bold mb-4">Musk AI Test Page</h1>
        <p className="mb-4">This page is for testing the Musk AI chat interface and suggested questions feature.</p>
        
        <Button 
          onClick={() => setIsOpen(true)}
          className="mb-4"
        >
          Open Musk Chat
        </Button>
        
        {isOpen && (
          <MuskChatPanel
            context={{ page: 'musk-test' }}
            onClose={() => setIsOpen(false)}
          />
        )}
      </Card>
    </div>
  );
}