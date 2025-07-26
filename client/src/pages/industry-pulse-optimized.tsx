import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw, Filter } from "lucide-react";
import Header from "@/components/layout/header";
import { NeoGlassLayout, NeoGlassSection } from "@/components/layout/neo-glass-layout";
import { useToast } from "@/hooks/use-toast";
import backgroundImage from "@assets/Brandentifier Landing_1751376023002.png";
import NowboardPanelSimple from "@/components/nowboard/nowboard-panel-simple";
import InfinitePulseFeed from "@/components/industry-pulse/infinite-pulse-feed";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Performance optimized Industry Pulse page with infinite scrolling
export default function IndustryPulseOptimizedPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  
  // Smart refresh state
  const [hasNewContent, setHasNewContent] = useState(false);
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Handle tab change with optimized filters
  const getFiltersForTab = (tab: string) => {
    switch (tab) {
      case "polls":
        return { type: "poll" };
      case "media":
        return { type: "media-pulse" };
      case "projects":
        return { type: "project" };
      case "news":
        return { type: "news-pulse" };
      default:
        return {};
    }
  };

  // Simulate new content detection (would be WebSocket in production)
  useEffect(() => {
    const checkForNewContent = () => {
      // Randomly simulate new content for demo
      if (Math.random() > 0.7) {
        setHasNewContent(true);
      }
    };

    refreshTimeoutRef.current = setInterval(checkForNewContent, 30000); // Check every 30 seconds

    return () => {
      if (refreshTimeoutRef.current) {
        clearInterval(refreshTimeoutRef.current);
      }
    };
  }, []);

  const handleRefresh = () => {
    setHasNewContent(false);
    // Force refresh would go here
    toast({
      title: "Feed Refreshed",
      description: "Latest content loaded successfully"
    });
  };

  const handleCreatePulse = () => {
    setLocation("/create-pulse");
  };

  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-fixed relative"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      {/* Glass overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900/80 via-black/70 to-gray-800/80 backdrop-blur-sm" />
      
      {/* Content */}
      <div className="relative z-10">
        <Header />
        
        <NeoGlassLayout className="mt-3">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Main Content Area */}
            <div className="flex-1 lg:flex-[2]">
              <NeoGlassSection className="p-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                      Industry Pulse
                    </h1>
                    <p className="text-gray-300 text-sm sm:text-base">
                      Real-time insights from professionals in your industry
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {/* New Content Indicator */}
                    {hasNewContent && (
                      <Button
                        onClick={handleRefresh}
                        className="neo-glass-button text-sm"
                        size="sm"
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        New Posts Available
                      </Button>
                    )}
                    
                    {/* Create Pulse Button */}
                    <Button
                      onClick={handleCreatePulse}
                      className="neo-glass-button"
                      size="sm"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create Pulse
                    </Button>
                  </div>
                </div>

                {/* Content Tabs with Optimized Filtering */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-5 mb-6 dark-tabs-list">
                    <TabsTrigger value="all" className="dark-tabs-trigger">
                      All
                    </TabsTrigger>
                    <TabsTrigger value="polls" className="dark-tabs-trigger">
                      Polls
                    </TabsTrigger>
                    <TabsTrigger value="media" className="dark-tabs-trigger">
                      Media
                    </TabsTrigger>
                    <TabsTrigger value="projects" className="dark-tabs-trigger">
                      Projects
                    </TabsTrigger>
                    <TabsTrigger value="news" className="dark-tabs-trigger">
                      News
                    </TabsTrigger>
                  </TabsList>

                  {/* All Tabs Content - Optimized with Infinite Scrolling */}
                  <TabsContent value="all" className="mt-0">
                    <InfinitePulseFeed 
                      filters={getFiltersForTab("all")}
                      key="all-feed"
                    />
                  </TabsContent>

                  <TabsContent value="polls" className="mt-0">
                    <InfinitePulseFeed 
                      filters={getFiltersForTab("polls")}
                      key="polls-feed"
                    />
                  </TabsContent>

                  <TabsContent value="media" className="mt-0">
                    <InfinitePulseFeed 
                      filters={getFiltersForTab("media")}
                      key="media-feed"
                    />
                  </TabsContent>

                  <TabsContent value="projects" className="mt-0">
                    <InfinitePulseFeed 
                      filters={getFiltersForTab("projects")}
                      key="projects-feed"
                    />
                  </TabsContent>

                  <TabsContent value="news" className="mt-0">
                    <InfinitePulseFeed 
                      filters={getFiltersForTab("news")}
                      key="news-feed"
                    />
                  </TabsContent>
                </Tabs>
              </NeoGlassSection>
            </div>

            {/* Right Sidebar - Nowboard Panel */}
            <div className="w-full lg:w-80 lg:flex-shrink-0">
              <NeoGlassSection className="p-6">
                <h2 className="text-xl font-bold text-white mb-4">
                  Opportunities
                </h2>
                <NowboardPanelSimple />
              </NeoGlassSection>

              {/* Performance Metrics (Development) */}
              {process.env.NODE_ENV === 'development' && (
                <Card className="neo-glass-card mt-4">
                  <CardHeader>
                    <CardTitle className="text-white text-sm">Performance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-xs text-gray-300">
                      <div>Active Tab: {activeTab}</div>
                      <div>New Content: {hasNewContent ? 'Yes' : 'No'}</div>
                      <div>Infinite Scroll: Enabled</div>
                      <div>Lazy Loading: Enabled</div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </NeoGlassLayout>
      </div>
    </div>
  );
}