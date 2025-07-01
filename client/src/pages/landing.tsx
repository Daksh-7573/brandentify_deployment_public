import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { NeoGlassLayout, NeoGlassSection } from "@/components/layout/neo-glass-layout";
import { ArrowRight, Sparkles, Target, Users, Brain, Zap, FileText, TrendingUp, Building, Calendar, Trophy, Search, Heart, Newspaper, MessageCircle } from "lucide-react";
import backgroundImage from "@assets/Brandentifier Landing_1751376023002.png";
// import RobotCompanion from "@/components/landing/robot-companion";
// import FloatingParticles from "@/components/landing/floating-particles";
// import InteractiveCard from "@/components/landing/interactive-card";
// import ParallaxBackground from "@/components/landing/parallax-background";
import "@/styles/landing-3d.css";

export default function Landing() {
  const { isLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();
  
  const [_, setLocation] = useLocation();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [currentSection, setCurrentSection] = useState('default');

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

  // Mouse tracking for interactive effects
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Intersection observer for section tracking
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const sectionId = entry.target.getAttribute('data-section');
            if (sectionId) {
              setCurrentSection(sectionId);
            }
          }
        });
      },
      { threshold: 0.3 }
    );

    const sections = document.querySelectorAll('[data-section]');
    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  if (isAuthenticated && !stayOnLanding) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen w-full relative overflow-hidden"
      style={{ perspective: '1000px' }}
    >
      {/* Advanced Parallax Background - CSS Only */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Dynamic gradient background */}
        <div 
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(135deg, hsl(220, 50%, 15%) 0%, hsl(250, 60%, 10%) 50%, hsl(200, 55%, 8%) 100%)'
          }}
        />
        
        {/* Animated background orbs */}
        <div className="absolute top-20 left-1/4 w-64 h-64 bg-gradient-to-br from-blue-500/10 to-transparent rounded-full blur-3xl opacity-20" />
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-gradient-to-br from-purple-500/10 to-transparent rounded-full blur-3xl opacity-20" />
        <div className="absolute top-1/3 right-1/3 w-48 h-48 bg-gradient-to-br from-cyan-500/10 to-transparent rounded-full blur-2xl opacity-30" />
      </div>
      
      {/* Enhanced Floating Particles */}
      <div className="fixed inset-0 pointer-events-none z-10">
        {/* Floating orbs */}
        <div className="absolute top-20 left-10 w-4 h-4 bg-blue-400/30 rounded-full animate-pulse float-animation shadow-lg shadow-blue-400/20"></div>
        <div className="absolute top-40 right-20 w-6 h-6 bg-purple-400/20 rounded-lg rotate-45 float-rotate-animation shadow-lg shadow-purple-400/20"></div>
        <div className="absolute bottom-40 left-20 w-3 h-3 bg-pink-400/40 rounded-full pulse-3d" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-60 left-1/2 w-5 h-5 bg-yellow-400/30 rounded-full float-animation shadow-lg shadow-yellow-400/20" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-60 right-10 w-4 h-4 bg-green-400/25 rounded-lg rotate-12 pulse-3d shadow-lg shadow-green-400/20" style={{ animationDelay: '1.5s' }}></div>
        
        {/* Additional geometric shapes */}
        <div className="absolute top-32 left-1/3 w-2 h-8 bg-cyan-400/20 rounded-full rotate-45 float-animation" style={{ animationDelay: '0.5s' }}></div>
        <div className="absolute bottom-32 right-1/3 w-6 h-2 bg-indigo-400/30 rounded-full rotate-12 float-rotate-animation"></div>
        <div className="absolute top-1/2 left-20 w-3 h-3 border-2 border-blue-300/30 rotate-45 animate-spin" style={{ animationDuration: '8s' }}></div>
        <div className="absolute top-1/4 right-40 w-4 h-4 border border-purple-300/40 rounded-full animate-ping" style={{ animationDelay: '3s' }}></div>
        <div className="absolute bottom-1/4 left-1/4 w-2 h-2 bg-pink-300/50 animate-bounce" style={{ animationDelay: '2.5s' }}></div>
      </div>
      
      {/* Original background image as overlay */}
      <div 
        className="absolute inset-0 opacity-20 mix-blend-overlay"
        style={{ 
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      />
      
      {/* Content layer */}
      <div className="relative z-20">
        <NeoGlassLayout className="mt-0 pt-4 px-4 min-h-screen flex flex-col justify-start py-8">
          {/* Hero Section */}
          <NeoGlassSection className="text-center mb-12" data-section="default">
          <div className="space-y-6"
               onMouseEnter={() => setIsHovering(true)}
               onMouseLeave={() => setIsHovering(false)}>
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Sparkles className="h-8 w-8 text-blue-400 animate-pulse" />
              <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent transform transition-all duration-300 hover:scale-105">
                Brandentifier
              </h1>
              <Sparkles className="h-8 w-8 text-purple-400 animate-pulse" style={{ animationDelay: '0.5s' }} />
            </div>
            
            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Your AI Career Buddy is Ready! 🚀 Transform your professional journey with intelligent insights, 
              epic networking, and guidance so good it feels like magic ✨
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
        <NeoGlassSection title="What Makes Us Awesome! 🎯" className="mb-16" data-section="features">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {/* Career Clarity - Enhanced 3D */}
            <div className="relative group perspective-1000">
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg blur-xl opacity-0 group-hover:opacity-60 transition-opacity duration-300" />
              
              {/* Main card */}
              <div className="relative neo-glass-card p-6 rounded-lg transition-all duration-300 cursor-pointer transform-gpu hover:scale-105 hover:rotate-y-5 hover:rotate-x-5 hover:translate-z-20 card-3d"
                   style={{ transformStyle: 'preserve-3d', backfaceVisibility: 'hidden' }}>
                <div className="relative z-10">
                  <div className="flex items-center mb-4">
                    <div className="mr-3 text-4xl transform transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12 float-animation">
                      <Brain className="h-8 w-8 text-blue-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-white">Career Clarity</h3>
                  </div>
                  <p className="text-gray-300 leading-relaxed">
                    Confused about your next move? Your AI buddy has got your back! Get smart, personalized career advice that actually makes sense 🎯
                  </p>
                  <div className="absolute bottom-4 right-4 w-2 h-2 bg-blue-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse" />
                </div>
                
                {/* 3D depth layer */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                     style={{ transform: 'translateZ(5px)' }} />
              </div>
            </div>

            {/* AI Mentorship - Enhanced 3D */}
            <div className="relative group perspective-1000">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg blur-xl opacity-0 group-hover:opacity-60 transition-opacity duration-300" />
              <div className="relative neo-glass-card p-6 rounded-lg transition-all duration-300 cursor-pointer transform-gpu hover:scale-105 hover:rotate-y-5 hover:rotate-x-5 hover:translate-z-20 card-3d"
                   style={{ transformStyle: 'preserve-3d', backfaceVisibility: 'hidden' }}>
                <div className="relative z-10">
                  <div className="flex items-center mb-4">
                    <div className="mr-3 text-4xl transform transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12 float-animation" style={{ animationDelay: '0.5s' }}>
                      <MessageCircle className="h-8 w-8 text-purple-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-white">AI Mentorship</h3>
                  </div>
                  <p className="text-gray-300 leading-relaxed">
                    Meet your 24/7 career coach! Our AI mentor knows your industry inside-out and gives advice that actually works 🤖✨
                  </p>
                  <div className="absolute bottom-4 right-4 w-2 h-2 bg-purple-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                     style={{ transform: 'translateZ(5px)' }} />
              </div>
            </div>

            {/* Smart Resume - Enhanced 3D */}
            <div className="relative group perspective-1000">
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-lg blur-xl opacity-0 group-hover:opacity-60 transition-opacity duration-300" />
              <div className="relative neo-glass-card p-6 rounded-lg transition-all duration-300 cursor-pointer transform-gpu hover:scale-105 hover:rotate-y-5 hover:rotate-x-5 hover:translate-z-20 card-3d"
                   style={{ transformStyle: 'preserve-3d', backfaceVisibility: 'hidden' }}>
                <div className="relative z-10">
                  <div className="flex items-center mb-4">
                    <div className="mr-3 text-4xl transform transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12 float-animation" style={{ animationDelay: '1s' }}>
                      <FileText className="h-8 w-8 text-green-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-white">Smart Resume</h3>
                  </div>
                  <p className="text-gray-300 leading-relaxed">
                    Upload your resume and watch the magic happen! Get instant feedback, killer scoring, and styling tips that'll make recruiters go "WOW!" 📄✨
                  </p>
                  <div className="absolute bottom-4 right-4 w-2 h-2 bg-green-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                     style={{ transform: 'translateZ(5px)' }} />
              </div>
            </div>

            {/* Skill Matching - Enhanced 3D */}
            <div className="relative group perspective-1000">
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-lg blur-xl opacity-0 group-hover:opacity-60 transition-opacity duration-300" />
              <div className="relative neo-glass-card p-6 rounded-lg transition-all duration-300 cursor-pointer transform-gpu hover:scale-105 hover:rotate-y-5 hover:rotate-x-5 hover:translate-z-20 card-3d"
                   style={{ transformStyle: 'preserve-3d', backfaceVisibility: 'hidden' }}>
                <div className="relative z-10">
                  <div className="flex items-center mb-4">
                    <div className="mr-3 text-4xl transform transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12 float-animation" style={{ animationDelay: '1.5s' }}>
                      <TrendingUp className="h-8 w-8 text-yellow-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-white">Skill Matching</h3>
                  </div>
                  <p className="text-gray-300 leading-relaxed">
                    Discover exactly which superpowers you need to unlock for your dream career! No more guessing, just pure skill-matching genius 🎯🚀
                  </p>
                  <div className="absolute bottom-4 right-4 w-2 h-2 bg-yellow-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                     style={{ transform: 'translateZ(5px)' }} />
              </div>
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
        <NeoGlassSection className="text-center mb-20" data-section="cta">
          <div className="space-y-6"
               onMouseEnter={() => setCurrentSection('cta')}>
            <h2 className="text-3xl font-bold text-white transform transition-all duration-300 hover:scale-105">
              Ready to Absolutely Crush It? 🚀
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Join thousands of amazing professionals who are already living their best career life with our AI magic! 
              Your future self is gonna thank you ⭐
            </p>
            {!isAuthenticated && (
              <Button 
                onClick={() => setLocation('/auth')}
                disabled={isLoading}
                size="lg"
                className="neo-glass-button bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-12 py-4 rounded-lg font-semibold transition-all duration-300 transform hover:scale-110 hover:shadow-2xl hover:shadow-blue-500/25"
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
              >
                {isLoading ? "Loading..." : "Let's Go! Start My Journey 🎉"}
                <ArrowRight className="ml-2 h-6 w-6" />
              </Button>
            )}
          </div>
          </NeoGlassSection>

        {/* CSS Robot Companion */}
        <div className="fixed bottom-8 right-8 z-50 pointer-events-none select-none">
          {/* Speech Bubble */}
          <div className="absolute bottom-full right-0 mb-4 mr-4 bg-white/90 backdrop-blur-sm text-gray-800 px-4 py-2 rounded-2xl shadow-lg max-w-xs text-sm font-medium border border-white/20 animate-pulse"
               style={{ clipPath: 'polygon(0% 0%, 100% 0%, 100% 75%, 85% 75%, 85% 100%, 75% 75%, 0% 75%)' }}>
            Ready to boost your career? Let's go! 🚀
          </div>

          {/* Robot Body */}
          <div className="relative w-20 h-24 transform-gpu float-animation hover-glow"
               style={{ filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.3))' }}>
            {/* Robot Head */}
            <div className="relative w-16 h-16 mx-auto bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl shadow-lg">
              {/* Eyes */}
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                <div className="w-3 h-3 bg-white rounded-full flex items-center justify-center">
                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-ping"></div>
                </div>
                <div className="w-3 h-3 bg-white rounded-full flex items-center justify-center">
                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
                </div>
              </div>

              {/* Mouth */}
              <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 w-6 h-1 bg-white rounded-full opacity-80"></div>

              {/* Antenna */}
              <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-0.5 h-4 bg-gray-300 rounded-full">
                <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
              </div>
            </div>

            {/* Robot Body */}
            <div className="relative w-12 h-8 mx-auto mt-1 bg-gradient-to-br from-gray-300 to-gray-400 rounded-lg">
              {/* Chest Panel */}
              <div className="absolute top-1 left-1/2 transform -translate-x-1/2 w-6 h-2 bg-blue-500 rounded opacity-80"></div>
              {/* Status Lights */}
              <div className="absolute bottom-1 left-2 w-1 h-1 bg-green-400 rounded-full animate-pulse"></div>
              <div className="absolute bottom-1 right-2 w-1 h-1 bg-yellow-400 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
            </div>
          </div>
        </div>
        </NeoGlassLayout>
      </div>
    </div>
  );
}