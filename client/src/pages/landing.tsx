import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { NeoGlassLayout, NeoGlassSection } from "@/components/layout/neo-glass-layout";
import { ArrowRight, Sparkles, Target, Users, Brain, Zap, FileText, TrendingUp, Building, Calendar, Trophy, Search, Heart, Newspaper, MessageCircle } from "lucide-react";
import backgroundImage from "@assets/Brandentifier Landing_1751376023002.png";
import AdvancedRobotCompanion from "@/components/landing/advanced-robot-companion";
import AdvancedParticleSystem from "@/components/landing/advanced-particle-system";
import Advanced3DCard from "@/components/landing/advanced-3d-card";
import AdvancedParallaxBackground from "@/components/landing/advanced-parallax-background";
import EnhancedVisualEffects from "@/components/landing/enhanced-visual-effects";
import EntranceChoreography from "@/components/landing/entrance-choreography";
import ScrollNarrativeSystem from "@/components/landing/scroll-narrative-system";
import MicroInteractions from "@/components/landing/micro-interactions";
import "@/styles/landing-3d.css";

export default function Landing() {
  const { isLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();
  
  const [_, setLocation] = useLocation();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [currentSection, setCurrentSection] = useState('default');
  const [showEntranceChoreography, setShowEntranceChoreography] = useState(true);
  const [isMainContentVisible, setIsMainContentVisible] = useState(false);

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

  // Handle entrance choreography completion
  const handleEntranceComplete = () => {
    setShowEntranceChoreography(false);
    setIsMainContentVisible(true);
  };

  if (isAuthenticated && !stayOnLanding) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <ScrollNarrativeSystem onSectionChange={setCurrentSection}>
      <div 
        className="min-h-screen w-full relative overflow-hidden"
        style={{ perspective: '1000px' }}
      >
        {/* Entrance Choreography */}
        {showEntranceChoreography && (
          <EntranceChoreography onComplete={handleEntranceComplete} />
        )}

        {/* Enhanced Visual Effects */}
        <EnhancedVisualEffects mousePosition={mousePosition} isActive={isMainContentVisible} />
        
        {/* Micro Interactions */}
        <MicroInteractions mousePosition={mousePosition} isActive={isMainContentVisible} />

        {/* Advanced Multi-Layer Parallax Background */}
        <AdvancedParallaxBackground mousePosition={mousePosition} />
        
        {/* Advanced Particle System */}
        <AdvancedParticleSystem mousePosition={mousePosition} isActive={true} />
      
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
          <NeoGlassSection className="text-center mb-12" data-section="hero">
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            <Advanced3DCard
              icon={Brain}
              title="Career Clarity"
              description="Confused about your next move? Your AI buddy has got your back! Get smart, personalized career advice that actually makes sense 🎯"
              color="rgba(59, 130, 246, 0.8)"
              glowColor="rgba(59, 130, 246, 0.4)"
              delay={0}
              mousePosition={mousePosition}
              onHover={(isHovered) => setCurrentSection(isHovered ? 'features' : '')}
            />
            
            <Advanced3DCard
              icon={MessageCircle}
              title="AI Mentorship"
              description="Meet your 24/7 career coach! Our AI mentor knows your industry inside-out and gives advice that actually works 🤖✨"
              color="rgba(147, 51, 234, 0.8)"
              glowColor="rgba(147, 51, 234, 0.4)"
              delay={200}
              mousePosition={mousePosition}
            />
            
            <Advanced3DCard
              icon={FileText}
              title="Smart Resume"
              description="Upload your resume and watch the magic happen! Get instant feedback, killer scoring, and styling tips that'll make recruiters go 'WOW!' 📄✨"
              color="rgba(34, 197, 94, 0.8)"
              glowColor="rgba(34, 197, 94, 0.4)"
              delay={400}
              mousePosition={mousePosition}
            />
            
            <Advanced3DCard
              icon={TrendingUp}
              title="Skill Matching"
              description="Discover exactly which superpowers you need to unlock for your dream career! No more guessing, just pure skill-matching genius 🎯🚀"
              color="rgba(251, 191, 36, 0.8)"
              glowColor="rgba(251, 191, 36, 0.4)"
              delay={600}
              mousePosition={mousePosition}
            />

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

        {/* Advanced AI Robot Companion */}
        <AdvancedRobotCompanion 
          mousePosition={mousePosition} 
          currentSection={currentSection}
        />
        </NeoGlassLayout>
      </div>
      </div>
    </ScrollNarrativeSystem>
  );
}