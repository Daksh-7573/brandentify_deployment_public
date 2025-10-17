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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mail, Phone, Check, Sparkles, Target, Users, AlertTriangle, Clock, RefreshCw, Shield, WifiOff, UserX } from "lucide-react";
import { FastGoogleAuth } from "@/components/auth/FastGoogleAuth";
import { FastQuickAuth } from "@/components/auth/FastQuickAuth";
import { NeoGlassLayout, NeoGlassSection } from "@/components/layout/neo-glass-layout";
import backgroundImage from "@assets/Brandentifier Landing_1751376023002.png";

export default function AuthPage() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [_, setLocation] = useLocation();
  const [authMethod, setAuthMethod] = useState<"email" | "phone">("email");
  const [useDemoBypass, setUseDemoBypass] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  
  // Extract error from URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const errorType = urlParams.get('error');
  const errorMessage = urlParams.get('message');
  
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

  // Error message configuration
  const getErrorConfig = (errorType: string | null) => {
    switch (errorType) {
      case 'invalid_state':
        return {
          icon: Shield,
          title: 'Security Verification Failed',
          message: 'The authentication request could not be verified. This usually happens when the session has been tampered with.',
          guidance: 'Please try signing in again to restart the authentication process.',
          color: 'border-red-500/50 bg-red-500/10',
          iconColor: 'text-red-400',
          retryable: true
        };
      case 'expired_state':
        return {
          icon: Clock,
          title: 'Authentication Session Expired',
          message: 'Your authentication session has expired. For security reasons, authentication requests are only valid for 15 minutes.',
          guidance: 'Please start the sign-in process again to get a fresh authentication session.',
          color: 'border-yellow-500/50 bg-yellow-500/10',
          iconColor: 'text-yellow-400',
          retryable: true
        };
      case 'exchange_code_not_found':
        return {
          icon: WifiOff,
          title: 'Connection Handoff Failed',
          message: 'The secure session transfer between domains failed. This can happen if you took too long to complete the sign-in or if there was a network issue.',
          guidance: 'Please try signing in again. The process should complete within a few minutes.',
          color: 'border-orange-500/50 bg-orange-500/10',
          iconColor: 'text-orange-400',
          retryable: true
        };
      case 'oauth_error':
        return {
          icon: AlertTriangle,
          title: 'Google Sign-In Error',
          message: 'Google encountered an error while processing your sign-in request.',
          guidance: 'This is usually temporary. Please try again, or check if your Google account is accessible.',
          color: 'border-red-500/50 bg-red-500/10',
          iconColor: 'text-red-400',
          retryable: true
        };
      case 'token_exchange_failed':
        return {
          icon: RefreshCw,
          title: 'Authentication Token Error',
          message: 'We couldn\'t complete the authentication process with Google. This might be due to a temporary server issue.',
          guidance: 'Please wait a moment and try signing in again. If the problem persists, contact support.',
          color: 'border-red-500/50 bg-red-500/10',
          iconColor: 'text-red-400',
          retryable: true
        };
      case 'user_info_failed':
        return {
          icon: UserX,
          title: 'Profile Information Error',
          message: 'We successfully authenticated with Google but couldn\'t retrieve your profile information.',
          guidance: 'Please check your Google account permissions and try again.',
          color: 'border-red-500/50 bg-red-500/10',
          iconColor: 'text-red-400',
          retryable: true
        };
      case 'invalid_exchange_code':
        return {
          icon: Shield,
          title: 'Invalid Session Code',
          message: 'The session transfer code is invalid or malformed.',
          guidance: 'Please try signing in again to get a new session code.',
          color: 'border-red-500/50 bg-red-500/10',
          iconColor: 'text-red-400',
          retryable: true
        };
      case 'exchange_code_expired':
        return {
          icon: Clock,
          title: 'Session Transfer Expired',
          message: 'The session transfer took too long and has expired for security reasons.',
          guidance: 'Please complete the sign-in process within 5 minutes. Try again.',
          color: 'border-yellow-500/50 bg-yellow-500/10',
          iconColor: 'text-yellow-400',
          retryable: true
        };
      case 'host_mismatch':
        return {
          icon: Shield,
          title: 'Domain Security Check Failed',
          message: 'The authentication request came from an unexpected domain.',
          guidance: 'This is a security protection. Please try signing in again.',
          color: 'border-red-500/50 bg-red-500/10',
          iconColor: 'text-red-400',
          retryable: true
        };
      case 'callback_error':
        return {
          icon: AlertTriangle,
          title: 'Authentication Callback Error',
          message: 'An unexpected error occurred during the authentication process.',
          guidance: 'Please try again. If the problem persists, contact support.',
          color: 'border-red-500/50 bg-red-500/10',
          iconColor: 'text-red-400',
          retryable: true
        };
      case 'session_accept_error':
        return {
          icon: WifiOff,
          title: 'Session Setup Error',
          message: 'We couldn\'t complete setting up your session after authentication.',
          guidance: 'Please try signing in again. This is usually a temporary issue.',
          color: 'border-orange-500/50 bg-orange-500/10',
          iconColor: 'text-orange-400',
          retryable: true
        };
      case 'missing_params':
        return {
          icon: AlertTriangle,
          title: 'Authentication Parameters Missing',
          message: 'Required authentication information was not received from Google.',
          guidance: 'Please ensure you complete the Google sign-in process and try again.',
          color: 'border-red-500/50 bg-red-500/10',
          iconColor: 'text-red-400',
          retryable: true
        };
      default:
        return null;
    }
  };

  const errorConfig = getErrorConfig(errorType);

  // Handle retry button click
  const handleRetry = () => {
    setIsRetrying(true);
    // Clear error parameters from URL
    window.history.replaceState({}, '', '/auth');
    
    // Reset retry state after a brief delay
    setTimeout(() => {
      setIsRetrying(false);
    }, 1000);
  };

  // Auto-clear errors after 30 seconds to prevent stale error states
  useEffect(() => {
    if (errorType) {
      const timer = setTimeout(() => {
        window.history.replaceState({}, '', '/auth');
      }, 30000);
      
      return () => clearTimeout(timer);
    }
  }, [errorType]);

  // Simple redirect without loops - only redirect if explicitly on auth page
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      // Only redirect if we're specifically on the auth page
      const currentPath = window.location.pathname;
      if (currentPath === '/auth') {
        console.log("✅ User authenticated on auth page, checking onboarding status");
        // Check if user needs onboarding
        if (user && !user.onboardingComplete) {
          console.log("→ New user detected, redirecting to onboarding");
          setTimeout(() => {
            setLocation('/onboarding');
          }, 100);
        } else {
          console.log("→ Returning user, redirecting to dashboard");
          setTimeout(() => {
            setLocation('/dashboard');
          }, 100);
        }
      }
    }
  }, [isAuthenticated, isLoading, user, setLocation]);

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
          {/* Error Alert Section */}
          {errorConfig && (
            <div className="max-w-4xl mx-auto mb-6 md:mb-8" data-testid="auth-error-alert">
              <Alert className={`${errorConfig.color} border-2`}>
                <div className="flex items-start space-x-4">
                  <div className={`p-2 rounded-full bg-black/20 ${errorConfig.iconColor} flex-shrink-0`}>
                    <errorConfig.icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-white mb-2" data-testid="error-title">
                          {errorConfig.title}
                        </h3>
                        <AlertDescription className="text-gray-300 mb-3" data-testid="error-message">
                          {errorConfig.message}
                        </AlertDescription>
                        <p className="text-sm text-gray-400" data-testid="error-guidance">
                          {errorConfig.guidance}
                        </p>
                        {errorMessage && (
                          <p className="text-xs text-gray-500 mt-2" data-testid="error-details">
                            Technical details: {errorMessage}
                          </p>
                        )}
                      </div>
                      {errorConfig.retryable && (
                        <div className="flex-shrink-0">
                          <Button
                            onClick={handleRetry}
                            disabled={isRetrying}
                            variant="outline"
                            size="sm"
                            className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/30"
                            data-testid="button-retry-auth"
                          >
                            {isRetrying ? (
                              <>
                                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                Clearing...
                              </>
                            ) : (
                              <>
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Try Again
                              </>
                            )}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Alert>
            </div>
          )}

          {/* Header Section */}
          <div className="text-center mb-6 md:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent mb-3 md:mb-4">
            Welcome to Brandentifier
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-gray-300 px-2">
            {errorConfig ? 'Please try signing in again' : 'Unlock personalized Brand Quests to build your professional presence'}
          </p>
          
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 max-w-6xl mx-auto">
          {/* Left column - Auth forms */}
          <NeoGlassSection>
            <div className="space-y-4 md:space-y-6">
              <Tabs defaultValue="email" onValueChange={(v) => setAuthMethod(v as "email" | "phone")}>
                <TabsList className="hidden grid-cols-2 mb-4 md:mb-6 dark-tabs-list w-full">
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
                        <h3 className="text-xl font-semibold text-white">Get Started with Google</h3>
                        <p className="text-gray-300">Complete your profile and unlock your first personalized quest</p>
                      </div>
                      
                      <FastGoogleAuth />
                      
                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <span className="w-full border-t border-white/20" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                          <span className="bg-black/50 px-2 text-gray-300">or for testing</span>
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
                    <p className="text-gray-300 mb-4">Phone authentication is coming soon!</p>
                    <p className="text-gray-400 text-sm">Please use the Email tab to sign in with Google for now.</p>
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