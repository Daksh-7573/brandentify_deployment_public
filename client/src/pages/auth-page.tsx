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
import { FastGoogleAuth } from "@/components/auth/FastGoogleAuth";
import { FastQuickAuth } from "@/components/auth/FastQuickAuth";
import { NeoGlassLayout, NeoGlassSection } from "@/components/layout/neo-glass-layout";
import backgroundImage from "@assets/Brandentifier Landing_1751376023002.png";

export default function AuthPage() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [_, setLocation] = useLocation();
  const [authMethod, setAuthMethod] = useState<"email" | "phone">("email");
  const [useDemoBypass, setUseDemoBypass] = useState(false);
  
  // Debug auth state on auth page
  console.log('AuthPage: Current auth state:', {
    isAuthenticated,
    isLoading,
    hasUser: !!user,
    userEmail: user?.email
  });
  
  // We used to bypass Google auth on the problematic domain, but now we're properly 
  // supporting it directly and want to use Google auth instead
  useEffect(() => {
    // Instead of automatically enabling demo mode, we now properly support Google auth on all domains
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

  // Handle authenticated user redirect with force reload - TEMPORARILY DISABLED
  // useEffect(() => {
  //   if (isAuthenticated && !isLoading) {
  //     console.log("✅ User is authenticated, forcing redirect to dashboard");
  //     // Force a hard redirect to ensure proper navigation
  //     window.location.href = '/dashboard';
  //   }
  // }, [isAuthenticated, isLoading]);

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
        <NeoGlassLayout className="mt-0 pt-2 px-2 md:px-4 min-h-screen flex flex-col justify-start py-2 md:py-4">
          {/* Minimal auth page - no debug components */}
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
                    {/* Clean Google Authentication Only */}
                    <div className="space-y-6">
                      <div className="text-center space-y-3">
                        <h3 className="text-xl font-semibold text-white">Welcome to Brandentifier</h3>
                        <p className="text-gray-300">Your AI-powered career development platform</p>
                      </div>
                      
                      <FastGoogleAuth />
                      
                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <span className="w-full border-t border-white/20" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                          <span className="bg-black/50 px-2 text-gray-300">or</span>
                        </div>
                      </div>
                      
                      <FastQuickAuth />
                      
                      <div className="text-center">
                        <p className="text-sm text-gray-400">
                          By continuing, you agree to our Terms of Service and Privacy Policy
                        </p>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Phone Authentication */}
                <TabsContent value="phone">
                  <div className="text-center space-y-4">
                    <h3 className="text-lg font-semibold text-white">Phone Authentication</h3>
                    <p className="text-gray-300">Phone auth coming soon - use Google for now</p>
                    <FastGoogleAuth />
                  </div>
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