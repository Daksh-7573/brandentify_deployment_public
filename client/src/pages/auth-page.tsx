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

  // Redirect to industry pulse if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      setLocation("/industry-pulse");
    }
  }, [isAuthenticated, setLocation]);

  return (
    <div className="neo-spotify-container">
      <NeoGlassLayout>
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent mb-4">
            Welcome to Brandentifier
          </h1>
          <p className="text-lg text-gray-300">
            Sign in to accelerate your professional growth with AI-powered career guidance
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Left column - Auth forms */}
          <NeoGlassSection>
            <div className="space-y-6">
              <Tabs defaultValue="email" onValueChange={(v) => setAuthMethod(v as "email" | "phone")}>
                <TabsList className="grid grid-cols-2 mb-6 dark-tabs-list">
                  <TabsTrigger value="email" className="flex items-center gap-1.5 dark-tabs-trigger">
                    <Mail className="h-4 w-4" />
                    <span>Email</span>
                  </TabsTrigger>
                  <TabsTrigger value="phone" className="flex items-center gap-1.5 dark-tabs-trigger">
                    <Phone className="h-4 w-4" />
                    <span>Phone</span>
                  </TabsTrigger>
                </TabsList>

                {/* Email Authentication */}
                <TabsContent value="email">
                  <div className="space-y-6">
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
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white mb-6">Elevate Your Career</h2>
              <p className="text-gray-300 text-lg mb-8">
                Brandentifier helps you discover your professional strengths and connect with opportunities that match your unique profile.
              </p>
              
              <div className="grid gap-4">
                <div className="flex items-start space-x-4 p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                  <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500">
                    <Sparkles className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1">AI-Powered Career Guidance</h3>
                    <p className="text-gray-300 text-sm">Get personalized advice tailored to your experience and goals</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                  <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500">
                    <Target className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1">Smart Opportunity Matching</h3>
                    <p className="text-gray-300 text-sm">Discover roles and projects that align with your skills</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                  <div className="p-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1">Professional Networking</h3>
                    <p className="text-gray-300 text-sm">Connect with industry professionals and mentors</p>
                  </div>
                </div>
              </div>
            </div>
          </NeoGlassSection>
        </div>
      </NeoGlassLayout>
    </div>
  );
}