import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { ArrowRight, Sparkles } from "lucide-react";

export default function Landing() {
  const { isLoading, isAuthenticated } = useAuth();
  const [_, setLocation] = useLocation();

  // Check if user wants to stay on landing page (via query parameter)
  const urlParams = new URLSearchParams(window.location.search);
  const stayOnLanding = urlParams.get('stay') === 'true';

  // Redirect to Industry Pulse if already authenticated (main home page)
  useEffect(() => {
    if (isAuthenticated && !stayOnLanding) {
      const timer = setTimeout(() => {
        setLocation('/industry-pulse');
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, setLocation, stayOnLanding]);

  if (isAuthenticated && !stayOnLanding) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
      <div className="max-w-4xl mx-auto px-6 text-center">
        {/* Hero Section */}
        <div className="space-y-8">
          {/* Brand Logo */}
          <div className="flex items-center justify-center space-x-2 mb-8">
            <Sparkles className="h-10 w-10 text-blue-400" />
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Brandentifier
            </h1>
            <Sparkles className="h-10 w-10 text-purple-400" />
          </div>
          
          {/* Tagline */}
          <p className="text-2xl md:text-3xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Your AI-Powered Career Companion
          </p>
          
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Transform your professional journey with intelligent insights, personalized guidance, and powerful networking tools.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mt-12">
            {isAuthenticated ? (
              <Button 
                onClick={() => setLocation('/industry-pulse')}
                size="lg"
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-10 py-4 rounded-lg font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Go to Dashboard
                <ArrowRight className="ml-2 h-6 w-6" />
              </Button>
            ) : (
              <Button 
                onClick={() => setLocation('/auth')}
                disabled={isLoading}
                size="lg"
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-10 py-4 rounded-lg font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                {isLoading ? "Loading..." : "Get Started"}
                <ArrowRight className="ml-2 h-6 w-6" />
              </Button>
            )}
          </div>
          
          {/* Simple feature highlights */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="h-8 w-8 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">AI Mentorship</h3>
              <p className="text-gray-400">Get personalized career advice from AI mentors</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="h-8 w-8 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Smart Networking</h3>
              <p className="text-gray-400">Build meaningful professional connections</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-pink-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="h-8 w-8 text-pink-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Career Insights</h3>
              <p className="text-gray-400">Track progress and discover opportunities</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}