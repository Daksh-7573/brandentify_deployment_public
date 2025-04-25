import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '../lib/queryClient';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '../hooks/use-auth';

// Define test categories and colors
const categories = {
  general: { label: 'General', color: 'bg-green-600' },
  stress: { label: 'Stress', color: 'bg-red-600' },
  confusion: { label: 'Confusion', color: 'bg-yellow-600' },
  domainSpecific: { label: 'Domain-Specific', color: 'bg-purple-600' },
  experimental: { label: 'Experimental', color: 'bg-blue-600' }
};

const MuskTestingPage: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('general');
  const [selectedTest, setSelectedTest] = useState<{category: string, index: number} | null>(null);
  const [testResponse, setTestResponse] = useState<string>('');
  const [scores, setScores] = useState({
    relevance: 3,
    empathy: 3,
    clarity: 3,
    actionability: 3,
    innovation: 3
  });
  
  // Get all test scenarios
  const { data: scenarios, isLoading: scenariosLoading } = useQuery({
    queryKey: ['/api/musk-testing/scenarios'],
    refetchOnWindowFocus: false
  });
  
  // Mutation to run a test
  const runTestMutation = useMutation({
    mutationFn: (params: {category: string, index: number}) => 
      apiRequest('POST', '/api/musk-testing/run-test', {
        ...params,
        userId: user?.id || null 
      }),
    onSuccess: (data: any) => {
      setTestResponse(data.response);
      toast({
        title: 'Test completed',
        description: `Emotional tone detected: ${data.emotionalTone}`,
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error running test',
        description: error.message || 'Failed to run the test scenario',
        variant: 'destructive'
      });
    }
  });
  
  // Mutation to submit a score
  const submitScoreMutation = useMutation({
    mutationFn: (params: {
      category: string, 
      index: number,
      score: typeof scores,
      responseText: string
    }) => apiRequest('POST', '/api/musk-testing/score', {
      ...params,
      userId: user?.id || null
    }),
    onSuccess: () => {
      toast({
        title: 'Score submitted',
        description: 'Your evaluation has been recorded',
      });
      
      // Reset scores to default
      setScores({
        relevance: 3,
        empathy: 3,
        clarity: 3,
        actionability: 3,
        innovation: 3
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error submitting score',
        description: error.message || 'Failed to submit the evaluation',
        variant: 'destructive'
      });
    }
  });
  
  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setSelectedTest(null);
    setTestResponse('');
  };
  
  // Handle test selection
  const handleTestSelect = (index: number) => {
    setSelectedTest({
      category: activeTab,
      index
    });
    setTestResponse('');
  };
  
  // Handle run test
  const handleRunTest = () => {
    if (!selectedTest) return;
    
    runTestMutation.mutate({
      category: selectedTest.category,
      index: selectedTest.index
    });
  };
  
  // Handle score submission
  const handleSubmitScore = () => {
    if (!selectedTest || !testResponse) return;
    
    submitScoreMutation.mutate({
      category: selectedTest.category,
      index: selectedTest.index,
      score: scores,
      responseText: testResponse
    });
  };
  
  // Calculate average score
  const averageScore = Object.values(scores).reduce((a, b) => a + b, 0) / Object.values(scores).length;
  
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Musk QA Testing Framework</h1>
        <p className="text-lg text-muted-foreground mb-6">
          Test Musk's responses across different scenarios and evaluate performance
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4">
          <Card>
            <CardHeader>
              <CardTitle>Test Scenarios</CardTitle>
              <CardDescription>
                Select a category and specific test scenario
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                <TabsList className="grid grid-cols-5 mb-4">
                  {Object.entries(categories).map(([key, { label }]) => (
                    <TabsTrigger key={key} value={key}>{label}</TabsTrigger>
                  ))}
                </TabsList>
                
                {Object.keys(categories).map((category) => (
                  <TabsContent key={category} value={category} className="mt-0">
                    {scenariosLoading ? (
                      <div className="text-center py-8">Loading scenarios...</div>
                    ) : (
                      <div className="space-y-2 mt-2">
                        {scenarios && scenarios[category as keyof typeof scenarios]?.length > 0 ? 
                          scenarios[category as keyof typeof scenarios].map((scenario: any, index: number) => (
                            <div 
                              key={index}
                              className={`p-3 rounded-md cursor-pointer transition-colors hover:bg-muted ${
                                selectedTest?.category === category && selectedTest?.index === index
                                  ? 'bg-muted border border-primary'
                                  : 'border'
                              }`}
                              onClick={() => handleTestSelect(index)}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <div className={`h-3 w-3 rounded-full ${categories[category as keyof typeof categories].color}`} />
                                <span className="text-xs text-muted-foreground">Test #{index + 1}</span>
                              </div>
                              <p className="text-sm font-medium mb-1">{scenario.prompt}</p>
                              <p className="text-xs text-muted-foreground">{scenario.expectedOutput}</p>
                            </div>
                          ))
                        : (
                          <div className="p-4 text-center text-muted-foreground text-sm border rounded-md">
                            No test scenarios available for this category
                          </div>
                        )}
                      </div>
                    )}
                  </TabsContent>
                ))}
              </Tabs>
              
              <div className="mt-6">
                <Button 
                  className="w-full" 
                  disabled={!selectedTest || runTestMutation.isPending}
                  onClick={handleRunTest}
                >
                  {runTestMutation.isPending ? 'Running Test...' : 'Run Selected Test'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="lg:col-span-8">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Musk's Response</CardTitle>
              <CardDescription>
                The AI response for the selected test scenario
              </CardDescription>
            </CardHeader>
            <CardContent>
              {runTestMutation.isPending ? (
                <div className="h-40 flex items-center justify-center">
                  <p>Musk is thinking...</p>
                </div>
              ) : testResponse ? (
                <Textarea 
                  className="min-h-40 font-mono text-sm"
                  readOnly
                  value={testResponse}
                />
              ) : (
                <div className="h-40 flex items-center justify-center border rounded-md">
                  <p className="text-muted-foreground">Run a test to see Musk's response</p>
                </div>
              )}
            </CardContent>
          </Card>
          
          {testResponse && (
            <Card>
              <CardHeader>
                <CardTitle>Evaluation</CardTitle>
                <CardDescription>
                  Score Musk's response on five dimensions (1-5)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="relevance">Relevance</Label>
                      <span className="text-sm">{scores.relevance}/5</span>
                    </div>
                    <Slider 
                      id="relevance"
                      min={1} 
                      max={5} 
                      step={1} 
                      value={[scores.relevance]} 
                      onValueChange={(val) => setScores({...scores, relevance: val[0]})} 
                    />
                    <p className="text-xs text-muted-foreground">
                      How accurately the response meets the prompt goal
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="empathy">Empathy</Label>
                      <span className="text-sm">{scores.empathy}/5</span>
                    </div>
                    <Slider 
                      id="empathy"
                      min={1} 
                      max={5} 
                      step={1} 
                      value={[scores.empathy]} 
                      onValueChange={(val) => setScores({...scores, empathy: val[0]})} 
                    />
                    <p className="text-xs text-muted-foreground">
                      Appropriate tone, emotional recognition
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="clarity">Clarity</Label>
                      <span className="text-sm">{scores.clarity}/5</span>
                    </div>
                    <Slider 
                      id="clarity"
                      min={1} 
                      max={5} 
                      step={1} 
                      value={[scores.clarity]} 
                      onValueChange={(val) => setScores({...scores, clarity: val[0]})} 
                    />
                    <p className="text-xs text-muted-foreground">
                      Easy to understand, well-structured
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="actionability">Actionability</Label>
                      <span className="text-sm">{scores.actionability}/5</span>
                    </div>
                    <Slider 
                      id="actionability"
                      min={1} 
                      max={5} 
                      step={1} 
                      value={[scores.actionability]} 
                      onValueChange={(val) => setScores({...scores, actionability: val[0]})} 
                    />
                    <p className="text-xs text-muted-foreground">
                      Real, usable advice or next steps
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="innovation">Innovation</Label>
                      <span className="text-sm">{scores.innovation}/5</span>
                    </div>
                    <Slider 
                      id="innovation"
                      min={1} 
                      max={5} 
                      step={1} 
                      value={[scores.innovation]} 
                      onValueChange={(val) => setScores({...scores, innovation: val[0]})} 
                    />
                    <p className="text-xs text-muted-foreground">
                      Unique, forward-thinking suggestions
                    </p>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-between items-center pt-2">
                    <div>
                      <p className="font-medium">Overall Score</p>
                      <p className="text-xs text-muted-foreground">Average of all dimensions</p>
                    </div>
                    <div className="text-2xl font-bold">{averageScore.toFixed(1)}</div>
                  </div>
                  
                  <Button 
                    className="w-full" 
                    onClick={handleSubmitScore}
                    disabled={submitScoreMutation.isPending}
                  >
                    {submitScoreMutation.isPending ? 'Submitting...' : 'Submit Evaluation'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default MuskTestingPage;