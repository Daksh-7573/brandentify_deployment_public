import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useEffect, useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { NeoGlassLayout, NeoGlassSection } from "@/components/layout/neo-glass-layout";
import { ArrowRight, Sparkles, Target, Users, Brain, Zap, FileText, TrendingUp, Building, Calendar, Trophy, Search, Heart, Newspaper, MessageCircle } from "lucide-react";
import backgroundImage from "@assets/Brandentifier Landing_1751376023002.png";
import CSSAdaptiveRobot from "@/components/3d/CSSAdaptiveRobot";
import CSSParticleSystem from "@/components/3d/CSSParticleSystem";
import AdvancedParallax from "@/components/3d/AdvancedParallax";

export default function PlanALandingSimple() {
  const { isLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [_, setLocation] = useLocation();
  
  // 3D Robot interaction states
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [robotInteractions, setRobotInteractions] = useState({
    onEnter: false,
    onHover: false,
    onFeaturePoint: false,
    onCelebrate: false
  });
  const containerRef = useRef<HTMLDivElement>(null);

  // Check if user wants to stay on landing page (via query parameter)
  const urlParams = new URLSearchParams(window.location.search);
  const stayOnLanding = urlParams.get('stay') === 'true';

  // Mouse tracking for robot interactions
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    const handleMouseEnter = () => {
      setRobotInteractions(prev => ({ ...prev, onEnter: true }));
      setTimeout(() => setRobotInteractions(prev => ({ ...prev, onEnter: false })), 2000);
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseenter', handleMouseEnter, { once: true });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, []);

  // Feature hover handler
  const handleFeatureHover = () => {
    setRobotInteractions(prev => ({ ...prev, onFeaturePoint: true }));
    setTimeout(() => setRobotInteractions(prev => ({ ...prev, onFeaturePoint: false })), 3000);
  };

  // CTA click handler
  const handleCTAClick = () => {
    setRobotInteractions(prev => ({ ...prev, onCelebrate: true }));
    setTimeout(() => {
      setRobotInteractions(prev => ({ ...prev, onCelebrate: false }));
      setLocation('/auth');
    }, 1500);
  };

  // Redirect to dashboard if already authenticated
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="responsive-background min-h-screen w-full relative overflow-hidden perspective-1000"
      style={{ 
        backgroundImage: `url(${backgroundImage})`
      }}
    >
      {/* Advanced Multi-Layer Parallax System */}
      <AdvancedParallax 
        containerRef={containerRef}
        mousePosition={mousePosition}
      />
      
      {/* Enhanced Glass UI overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900/60 via-black/50 to-gray-800/60 backdrop-blur-sm"></div>
      
      {/* Advanced Particle System */}
      <CSSParticleSystem 
        containerRef={containerRef}
        mousePosition={mousePosition}
        particleCount={200}
        colorScheme="multi"
      />

      {/* 3D Adaptive AI Robot */}
      <div className="fixed top-1/2 right-8 transform -translate-y-1/2 z-40">
        <CSSAdaptiveRobot 
          containerRef={containerRef}
          mousePosition={mousePosition}
          interactions={robotInteractions}
        />
      </div>

      {/* Progress indicator */}
      <div className="fixed top-0 left-0 w-full h-1 bg-gray-800/50 z-50">
        <div className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 w-0 animate-pulse" />
      </div>

      {/* Content layer */}
      <div className="relative z-10">
        <NeoGlassLayout className="mt-0 pt-2 px-4 min-h-screen flex flex-col justify-start py-4">
          {/* Hero Section */}
          <NeoGlassSection className="text-center mb-12 transform-3d">
            <div className="space-y-6">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <Sparkles className="h-8 w-8 text-blue-400 float" />
                <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent holographic">
                  Brandentifier
                </h1>
                <Sparkles className="h-8 w-8 text-purple-400 float" style={{ animationDelay: '1s' }} />
              </div>
              
              <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                AI-Powered Career Development Platform with advanced 3D interactions that transforms your professional journey with intelligent insights and personalized guidance
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8">
                {isAuthenticated ? (
                  <Button 
                    onClick={handleCTAClick}
                    size="lg"
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 button-3d glow-blue"
                  >
                    Go to Dashboard
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                ) : (
                  <Button 
                    onClick={handleCTAClick}
                    disabled={isLoading}
                    size="lg"
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 button-3d glow-blue"
                  >
                    {isLoading ? "Loading..." : "Get Started"}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                )}
              </div>
            </div>
          </NeoGlassSection>

          {/* Features Section with Enhanced 3D Cards */}
          <NeoGlassSection title="Platform Features" className="mb-16 relative z-20">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" style={{ transformStyle: 'preserve-3d' }}>
              {/* Career Clarity */}
              <div 
                className="neo-glass-3d p-6 rounded-lg transition-3d hover:scale-105 magnetic glow-blue perspective-1000 gpu-accelerated"
                onMouseEnter={handleFeatureHover}
                style={{ 
                  transform: 'translateZ(50px)',
                  animation: 'floatCard 6s ease-in-out infinite 0s'
                }}
              >
                <div className="flex items-center mb-4">
                  <Brain className="h-8 w-8 text-blue-400 mr-3 float" />
                  <h3 className="text-xl font-semibold text-white">Career Clarity</h3>
                </div>
                <p className="text-gray-300 leading-relaxed">
                  Confused about your next move? Get smart, personalized career advice instantly with advanced AI.
                </p>
              </div>

              {/* AI Mentorship */}
              <div className="neo-glass-3d p-6 rounded-lg transition-3d hover:scale-105 magnetic glow-purple perspective-1000 gpu-accelerated">
                <div className="flex items-center mb-4">
                  <MessageCircle className="h-8 w-8 text-purple-400 mr-3 float" style={{ animationDelay: '0.2s' }} />
                  <h3 className="text-xl font-semibold text-white">AI Mentorship</h3>
                </div>
                <p className="text-gray-300 leading-relaxed">
                  Talk to AI mentors modeled after industry legends — anytime, anywhere with 3D interactions.
                </p>
              </div>

              {/* Smart Resume */}
              <div className="neo-glass-3d p-6 rounded-lg transition-3d hover:scale-105 magnetic glow-blue perspective-1000 gpu-accelerated">
                <div className="flex items-center mb-4">
                  <FileText className="h-8 w-8 text-green-400 mr-3 float" style={{ animationDelay: '0.4s' }} />
                  <h3 className="text-xl font-semibold text-white">Smart Resume</h3>
                </div>
                <p className="text-gray-300 leading-relaxed">
                  Upload your resume and get instant feedback, scoring, and styling tips with advanced analysis.
                </p>
              </div>

              {/* Skill Matching */}
              <div className="neo-glass-3d p-6 rounded-lg transition-3d hover:scale-105 magnetic glow-purple perspective-1000 gpu-accelerated">
                <div className="flex items-center mb-4">
                  <TrendingUp className="h-8 w-8 text-yellow-400 mr-3 float" style={{ animationDelay: '0.6s' }} />
                  <h3 className="text-xl font-semibold text-white">Skill Matching</h3>
                </div>
                <p className="text-gray-300 leading-relaxed">
                  Find out which skills you need to grow in your dream career path with 3D visualization.
                </p>
              </div>

              {/* Pro Network */}
              <div className="neo-glass-3d p-6 rounded-lg transition-3d hover:scale-105 magnetic glow-blue perspective-1000 gpu-accelerated">
                <div className="flex items-center mb-4">
                  <Users className="h-8 w-8 text-pink-400 mr-3 float" style={{ animationDelay: '0.8s' }} />
                  <h3 className="text-xl font-semibold text-white">Pro Network</h3>
                </div>
                <p className="text-gray-300 leading-relaxed">
                  Build a professional network that actually helps — not just connects, with immersive experiences.
                </p>
              </div>

              {/* Portfolio Builder */}
              <div className="neo-glass-3d p-6 rounded-lg transition-3d hover:scale-105 magnetic glow-purple perspective-1000 gpu-accelerated">
                <div className="flex items-center mb-4">
                  <Building className="h-8 w-8 text-cyan-400 mr-3 float" style={{ animationDelay: '1s' }} />
                  <h3 className="text-xl font-semibold text-white">Portfolio Builder</h3>
                </div>
                <p className="text-gray-300 leading-relaxed">
                  Showcase your skills with real, categorized projects recruiters care about in 3D layouts.
                </p>
              </div>

              {/* Experience Tracker */}
              <div className="neo-glass-3d p-6 rounded-lg transition-3d hover:scale-105 magnetic glow-blue perspective-1000 gpu-accelerated">
                <div className="flex items-center mb-4">
                  <Calendar className="h-8 w-8 text-orange-400 mr-3 float" style={{ animationDelay: '1.2s' }} />
                  <h3 className="text-xl font-semibold text-white">Experience Tracker</h3>
                </div>
                <p className="text-gray-300 leading-relaxed">
                  Add internships, jobs, and learnings — everything that shapes your journey with timeline visualization.
                </p>
              </div>

              {/* Goal Planner */}
              <div className="neo-glass-3d p-6 rounded-lg transition-3d hover:scale-105 magnetic glow-purple perspective-1000 gpu-accelerated">
                <div className="flex items-center mb-4">
                  <Target className="h-8 w-8 text-red-400 mr-3 float" style={{ animationDelay: '1.4s' }} />
                  <h3 className="text-xl font-semibold text-white">Goal Planner</h3>
                </div>
                <p className="text-gray-300 leading-relaxed">
                  Set career goals and let AI guide you step-by-step to reach them with interactive roadmaps.
                </p>
              </div>

              {/* XP Quests */}
              <div className="neo-glass-3d p-6 rounded-lg transition-3d hover:scale-105 magnetic glow-blue perspective-1000 gpu-accelerated">
                <div className="flex items-center mb-4">
                  <Trophy className="h-8 w-8 text-gold-400 mr-3 float" style={{ animationDelay: '1.6s' }} />
                  <h3 className="text-xl font-semibold text-white">XP Quests</h3>
                </div>
                <p className="text-gray-300 leading-relaxed">
                  Level up your career with gamified challenges and win badges as you grow with 3D rewards.
                </p>
              </div>

              {/* Job Radar */}
              <div className="neo-glass-3d p-6 rounded-lg transition-3d hover:scale-105 magnetic glow-purple perspective-1000 gpu-accelerated">
                <div className="flex items-center mb-4">
                  <Search className="h-8 w-8 text-indigo-400 mr-3 float" style={{ animationDelay: '1.8s' }} />
                  <h3 className="text-xl font-semibold text-white">Job Radar</h3>
                </div>
                <p className="text-gray-300 leading-relaxed">
                  Get alerts for jobs, collaborations, and career opportunities in your domain with immersive scanning.
                </p>
              </div>

              {/* Real Feedback */}
              <div className="neo-glass-3d p-6 rounded-lg transition-3d hover:scale-105 magnetic glow-blue perspective-1000 gpu-accelerated">
                <div className="flex items-center mb-4">
                  <Heart className="h-8 w-8 text-rose-400 mr-3 float" style={{ animationDelay: '2s' }} />
                  <h3 className="text-xl font-semibold text-white">Real Feedback</h3>
                </div>
                <p className="text-gray-300 leading-relaxed">
                  Get reactions and endorsements that boost your credibility — not just likes, with emotional analytics.
                </p>
              </div>

              {/* Insight Feed */}
              <div className="neo-glass-3d p-6 rounded-lg transition-3d hover:scale-105 magnetic glow-purple perspective-1000 gpu-accelerated">
                <div className="flex items-center mb-4">
                  <Newspaper className="h-8 w-8 text-emerald-400 mr-3 float" style={{ animationDelay: '2.2s' }} />
                  <h3 className="text-xl font-semibold text-white">Insight Feed</h3>
                </div>
                <p className="text-gray-300 leading-relaxed">
                  Stay ahead with personalized industry news, tips, and AI-powered posts in immersive format.
                </p>
              </div>
            </div>
          </NeoGlassSection>

          {/* Call to Action */}
          <NeoGlassSection className="text-center mb-20">
            <div className="space-y-6 transform-3d">
              <h2 className="text-3xl font-bold text-white holographic">
                Ready to Transform Your Career with 3D AI?
              </h2>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                Join thousands of professionals who are already accelerating their careers with our advanced 3D AI-powered insights
              </p>
              {!isAuthenticated && (
                <Button 
                  onClick={handleCTAClick}
                  disabled={isLoading}
                  size="lg"
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-12 py-4 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 button-3d glow-multi magnetic"
                >
                  {isLoading ? "Loading..." : "Start Your 3D Journey"}
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