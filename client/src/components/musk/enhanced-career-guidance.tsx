import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest } from "@/lib/queryClient";
import { Loader2, TrendingUp, BookText, Lightbulb } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

interface InsightsUsed {
  trendingSkillsCount: number;
  careerPathOptionsCount: number;
  skillMarketFit: number;
}

export default function EnhancedCareerGuidance({ userId }: { userId: number }) {
  const [query, setQuery] = useState("");
  const [guidance, setGuidance] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [insightsUsed, setInsightsUsed] = useState<InsightsUsed | null>(null);
  const [model, setModel] = useState("openai");
  const queryClient = useQueryClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) {
      toast({
        title: "Please enter a question",
        description: "Enter a career-related question to get guidance",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    setGuidance("");
    
    try {
      const response = await apiRequest("POST", "/api/musk-enhanced/career-guidance", {
        userId,
        query,
        model
      });
      
      if (response && response.success) {
        setGuidance(response.guidance);
        setInsightsUsed(response.insightsUsed);
        
        // Add to conversation history
        queryClient.invalidateQueries({ queryKey: ['/api/musk-memory/conversation-history', userId] });
      } else {
        toast({
          title: "Error getting guidance",
          description: response?.message || "Something went wrong. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      toast({
        title: "Error getting guidance",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <span>Data-Driven Career Guidance</span>
          </CardTitle>
          <CardDescription>
            Ask Musk for personalized career advice enhanced with real-time industry data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Tabs defaultValue="openai" className="w-full" onValueChange={setModel}>
                <div className="flex justify-between items-center mb-2">
                  <label htmlFor="query" className="text-sm font-medium">
                    Your career question
                  </label>
                  <TabsList>
                    <TabsTrigger value="openai" className="text-xs">
                      OpenAI
                    </TabsTrigger>
                    <TabsTrigger value="anthropic" className="text-xs">
                      Anthropic
                    </TabsTrigger>
                  </TabsList>
                </div>
                <div>
                  <Input
                    id="query"
                    placeholder="e.g., What skills should I learn to advance in my career?"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </Tabs>
            </div>
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing career data...
                </>
              ) : (
                "Get Enhanced Career Guidance"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {guidance && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-primary" />
              <span>Your Enhanced Career Guidance</span>
            </CardTitle>
            <CardDescription>
              Guidance enhanced with{" "}
              {insightsUsed && (
                <span className="space-x-2">
                  {insightsUsed.trendingSkillsCount > 0 && (
                    <Badge variant="outline" className="text-xs">
                      {insightsUsed.trendingSkillsCount} Trending Skills
                    </Badge>
                  )}
                  {insightsUsed.careerPathOptionsCount > 0 && (
                    <Badge variant="outline" className="text-xs">
                      {insightsUsed.careerPathOptionsCount} Career Paths
                    </Badge>
                  )}
                  {insightsUsed.skillMarketFit > 0 && (
                    <Badge variant="outline" className="text-xs">
                      Market Fit Analysis
                    </Badge>
                  )}
                  {insightsUsed.trendingSkillsCount === 0 && 
                   insightsUsed.careerPathOptionsCount === 0 && 
                   insightsUsed.skillMarketFit === 0 && (
                    <Badge variant="outline" className="text-xs">
                      Base AI Analysis
                    </Badge>
                  )}
                </span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Avatar>
                <AvatarImage src="/musk-avatar.png" alt="Musk" />
                <AvatarFallback>M</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="whitespace-pre-line text-sm">
                  {guidance.split('\n').map((line, i) => (
                    <p key={i} className={line.startsWith('#') ? 'font-bold mt-2' : line.startsWith('-') ? 'ml-4' : ''}>
                      {line}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => {
              // Copy to clipboard
              navigator.clipboard.writeText(guidance);
              toast({
                title: "Copied to clipboard",
                description: "Career guidance copied to clipboard",
              });
            }}>
              Copy
            </Button>
            <Button 
              variant="default" 
              size="sm"
              onClick={() => {
                apiRequest("POST", "/api/musk-feedback/save-to-plan", {
                  userId,
                  content: guidance,
                  category: "career_guidance",
                  source: "enhanced_ai"
                });
                toast({
                  title: "Saved to career plan",
                  description: "This guidance has been added to your career plan",
                });
              }}
            >
              Save to Career Plan
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}