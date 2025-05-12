import React from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import { useAuth } from "@/context/auth-context";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
// Removed Nowboard panel import as it's now integrated into quests
import PulseFeed from "@/components/industry-pulse/pulse-feed";

export default function FeedTestPage() {
  const { user } = useAuth();
  
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-6">
        <h1 className="text-2xl font-bold mb-6">Feed Algorithm Test Page</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main content - Industry Pulse Feed */}
          <div className="md:col-span-2">
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle>Shared Feed Algorithm Test</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Testing the shared feed algorithm components across Industry Pulse and Nowboard
                </p>
              </CardHeader>
              
              <CardContent>
                <Tabs defaultValue="pulse" className="w-full">
                  <TabsList className="grid grid-cols-2 mb-4">
                    <TabsTrigger value="pulse">Industry Pulse</TabsTrigger>
                    <TabsTrigger value="details">Implementation Details</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="pulse" className="space-y-4">
                    <PulseFeed />
                  </TabsContent>
                  
                  <TabsContent value="details">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Shared Algorithm Implementation</h3>
                      <p>Key components shared between feeds:</p>
                      
                      <ul className="list-disc pl-6 space-y-2">
                        <li><strong>useFeedAlgorithm</strong> - Handles data fetching, filtering, and sorting</li>
                        <li><strong>useFeedEngagement</strong> - Manages engagement actions (reactions, inspired, etc.)</li>
                        <li><strong>formatFeedDate</strong> - Consistent date formatting across feeds</li>
                        <li><strong>getEngagementStyles</strong> - Unified styling for engagement buttons</li>
                        <li><strong>calculateRelevanceScore</strong> - Shared algorithm for personalized content</li>
                      </ul>
                      
                      <Separator className="my-4" />
                      
                      <h3 className="text-lg font-medium">Features</h3>
                      <ul className="list-disc pl-6 space-y-2">
                        <li>Content filtering by type, category, or visibility</li>
                        <li>Personalized relevance sorting based on user preferences</li>
                        <li>Consistent engagement metrics across feeds</li>
                        <li>Unified styling and user experience</li>
                        <li>Automatic data refetching and cache invalidation</li>
                      </ul>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
          
          {/* Sidebar - Nowboard Panel */}
          <div className="md:col-span-1">
            {/* Nowboard Panel removed as it's now integrated into quests */}
          </div>
        </div>
      </main>
    </div>
  );
}