import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { NowboardSuggestions } from '@/components/brand-quests/nowboard-suggestions';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function TestNowboardPage() {
  const [userId, setUserId] = useState<number>(2); // Default demo user ID
  const [questType, setQuestType] = useState<string | undefined>(undefined);

  return (
    <div className="container py-10 max-w-6xl">
      <h1 className="text-3xl font-bold mb-6">Nowboard Recommendations Test</h1>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Test Configuration</CardTitle>
          <CardDescription>Adjust these settings to test different scenarios</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="userId">User ID</Label>
              <Input 
                id="userId" 
                type="number" 
                value={userId} 
                onChange={(e) => setUserId(parseInt(e.target.value))} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="questType">Quest Type</Label>
              <select
                id="questType"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={questType || ''}
                onChange={(e) => setQuestType(e.target.value === '' ? undefined : e.target.value)}
              >
                <option value="">All Types</option>
                <option value="pulse_creation">Pulse Creation</option>
                <option value="engagement">Engagement (Comments/Reactions)</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Tabs defaultValue="component">
        <TabsList className="mb-6">
          <TabsTrigger value="component">Component Display</TabsTrigger>
          <TabsTrigger value="demo">Demo Mode</TabsTrigger>
        </TabsList>
        
        <TabsContent value="component">
          <div className="max-w-lg mx-auto">
            <NowboardSuggestions 
              userId={userId} 
              questType={questType}
            />
          </div>
        </TabsContent>
        
        <TabsContent value="demo">
          <div className="grid grid-cols-1 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Demo Endpoint Results</CardTitle>
                <CardDescription>Using /api/nowboard-recommendations/demo</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-md p-4 bg-gray-50">
                  <pre className="whitespace-pre-wrap text-xs">
                    {`// Demo mode shows predefined suggestions for testing
[
  {
    "id": 101,
    "type": "pulse",
    "title": "Create a pulse about your recent project",
    "description": "Share your recent work to make progress on your \"Content Creator\" quest",
    "actionText": "Create Pulse",
    "xpValue": 25,
    "relatedQuestId": 1
  },
  {
    "id": 102,
    "type": "comment",
    "title": "Comment on trending industry discussions",
    "description": "Professionals in Healthcare are discussing new research. Join the conversation!",
    "actionText": "View Conversations",
    "xpValue": 15,
    "relatedQuestId": 2
  }
]`}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}