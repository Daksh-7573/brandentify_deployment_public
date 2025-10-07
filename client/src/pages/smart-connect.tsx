import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import Header from "@/components/layout/header";
import { SmartConnectForm } from "@/components/smart-connect/smart-connect-form";
import { MatchResults } from "@/components/smart-connect/match-results";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Send, Filter, Users, Sparkles, AlertCircle, RefreshCw } from "lucide-react";
import { FeedSkeleton } from "@/components/ui/skeleton-components";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Storage key for active tab persistence
const SMART_CONNECT_ACTIVE_TAB_KEY = 'smartConnect_activeTab';

export function SmartConnectPage() {
  // Load saved active tab from localStorage
  const [activeStep, setActiveStep] = useState<"form" | "results">(() => {
    try {
      const saved = localStorage.getItem(SMART_CONNECT_ACTIVE_TAB_KEY);
      return (saved as "form" | "results") || "form";
    } catch (error) {
      console.warn('Failed to load Smart Connect active tab:', error);
      return "form";
    }
  });

  const [hasError, setHasError] = useState(false);
  
  // Get current user ID (in demo mode, use 1)
  const { data: userData, isLoading: isUserLoading, error: userError } = useQuery<{ id: number }>({
    queryKey: ["/api/users", 1],
    retry: 3,
    retryDelay: 1000,
  });

  const userId = userData?.id || 1;

  // Persist active tab to localStorage
  const handleTabChange = (value: string) => {
    const newTab = value as "form" | "results";
    setActiveStep(newTab);
    
    try {
      localStorage.setItem(SMART_CONNECT_ACTIVE_TAB_KEY, newTab);
      console.log('[SmartConnect] Active tab saved:', newTab);
    } catch (error) {
      console.warn('Failed to save Smart Connect active tab:', error);
    }
  };

  // Error boundary effect
  useEffect(() => {
    if (userError) {
      setHasError(true);
      console.error('[SmartConnect] User data error:', userError);
    }
  }, [userError]);

  // Reset error state
  const handleRetry = () => {
    setHasError(false);
    window.location.reload();
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8 text-center"
          >
            <h1 className="text-4xl font-bold tracking-tight mb-4">
              Smart Connect
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Find your ideal professional connections with our intelligent matching engine
            </p>
          </motion.div>

          {/* Error Alert */}
          {hasError && (
            <Alert variant="destructive" className="mb-8">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Connection Error</AlertTitle>
              <AlertDescription className="flex items-center justify-between">
                <span>
                  We're having trouble connecting to our services. Your form data is safely stored and will be restored when the connection is back.
                </span>
                <Button variant="outline" size="sm" onClick={handleRetry} className="ml-4">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry
                </Button>
              </AlertDescription>
            </Alert>
          )}
          
          <div className="mb-8">
            <Tabs 
              value={activeStep}
              onValueChange={handleTabChange}
              className="w-full"
            >
              <div className="flex justify-center mb-8">
                <TabsList className="grid w-full max-w-md grid-cols-2">
                  <TabsTrigger value="form" className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    <span>Set Criteria</span>
                  </TabsTrigger>
                  <TabsTrigger value="results" className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>View Matches</span>
                  </TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="form" className="mt-0">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <SmartConnectForm 
                    userId={userId} 
                    onSuccess={() => setActiveStep("results")}
                  />
                </motion.div>
              </TabsContent>
              
              <TabsContent value="results" className="mt-0">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <MatchResults userId={userId} />
                </motion.div>
              </TabsContent>
            </Tabs>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <FeatureCard
              icon={<Sparkles className="h-8 w-8 text-primary" />}
              title="Intelligent Matching"
              description="Our advanced algorithm considers multiple dimensions for high-quality matches."
            />
            <FeatureCard
              icon={<Users className="h-8 w-8 text-primary" />}
              title="Targeted Connections"
              description="Find specific types of professionals based on your exact needs."
            />
            <FeatureCard
              icon={<Send className="h-8 w-8 text-primary" />}
              title="Direct Engagement"
              description="Connect and message with professionals who match your criteria."
            />
          </div>
        </div>
      </main>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <Card>
      <CardHeader className="space-y-1">
        <div className="mb-2">{icon}</div>
        <CardTitle className="text-xl">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-sm">{description}</CardDescription>
      </CardContent>
    </Card>
  );
}

export default SmartConnectPage;