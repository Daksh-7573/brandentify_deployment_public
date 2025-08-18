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
import { CleanGoogleAuth } from "@/components/auth/clean-google-auth";
import { AuthRedirectHandler } from "@/components/auth/auth-redirect-handler";
import { NeoGlassLayout, NeoGlassSection } from "@/components/layout/neo-glass-layout";
import backgroundImage from "@assets/Brandentifier Landing_1751376023002.png";

export default function AuthPage() {
  const { isAuthenticated, isLoading, signInWithPhone } = useAuth();
  const [_, setLocation] = useLocation();
  const [authMethod, setAuthMethod] = useState<"email" | "phone">("email");
  const [useDemoBypass, setUseDemoBypass] = useState(false);
  
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
        <AuthRedirectHandler />
        <NeoGlassLayout className="mt-0 pt-2 px-2 md:px-4 min-h-screen flex flex-col justify-center items-center">
          <div className="text-center mb-8 md:mb-12">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent mb-4 md:mb-6">
              Welcome to Brandentifier
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-gray-300 px-4 max-w-2xl mx-auto">
              Accelerate your professional growth with AI-powered career guidance
            </p>
          </div>

          {/* Single Google Authentication */}
          <NeoGlassSection className="w-full max-w-md mx-auto">
            <div className="text-center mb-6">
              <h2 className="text-xl font-semibold text-white mb-2">Sign In to Continue</h2>
              <p className="text-sm text-gray-400">Connect with your Google account to get started</p>
            </div>
            
            <CleanGoogleAuth />
          </NeoGlassSection>
        </NeoGlassLayout>
      </div>
    </div>
  );
}