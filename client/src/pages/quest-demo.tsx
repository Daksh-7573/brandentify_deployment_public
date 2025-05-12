import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export default function QuestDemoPage() {
  const { toast } = useToast();
  const [_, setLocation] = useLocation();

  const launchDemo = () => {
    // Set localStorage to use demo user ID 1
    localStorage.setItem('demo_user_id', '1');
    
    // Navigate to brand quests page with demo flag
    setLocation('/brand-quests?demo=true');
    
    toast({
      title: 'Demo Mode Activated',
      description: 'Loading Brand Quests demo with pre-assigned quests.',
      duration: 5000,
    });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Brand Quests Demo</CardTitle>
          <CardDescription>
            Launch the Brand Quests demo to see the weekly engagement quests in action.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            This demo will show you the following weekly quests:
          </p>
          <ul className="list-disc pl-5 space-y-2 mb-4">
            <li><span className="font-medium">Hashtag Hero</span> - Create a pulse with 3 relevant hashtags</li>
            <li><span className="font-medium">Media Maven</span> - Create a pulse with media attachments</li>
            <li><span className="font-medium">Meaningful Commenter</span> - Leave thoughtful comments on posts</li>
          </ul>
          <p>
            Each quest has different XP rewards and progress tracking.
          </p>
        </CardContent>
        <CardFooter>
          <Button onClick={launchDemo} className="w-full">
            Launch Brand Quests Demo
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}