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
import { MessagingPageSkeleton } from "@/components/ui/page-skeletons/messaging-skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Helmet } from "react-helmet";

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
  const [searchResults, setSearchResults] = useState<any>(null);
  
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
  
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "name": "Brandentify Smart Connect",
    "description": "Intelligent professional networking and matching platform",
    "url": "https://brandentify.com/smart-connect",
    "serviceType": "Professional Networking",
    "provider": {
      "@type": "Organization",
      "name": "Brandentify"
    },
    "areaServed": "Worldwide",
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Professional Networking Services",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Intelligent Matching",
            "description": "AI-powered professional matching"
          }
        }
      ]
    }
  };

  return (
    <div className="min-h-screen text-white selection:bg-white/20 font-['Outfit'] overflow-x-hidden relative">
      <Helmet>
        <title>Smart Connect - Professional Networking | Brandentify</title>
        <meta name="description" content="Find ideal professional connections with intelligent matching. Connect with industry professionals, mentors, and collaborators for career growth." />
        <meta name="keywords" content="professional networking, smart connections, career networking, industry connections, professional matching, career growth" />
        <meta property="og:title" content="Smart Connect - Professional Networking" />
        <meta property="og:description" content="Intelligent professional matching platform for career development and networking" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://brandentify.com/smart-connect-og-image.jpg" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Smart Connect - Professional Networking" />
        <link rel="canonical" href="https://brandentify.com/smart-connect" />
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>
      {/* Dynamic Background - Premium Dark Theme */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[20%] left-[-20%] w-[50%] h-[50%] bg-white/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-white/3 blur-[120px] rounded-full" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60" />
      </div>
      <Header />
      
      <main className="relative z-10 container mx-auto px-6" style={{ paddingTop: '8rem', paddingBottom: '8rem' }}>
        <div className="max-w-6xl mx-auto">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 md:p-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-8 text-center"
            >
              <h1 className="text-4xl font-bold tracking-tight text-white mb-4">
                Smart Connect
              </h1>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto">
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
                      onSuccess={(results) => {
                        setSearchResults(results);
                        setActiveStep("results");
                      }}
                    />
                  </motion.div>
                </TabsContent>
                
                <TabsContent value="results" className="mt-0">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <MatchResults userId={userId} results={searchResults} />
                  </motion.div>
                </TabsContent>
              </Tabs>
              
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

              {/* Smart Connect FAQ Section for SEO */}
              <div className="mt-12 mb-8">
                <Card id="networking-faq" className="bg-white/5 backdrop-blur-xl border border-white/10 p-6">
                  <CardHeader className="px-0 pt-0">
                    <CardTitle className="text-2xl font-bold text-white">Smart Connect FAQ</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6 px-0 pb-0">
                    <div itemScope itemType="https://schema.org/Question">
                      <h3 itemProp="name" className="text-lg font-semibold text-white mb-2">How does Smart Connect matching work?</h3>
                      <div itemProp="acceptedAnswer" itemScope itemType="https://schema.org/Answer">
                        <p itemProp="text" className="text-gray-400">Smart Connect uses intelligent algorithms to match professionals based on skills, industry, goals, and preferences for optimal networking opportunities.</p>
                      </div>
                    </div>
                    <div itemScope itemType="https://schema.org/Question">
                      <h3 itemProp="name" className="text-lg font-semibold text-white mb-2">What criteria can I use for professional matching?</h3>
                      <div itemProp="acceptedAnswer" itemScope itemType="https://schema.org/Answer">
                        <p itemProp="text" className="text-gray-400">You can filter by industry, skills, experience level, location, career goals, and professional interests to find your ideal connections.</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <Card className="bg-white/5 backdrop-blur-xl border border-white/10">
      <CardHeader className="space-y-1">
        <div className="mb-2">{icon}</div>
        <CardTitle className="text-xl text-white">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-sm text-gray-400">{description}</CardDescription>
      </CardContent>
    </Card>
  );
}

export default SmartConnectPage;
