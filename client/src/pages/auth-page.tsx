import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Mail,
  Phone,
  Check,
  Sparkles,
  Target,
  Users,
  AlertTriangle,
  Clock,
  RefreshCw,
  Shield,
  WifiOff,
  UserX,
  ArrowLeft,
  ChevronRight,
  Zap,
  Globe,
  Rocket,
  Brain,
  Star
} from "lucide-react";
import { FastGoogleAuth } from "@/components/auth/FastGoogleAuth";
import { AuthPageSEO } from '@/components/seo/auth-page-seo';
import { AuthPageStructuredData } from '@/components/seo/structured-data';
import { AuthFAQSection } from '@/components/seo/auth-faq';

// Animation Variants
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    }
  }
};

export default function AuthPage() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [_, setLocation] = useLocation();
  const [authMethod, setAuthMethod] = useState<"email" | "phone">("email");
  const [isRetrying, setIsRetrying] = useState(false);

  // Extract error from URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const errorType = urlParams.get('error');
  const errorMessage = urlParams.get('message');

  // Error message configuration
  const getErrorConfig = (errorType: string | null) => {
    switch (errorType) {
      case 'invalid_state':
        return {
          icon: Shield,
          title: 'Security Verification Failed',
          message: 'The authentication request could not be verified.',
          color: 'border-red-500/50 bg-red-500/10',
          iconColor: 'text-red-400',
          retryable: true
        };
      case 'expired_state':
        return {
          icon: Clock,
          title: 'Session Expired',
          message: 'Your authentication session has expired.',
          color: 'border-yellow-500/50 bg-yellow-500/10',
          iconColor: 'text-yellow-400',
          retryable: true
        };
      case 'oauth_error':
        return {
          icon: AlertTriangle,
          title: 'Sign-In Error',
          message: 'Google encountered an error while processing your request.',
          color: 'border-red-500/50 bg-red-500/10',
          iconColor: 'text-red-400',
          retryable: true
        };
      default:
        return errorType ? {
          icon: AlertTriangle,
          title: 'Authentication Error',
          message: 'An unexpected error occurred. Please try again.',
          color: 'border-orange-500/50 bg-orange-500/10',
          iconColor: 'text-orange-400',
          retryable: true
        } : null;
    }
  };

  const errorConfig = getErrorConfig(errorType);

  const determineOnboardingRedirect = async (userId: number) => {
    try {
      const response = await fetch(`/api/users/${userId}/onboarding-status`, {
        credentials: 'include',
        headers: { 'Accept': 'application/json' }
      });

      if (!response.ok) {
        return '/onboarding';
      }

      const data = await response.json();
      return data?.isComplete ? '/dashboard' : '/onboarding';
    } catch (error) {
      return '/onboarding';
    }
  };

  const handleRetry = () => {
    setIsRetrying(true);
    window.history.replaceState({}, '', '/auth');
    setTimeout(() => setIsRetrying(false), 1000);
  };

  useEffect(() => {
    // Listen for auth state changes from context
    const handleAuthChange = async (event: Event) => {
      const customEvent = event as CustomEvent<{ user: AuthUser; authenticated: boolean }>;
      if (customEvent.detail.authenticated && customEvent.detail.user) {
        const targetPath = await determineOnboardingRedirect(customEvent.detail.user.id);
        console.log('[Auth Page] Auth state changed, redirecting to:', targetPath);
        setLocation(targetPath);
      }
    };
    
    window.addEventListener('auth-state-changed', handleAuthChange);
    
    return () => {
      window.removeEventListener('auth-state-changed', handleAuthChange);
    };
  }, [setLocation]);

  useEffect(() => {
    if (isAuthenticated && !isLoading && user) {
      const currentPath = window.location.pathname;
      if (currentPath === '/auth') {
        determineOnboardingRedirect(user.id).then((targetPath) => {
          console.log(`[Auth Redirect] Routing to: ${targetPath}`);
          setLocation(targetPath);
        });
      }
    }
  }, [isAuthenticated, isLoading, user, setLocation]);

  return (
    <div className="min-h-screen bg-[#121212] text-white selection:bg-white/20 font-['Outfit'] overflow-x-hidden relative">
      {/* Dynamic Background - Premium Dark Theme */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[20%] left-[-20%] w-[50%] h-[50%] bg-white/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-white/3 blur-[120px] rounded-full" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/40" />
      </div>

      {/* Brandentify Logo - Top Left */}
      <div className="fixed top-8 left-8 z-50">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-tr from-white/40 to-white/20 rounded-lg flex items-center justify-center shadow-lg shadow-white/5">
            <Sparkles size={18} className="text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">Brandentify</span>
        </div>
      </div>

      {/* Floating Back Button */}
      <div className="fixed top-8 right-8 z-50">
        <Button
          size="sm"
          className="neo-glass-button tertiary px-4"
          onClick={() => setLocation("/")}
          style={{ borderRadius: '5px' }}
        >
          <ArrowLeft size={16} className="mr-2" />
          Back to Home
        </Button>
      </div>

      <AuthPageSEO />
      <AuthPageStructuredData />
      
      <main className="relative z-10 pb-32 container mx-auto px-6" style={{ paddingTop: '10rem' }}>
        <div className="max-w-6xl mx-auto">
          {/* Error Section */}
          <AnimatePresence>
            {errorConfig && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: "auto", marginBottom: 32 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                className="overflow-hidden"
              >
                <div className={`p-6 rounded-3xl border-2 ${errorConfig.color} flex items-start gap-5 backdrop-blur-sm`}>
                  <div className={`p-3 rounded-2xl bg-black/20 ${errorConfig.iconColor}`}>
                    <errorConfig.icon size={24} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-white mb-1">{errorConfig.title}</h3>
                    <p className="text-gray-300 text-sm mb-4">{errorConfig.message}</p>
                    <Button
                      onClick={handleRetry}
                      disabled={isRetrying}
                      size="sm"
                      className="neo-glass-button secondary px-6"
                      style={{ borderRadius: '5px' }}
                    >
                      {isRetrying ? (
                        <RefreshCw size={14} className="mr-2 animate-spin" />
                      ) : (
                        <RefreshCw size={14} className="mr-2" />
                      )}
                      Try Again
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Left Column: Auth Card */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              className="relative group focus-within:z-20"
            >
              <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 md:p-12 overflow-hidden">
                <div className="flex flex-col items-center text-center mb-10">
                  <div className="w-16 h-16 bg-white/10 border border-white/20 rounded-3xl flex items-center justify-center mb-6">
                    <Shield className="text-white/70" size={32} />
                  </div>
                  <h2 className="text-3xl font-bold mb-2">Welcome Back</h2>
                  <p className="text-gray-400">Enter your credentials to access your dashboard</p>
                </div>

                <Tabs defaultValue="email" onValueChange={(v) => setAuthMethod(v as "email" | "phone")} className="w-full">
                  <TabsList className="grid grid-cols-1 p-1.5 bg-white/5 border border-white/10 rounded-lg mb-10 h-14">
                    <TabsTrigger
                      value="email"
                      className="rounded-lg data-[state=active]:bg-white/20 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-white/5 h-full font-bold text-gray-400 transition-all"
                    >
                      Email & Google
                    </TabsTrigger>
                    {false && (
                      <TabsTrigger
                        value="phone"
                        className="rounded-lg data-[state=active]:bg-white/20 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-white/5 h-full font-bold text-gray-400 transition-all"
                      >
                        Phone SMS
                      </TabsTrigger>
                    )}
                  </TabsList>

                  <TabsContent value="email" className="mt-0 space-y-8">
                    <FastGoogleAuth />
                  </TabsContent>

                  {false && (
                    <TabsContent value="phone" className="mt-0 text-center py-10">
                      <div className="flex flex-col items-center justify-center space-y-6">
                        <div className="w-20 h-20 bg-white/10 border border-white/20 rounded-full flex items-center justify-center relative">
                          <div className="absolute inset-0 bg-white/10 blur-xl rounded-full" />
                          <Phone className="text-white/70 relative z-10" size={32} />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold mb-2 text-white">SMS Auth Coming Soon</h3>
                          <p className="text-gray-400 text-sm max-w-xs mx-auto leading-relaxed">
                            We're currently scaling our SMS infrastructure for global delivery. Please use Google sign-in for now.
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-white/40 animate-pulse" />
                          <div className="w-1.5 h-1.5 rounded-full bg-white/40 animate-pulse delay-75" />
                          <div className="w-1.5 h-1.5 rounded-full bg-white/40 animate-pulse delay-150" />
                        </div>
                      </div>
                    </TabsContent>
                  )}
                </Tabs>

                <div className="mt-12 text-center">
                  <p className="text-xs text-gray-500 leading-safe">
                    By signing in, you agree to our <a href="#" className="text-white/60 hover:text-white/80 underline transition-colors">Terms of Service</a> and <a href="#" className="text-white/60 hover:text-white/80 underline transition-colors">Privacy Policy</a>.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Right Column: Feature List Bento */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="grid gap-6 auto-rows-fr"
            >
              <motion.div variants={fadeInUp} className="p-8 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 flex flex-col justify-center relative overflow-hidden group hover:bg-white/8 transition-all">
                <div className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity">
                  <img src="/feature-ai.png" className="w-full h-full object-cover scale-150 rotate-12" alt="AI" />
                </div>
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-white/10 border border-white/20 rounded-2xl flex items-center justify-center mb-6 text-white/70">
                    <Brain size={24} />
                  </div>
                  <h3 className="text-xl font-bold mb-2">AI-Powered Career Guidance</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">Get hyper-personalized advice tailored to your unique experience, industry trends, and professional goals.</p>
                </div>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.div variants={fadeInUp} className="p-8 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 flex flex-col justify-between relative overflow-hidden group hover:bg-white/8 transition-all">
                  <div className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity">
                    <img src="/feature-clarity.png" className="w-full h-full object-cover" alt="Target" />
                  </div>
                  <div className="relative z-10 h-full flex flex-col justify-between">
                    <div className="w-10 h-10 bg-white/10 border border-white/20 rounded-xl flex items-center justify-center mb-6 text-white/70">
                      <Target size={20} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold mb-1">Smart Match</h3>
                      <p className="text-gray-400 text-xs leading-relaxed">Discover roles that perfectly align with your current skills.</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div variants={fadeInUp} className="p-8 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 flex flex-col justify-between relative overflow-hidden group hover:bg-white/8 transition-all">
                  <div className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity">
                    <img src="/feature-network.png" className="w-full h-full object-cover -rotate-12" alt="Users" />
                  </div>
                  <div className="relative z-10 h-full flex flex-col justify-between">
                    <div className="w-10 h-10 bg-white/10 border border-white/20 rounded-xl flex items-center justify-center mb-6 text-white/70">
                      <Users size={20} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold mb-1">Pro Network</h3>
                      <p className="text-gray-400 text-xs leading-relaxed">Connect with mentors and industry-leading professionals.</p>
                    </div>
                  </div>
                </motion.div>
              </div>

                          </motion.div>
          </div>
        </div>
        {/* FAQ Section for AEO (Answer Engine Optimization) */}
        <AuthFAQSection />
      </main>

      <footer className="py-10 border-t border-white/5 relative z-10 mt-20">
        <div className="container mx-auto px-6 text-center">
          <p className="text-xs text-gray-600 font-medium tracking-widest uppercase">
            © 2026 Brandentify Inc. All Systems Operational
          </p>
        </div>
      </footer>
    </div>
  );
}
