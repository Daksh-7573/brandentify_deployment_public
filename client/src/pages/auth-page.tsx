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
import { Mail, Phone, Check, Sparkles, Target, Brain } from "lucide-react";
import { GoogleAuth } from "@/components/auth/google-auth";
import { PhoneAuth } from "@/components/auth/phone-auth";
import { EmailAuth } from "@/components/auth/email-auth";
import { DemoLogin } from "@/components/auth/demo-login";

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

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      setLocation("/dashboard");
    }
  }, [isAuthenticated, setLocation]);

  return (
    <div className="neo-spotify-container">
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl w-full">
          {/* Left column - Auth forms */}
          <div className="neo-spotify-sidebar relative overflow-hidden">
            <div className="p-6 relative z-10">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">
                  Welcome to Brandentifier
                </h1>
                <p className="text-[var(--spotify-light-gray)]">
                  Sign in to accelerate your professional growth
                </p>
              </div>
              
              <Tabs defaultValue="email" onValueChange={(v) => setAuthMethod(v as "email" | "phone")}>
                <TabsList className="bg-[var(--spotify-glass-bg)] rounded-lg p-1 mb-6 border border-[var(--spotify-glass-border)] grid grid-cols-2">
                  <TabsTrigger 
                    value="email" 
                    className="flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-[var(--spotify-light-gray)] rounded-md transition-all data-[state=active]:bg-[var(--spotify-green)] data-[state=active]:text-[var(--spotify-black)] hover:text-white"
                  >
                    <Mail className="h-4 w-4" />
                    <span>Email</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="phone" 
                    className="flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-[var(--spotify-light-gray)] rounded-md transition-all data-[state=active]:bg-[var(--spotify-green)] data-[state=active]:text-[var(--spotify-black)] hover:text-white"
                  >
                    <Phone className="h-4 w-4" />
                    <span>Phone</span>
                  </TabsTrigger>
                </TabsList>

                {/* Email Authentication */}
                <TabsContent value="email">
                  <div className="space-y-6">
                    {useDemoBypass ? (
                      <>
                        <div className="bg-[var(--spotify-glass-bg)] border border-[var(--spotify-glass-border)] px-3 py-2 rounded-lg mb-4 text-sm text-[var(--spotify-light-gray)]">
                          Using direct demo login for this domain
                        </div>
                        <DemoLogin />
                      </>
                    ) : (
                      <>
                        <EmailAuth />
                        
                        <div className="relative w-full my-6">
                          <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-[var(--spotify-glass-border)]" />
                          </div>
                          <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-[var(--spotify-black)] px-2 text-[var(--spotify-light-gray)]">or</span>
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
                      <div className="bg-[var(--spotify-glass-bg)] border border-[var(--spotify-glass-border)] px-3 py-2 rounded-lg mb-4 text-sm text-[var(--spotify-light-gray)]">
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
          </div>

          {/* Right column - Hero content */}
          <div className="neo-spotify-main relative overflow-hidden hidden md:flex">
            <div className="p-6 relative z-10 h-full flex flex-col justify-center space-y-8">
              <div className="text-center">
                <h2 className="text-4xl font-bold text-white mb-4 bg-gradient-to-r from-[var(--spotify-green)] to-[var(--spotify-bright-green)] bg-clip-text text-transparent">
                  Elevate Your Career
                </h2>
                <p className="text-xl text-[var(--spotify-light-gray)]">
                  Discover your professional strengths and connect with opportunities that match your unique profile.
                </p>
              </div>
              
              <div className="grid grid-cols-1 gap-6">
                <div className="featured-track">
                  <div className="flex items-start space-x-3">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-[var(--spotify-green)] to-[var(--spotify-bright-green)]">
                      <Brain className="h-6 w-6 text-[var(--spotify-black)]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-1">AI-Powered Insights</h3>
                      <p className="text-sm text-[var(--spotify-light-gray)]">Get personalized career guidance tailored to your experience</p>
                    </div>
                  </div>
                </div>
                
                <div className="featured-track">
                  <div className="flex items-start space-x-3">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-blue-400 to-[var(--spotify-green)]">
                      <Target className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-1">Smart Networking</h3>
                      <p className="text-sm text-[var(--spotify-light-gray)]">Connect with professionals in your field intelligently</p>
                    </div>
                  </div>
                </div>
                
                <div className="featured-track">
                  <div className="flex items-start space-x-3">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-purple-400 to-[var(--spotify-green)]">
                      <Sparkles className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-1">Profile Enhancement</h3>
                      <p className="text-sm text-[var(--spotify-light-gray)]">Automatic resume parsing and professional optimization</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}