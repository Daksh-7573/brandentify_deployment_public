import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { NeoGlassLayout, NeoGlassSection } from "@/components/layout/neo-glass-layout";
import { ArrowRight, Sparkles, Target, Users, Brain, Zap, FileText, TrendingUp, Building, Calendar, Trophy, Search, Heart, Newspaper, MessageCircle } from "lucide-react";
import backgroundImage from "@assets/Brandentifier Landing_1751376023002.png";

export default function Landing() {
  const { isLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();
  
  const [_, setLocation] = useLocation();

  // Check if user wants to stay on landing page (via query parameter)
  const urlParams = new URLSearchParams(window.location.search);
  const stayOnLanding = urlParams.get('stay') === 'true';

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (isAuthenticated && !stayOnLanding) {
      const timer = setTimeout(() => {
        setLocation('/dashboard');
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, setLocation, stayOnLanding]);

  if (isAuthenticated && !stayOnLanding) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
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
        <NeoGlassLayout className="mt-0 pt-0 px-4 min-h-screen flex flex-col justify-start">
          {/* Hero Section */}
          <NeoGlassSection className="text-center mb-12 mt-8">
          <div className="space-y-6">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Sparkles className="h-8 w-8 text-blue-400" />
              <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Brandentifier
              </h1>
              <Sparkles className="h-8 w-8 text-purple-400" />
            </div>
            
            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              AI-Powered Career Development Platform that transforms your professional journey with intelligent insights and personalized guidance
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8">
              {isAuthenticated ? (
                <Button 
                  onClick={() => setLocation('/dashboard')}
                  size="lg"
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105"
                >
                  Go to Dashboard
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              ) : (
                <>
                  <Button 
                    onClick={() => setLocation('/auth')}
                    disabled={isLoading}
                    size="lg"
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105"
                  >
                    {isLoading ? "Loading..." : "Get Started"}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </NeoGlassSection>

        {/* Features Section */}
        <NeoGlassSection title="Platform Features" className="mb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {/* Career Clarity */}
            <div className="neo-glass-card p-6 rounded-lg transition-all duration-300 hover:scale-105">
              <div className="flex items-center mb-4">
                <Brain className="h-8 w-8 text-blue-400 mr-3" />
                <h3 className="text-xl font-semibold text-white">Career Clarity</h3>
              </div>
              <p className="text-gray-300 leading-relaxed">
                Confused about your next move? Get smart, personalized career advice instantly.
              </p>
            </div>

            {/* AI Mentorship */}
            <div className="neo-glass-card p-6 rounded-lg transition-all duration-300 hover:scale-105">
              <div className="flex items-center mb-4">
                <MessageCircle className="h-8 w-8 text-purple-400 mr-3" />
                <h3 className="text-xl font-semibold text-white">AI Mentorship</h3>
              </div>
              <p className="text-gray-300 leading-relaxed">
                Talk to AI mentors modeled after industry legends — anytime, anywhere.
              </p>
            </div>

            {/* Smart Resume */}
            <div className="neo-glass-card p-6 rounded-lg transition-all duration-300 hover:scale-105">
              <div className="flex items-center mb-4">
                <FileText className="h-8 w-8 text-green-400 mr-3" />
                <h3 className="text-xl font-semibold text-white">Smart Resume</h3>
              </div>
              <p className="text-gray-300 leading-relaxed">
                Upload your resume and get instant feedback, scoring, and styling tips.
              </p>
            </div>

            {/* Skill Matching */}
            <div className="neo-glass-card p-6 rounded-lg transition-all duration-300 hover:scale-105">
              <div className="flex items-center mb-4">
                <TrendingUp className="h-8 w-8 text-yellow-400 mr-3" />
                <h3 className="text-xl font-semibold text-white">Skill Matching</h3>
              </div>
              <p className="text-gray-300 leading-relaxed">
                Find out which skills you need to grow in your dream career path.
              </p>
            </div>

            {/* Pro Network */}
            <div className="neo-glass-card p-6 rounded-lg transition-all duration-300 hover:scale-105">
              <div className="flex items-center mb-4">
                <Users className="h-8 w-8 text-pink-400 mr-3" />
                <h3 className="text-xl font-semibold text-white">Pro Network</h3>
              </div>
              <p className="text-gray-300 leading-relaxed">
                Build a professional network that actually helps — not just connects.
              </p>
            </div>

            {/* Portfolio Builder */}
            <div className="neo-glass-card p-6 rounded-lg transition-all duration-300 hover:scale-105">
              <div className="flex items-center mb-4">
                <Building className="h-8 w-8 text-cyan-400 mr-3" />
                <h3 className="text-xl font-semibold text-white">Portfolio Builder</h3>
              </div>
              <p className="text-gray-300 leading-relaxed">
                Showcase your skills with real, categorized projects recruiters care about.
              </p>
            </div>

            {/* Experience Tracker */}
            <div className="neo-glass-card p-6 rounded-lg transition-all duration-300 hover:scale-105">
              <div className="flex items-center mb-4">
                <Calendar className="h-8 w-8 text-orange-400 mr-3" />
                <h3 className="text-xl font-semibold text-white">Experience Tracker</h3>
              </div>
              <p className="text-gray-300 leading-relaxed">
                Add internships, jobs, and learnings — everything that shapes your journey.
              </p>
            </div>

            {/* Goal Planner */}
            <div className="neo-glass-card p-6 rounded-lg transition-all duration-300 hover:scale-105">
              <div className="flex items-center mb-4">
                <Target className="h-8 w-8 text-red-400 mr-3" />
                <h3 className="text-xl font-semibold text-white">Goal Planner</h3>
              </div>
              <p className="text-gray-300 leading-relaxed">
                Set career goals and let AI guide you step-by-step to reach them.
              </p>
            </div>

            {/* XP Quests */}
            <div className="neo-glass-card p-6 rounded-lg transition-all duration-300 hover:scale-105">
              <div className="flex items-center mb-4">
                <Trophy className="h-8 w-8 text-gold-400 mr-3" />
                <h3 className="text-xl font-semibold text-white">XP Quests</h3>
              </div>
              <p className="text-gray-300 leading-relaxed">
                Level up your career with gamified challenges and win badges as you grow.
              </p>
            </div>

            {/* Job Radar */}
            <div className="neo-glass-card p-6 rounded-lg transition-all duration-300 hover:scale-105">
              <div className="flex items-center mb-4">
                <Search className="h-8 w-8 text-indigo-400 mr-3" />
                <h3 className="text-xl font-semibold text-white">Job Radar</h3>
              </div>
              <p className="text-gray-300 leading-relaxed">
                Get alerts for jobs, collaborations, and career opportunities in your domain.
              </p>
            </div>

            {/* Real Feedback */}
            <div className="neo-glass-card p-6 rounded-lg transition-all duration-300 hover:scale-105">
              <div className="flex items-center mb-4">
                <Heart className="h-8 w-8 text-rose-400 mr-3" />
                <h3 className="text-xl font-semibold text-white">Real Feedback</h3>
              </div>
              <p className="text-gray-300 leading-relaxed">
                Get reactions and endorsements that boost your credibility — not just likes.
              </p>
            </div>

            {/* Insight Feed */}
            <div className="neo-glass-card p-6 rounded-lg transition-all duration-300 hover:scale-105">
              <div className="flex items-center mb-4">
                <Newspaper className="h-8 w-8 text-emerald-400 mr-3" />
                <h3 className="text-xl font-semibold text-white">Insight Feed</h3>
              </div>
              <p className="text-gray-300 leading-relaxed">
                Stay ahead with personalized industry news, tips, and AI-powered posts.
              </p>
            </div>
          </div>
        </NeoGlassSection>

        {/* Call to Action */}
        <NeoGlassSection className="text-center mb-20">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white">
              Ready to Transform Your Career?
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Join thousands of professionals who are already accelerating their careers with AI-powered insights
            </p>
            {!isAuthenticated && (
              <Button 
                onClick={() => setLocation('/auth')}
                disabled={isLoading}
                size="lg"
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-12 py-4 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105"
              >
                {isLoading ? "Loading..." : "Start Your Journey"}
                <ArrowRight className="ml-2 h-6 w-6" />
              </Button>
            )}
          </div>
          </NeoGlassSection>
        </NeoGlassLayout>
      </div>
    </div>
  );
}