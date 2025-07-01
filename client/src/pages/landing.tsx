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
      
      {/* Floating Particles - CSS Only */}
      <div className="fixed inset-0 pointer-events-none z-10">
        <div className="absolute top-20 left-10 w-4 h-4 bg-blue-400/30 rounded-full animate-pulse float-animation"></div>
        <div className="absolute top-40 right-20 w-6 h-6 bg-purple-400/20 rounded-lg rotate-45 float-rotate-animation"></div>
        <div className="absolute bottom-40 left-20 w-3 h-3 bg-pink-400/40 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-60 left-1/2 w-5 h-5 bg-yellow-400/30 rounded-full float-animation" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-60 right-10 w-4 h-4 bg-green-400/25 rounded-lg rotate-12 animate-pulse" style={{ animationDelay: '1.5s' }}></div>
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
            {/* Career Clarity */}
            <div className="neo-glass-card p-6 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer group">
              <div className="flex items-center mb-4">
                <Brain className="h-8 w-8 text-blue-400 mr-3 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12" />
                <h3 className="text-xl font-semibold text-white">Career Clarity</h3>
              </div>
              <p className="text-gray-300 leading-relaxed">
                Confused about your next move? Your AI buddy has got your back! Get smart, personalized career advice that actually makes sense 🎯
              </p>
            </div>

            {/* AI Mentorship */}
            <div className="neo-glass-card p-6 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer group">
              <div className="flex items-center mb-4">
                <MessageCircle className="h-8 w-8 text-purple-400 mr-3 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12" />
                <h3 className="text-xl font-semibold text-white">AI Mentorship</h3>
              </div>
              <p className="text-gray-300 leading-relaxed">
                Meet your 24/7 career coach! Our AI mentor knows your industry inside-out and gives advice that actually works 🤖✨
              </p>
            </div>

            {/* Smart Resume */}
            <div className="neo-glass-card p-6 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer group">
              <div className="flex items-center mb-4">
                <FileText className="h-8 w-8 text-green-400 mr-3 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12" />
                <h3 className="text-xl font-semibold text-white">Smart Resume</h3>
              </div>
              <p className="text-gray-300 leading-relaxed">
                Upload your resume and watch the magic happen! Get instant feedback, killer scoring, and styling tips that'll make recruiters go "WOW!" 📄✨
              </p>
            </div>

            {/* Skill Matching */}
            <div className="neo-glass-card p-6 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer group">
              <div className="flex items-center mb-4">
                <TrendingUp className="h-8 w-8 text-yellow-400 mr-3 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12" />
                <h3 className="text-xl font-semibold text-white">Skill Matching</h3>
              </div>
              <p className="text-gray-300 leading-relaxed">
                Discover exactly which superpowers you need to unlock for your dream career! No more guessing, just pure skill-matching genius 🎯🚀
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

        {/* Robot Companion - Coming Soon */}
        {/* <RobotCompanion 
          mousePosition={mousePosition}
          isHovering={isHovering}
          currentSection={currentSection}
        /> */}
        </NeoGlassLayout>
      </div>
    </div>
  );
}