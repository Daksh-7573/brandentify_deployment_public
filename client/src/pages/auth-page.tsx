import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail, Phone, Check, Sparkles, Target, Users } from "lucide-react";
import { GoogleAuth } from "@/components/auth/google-auth";
import { PhoneAuth } from "@/components/auth/phone-auth";
import { EmailAuth } from "@/components/auth/email-auth";
import { DemoLogin } from "@/components/auth/demo-login";
import { NeoGlassLayout, NeoGlassSection } from "@/components/layout/neo-glass-layout";
import { AuthDebugOverlay } from "@/components/auth/auth-debug-overlay";
// Removed old auth handlers
import backgroundImage from "@assets/Brandentifier Landing_1751376023002.png";

export default function AuthPage() {
  const { isAuthenticated, isLoading, signInWithPhone } = useAuth();
  const [_, setLocation] = useLocation();
  const [authMethod, setAuthMethod] = useState<"email" | "phone">("email");
  const [useDemoBypass, setUseDemoBypass] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  
  // Handle authentication state and redirects
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log('Auth page loaded, initializing authentication...');
        
        const { handleRedirectResult, isAuthenticated, getCurrentUser } = await import('@/lib/firebase-auth');
        
        // First check for redirect result from Google OAuth
        const redirectUser = await handleRedirectResult();
        if (redirectUser) {
          console.log('OAuth success! Redirecting user:', redirectUser.email);
          // Redirect to Industry Pulse after successful OAuth
          window.location.href = '/industry-pulse';
          return;
        }
        
        // Check if user is already authenticated
        if (isAuthenticated()) {
          const user = getCurrentUser();
          console.log('User already authenticated, redirecting:', user?.email);
          window.location.href = '/industry-pulse';
          return;
        }
        
        // No authentication found, show login form
        console.log('No authentication detected, showing login form');
        setIsCheckingAuth(false);
        
      } catch (error) {
        console.error('Error initializing authentication:', error);
        setIsCheckingAuth(false);
      }
    };
    
    initializeAuth();
    setUseDemoBypass(false);
  }, []);

  // Disabled auth redirect handler - let the AuthContext handle this
  // useEffect(() => {
  //   const checkRedirect = async () => {
  //     const { checkAndHandleAuthRedirect } = await import('@/utils/auth-redirect-handler');
  //     await checkAndHandleAuthRedirect();
  //   };
  //   
  //   checkRedirect();
  // }, []);

  // Let AuthContext handle redirects - avoid competing redirect logic
  // useEffect(() => {
  //   if (isAuthenticated) {
  //     // Use a small delay to ensure the auth state has fully settled
  //     const timer = setTimeout(() => {
  //       console.log("User is authenticated, redirecting to industry pulse");
  //       setLocation("/industry-pulse");
  //     }, 100);
  //     return () => clearTimeout(timer);
  //   }
  // }, [isAuthenticated, setLocation]);

  // Show loading state while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-300">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="responsive-background min-h-screen w-full relative overflow-hidden"
      style={{ 
        backgroundImage: `url(${backgroundImage})`
      }}
    >
      {/* Glass UI overlay to maintain design consistency */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900/80 via-black/70 to-gray-800/80 backdrop-blur-sm"></div>
      
      {/* Content layer */}
      <div className="relative z-10">
        <AuthDebugOverlay />
        <NeoGlassLayout className="mt-0 pt-2 px-2 md:px-4 min-h-screen flex flex-col justify-start py-2 md:py-4">
          <div className="text-center mb-6 md:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent mb-3 md:mb-4">
            Welcome to Brandentifier
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-gray-300 px-2">
            Sign in to accelerate your professional growth with AI-powered career guidance
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 max-w-6xl mx-auto">
          {/* Left column - Auth forms */}
          <NeoGlassSection>
            <div className="space-y-4 md:space-y-6">
              <Tabs defaultValue="email" onValueChange={(v) => setAuthMethod(v as "email" | "phone")}>
                <TabsList className="grid grid-cols-2 mb-4 md:mb-6 dark-tabs-list w-full">
                  <TabsTrigger value="email" className="flex items-center gap-1 md:gap-1.5 dark-tabs-trigger text-sm md:text-base">
                    <Mail className="h-3 w-3 md:h-4 md:w-4" />
                    <span>Email</span>
                  </TabsTrigger>
                  <TabsTrigger value="phone" className="flex items-center gap-1 md:gap-1.5 dark-tabs-trigger text-sm md:text-base">
                    <Phone className="h-3 w-3 md:h-4 md:w-4" />
                    <span>Phone</span>
                  </TabsTrigger>
                </TabsList>

                {/* Email Authentication */}
                <TabsContent value="email">
                  <div className="space-y-4 md:space-y-6">
                    {useDemoBypass ? (
                      <>
                        <div className="bg-blue-500/20 px-3 py-2 rounded-lg mb-4 text-sm text-blue-200 border border-blue-400/30">
                          Using direct demo login for this domain
                        </div>
                        <DemoLogin />
                      </>
                    ) : (
                      <>
                        <EmailAuth />
                        
                        <div className="relative w-full">
                          <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-white/20" />
                          </div>
                          <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-black/50 px-2 text-gray-300">or</span>
                          </div>
                        </div>
                        
                        <GoogleAuth />
                      </>
                    )}
                  </div>
                </TabsContent>

                {/* Phone Authentication */}
                <TabsContent value="phone">
                  {useDemoBypass ? (
                    <>
                      <div className="bg-blue-500/20 px-3 py-2 rounded-lg mb-4 text-sm text-blue-200 border border-blue-400/30">
                        Using direct demo login for this domain
                      </div>
                      <DemoLogin />
                    </>
                  ) : (
                    <PhoneAuth />
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </NeoGlassSection>

          {/* Right column - Features showcase */}
          <NeoGlassSection>
            <div className="space-y-4 md:space-y-6">
              <h2 className="text-xl md:text-2xl font-bold text-white mb-4 md:mb-6">Elevate Your Career</h2>
              <p className="text-gray-300 text-base md:text-lg mb-6 md:mb-8">
                Brandentifier helps you discover your professional strengths and connect with opportunities that match your unique profile.
              </p>
              
              <div className="grid gap-3 md:gap-4">
                <div className="flex items-start space-x-3 md:space-x-4 p-3 md:p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                  <div className="p-1.5 md:p-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 flex-shrink-0">
                    <Sparkles className="h-4 w-4 md:h-5 md:w-5 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-white mb-1 text-sm md:text-base">AI-Powered Career Guidance</h3>
                    <p className="text-gray-300 text-xs md:text-sm">Get personalized advice tailored to your experience and goals</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 md:space-x-4 p-3 md:p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                  <div className="p-1.5 md:p-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 flex-shrink-0">
                    <Target className="h-4 w-4 md:h-5 md:w-5 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-white mb-1 text-sm md:text-base">Smart Opportunity Matching</h3>
                    <p className="text-gray-300 text-xs md:text-sm">Discover roles and projects that align with your skills</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 md:space-x-4 p-3 md:p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                  <div className="p-1.5 md:p-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 flex-shrink-0">
                    <Users className="h-4 w-4 md:h-5 md:w-5 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-white mb-1 text-sm md:text-base">Professional Networking</h3>
                    <p className="text-gray-300 text-xs md:text-sm">Connect with industry professionals and mentors</p>
                  </div>
                </div>
              </div>
            </div>
          </NeoGlassSection>
          </div>
        </NeoGlassLayout>
      </div>
    </div>
  );
}