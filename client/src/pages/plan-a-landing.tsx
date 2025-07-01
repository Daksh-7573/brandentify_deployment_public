import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useEffect, useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { ArrowRight, Sparkles, Target, Users, Brain, Zap, FileText, TrendingUp, Building, Calendar, Trophy, Search, Heart, Newspaper, MessageCircle } from "lucide-react";
import backgroundImage from "@assets/Brandentifier Landing_1751376023002.png";

// 3D Components
import { AdaptiveRobot } from "@/components/3d/adaptive-robot";
import { ParticleSystem } from "@/components/3d/particle-system";
import { EnhancedFeatureCard } from "@/components/3d/enhanced-feature-card";
import { ScrollNarrativeSystem } from "@/components/3d/scroll-narrative-system";
import { EntranceChoreography } from "@/components/3d/entrance-choreography";

export default function PlanALanding() {
  const { isLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [_, setLocation] = useLocation();
  
  // 3D interaction states
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [robotInteractions, setRobotInteractions] = useState({
    onEnter: false,
    onHover: false,
    onFeaturePoint: false,
    onCelebrate: false
  });
  const [storyProgress, setStoryProgress] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Check if user wants to stay on landing page
  const urlParams = new URLSearchParams(window.location.search);
  const stayOnLanding = urlParams.get('stay') === 'true';

  // Mouse tracking for 3D effects
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    const handleMouseEnter = () => {
      setRobotInteractions(prev => ({ ...prev, onEnter: true }));
      setTimeout(() => setRobotInteractions(prev => ({ ...prev, onEnter: false })), 1000);
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseenter', handleMouseEnter, { once: true });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, []);

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (isAuthenticated && !stayOnLanding) {
      const timer = setTimeout(() => {
        setLocation('/industry-pulse');
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, setLocation, stayOnLanding]);

  const handleFeatureHover = () => {
    setRobotInteractions(prev => ({ ...prev, onFeaturePoint: true }));
    setTimeout(() => setRobotInteractions(prev => ({ ...prev, onFeaturePoint: false })), 2500);
  };

  const handleCTAClick = () => {
    setRobotInteractions(prev => ({ ...prev, onCelebrate: true }));
    setTimeout(() => {
      setRobotInteractions(prev => ({ ...prev, onCelebrate: false }));
      setLocation('/auth');
    }, 1000);
  };

  if (isAuthenticated && !stayOnLanding) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  const features = [
    {
      icon: Brain,
      title: "Career Clarity",
      description: "Confused about your next move? Get smart, personalized career advice instantly.",
      color: "#3B82F6"
    },
    {
      icon: MessageCircle,
      title: "AI Mentorship",
      description: "Talk to AI mentors modeled after industry legends — anytime, anywhere.",
      color: "#8B5CF6"
    },
    {
      icon: FileText,
      title: "Smart Resume",
      description: "Upload your resume and get instant feedback, scoring, and styling tips.",
      color: "#10B981"
    },
    {
      icon: TrendingUp,
      title: "Skill Matching",
      description: "Find out which skills you need to grow in your dream career path.",
      color: "#F59E0B"
    },
    {
      icon: Users,
      title: "Pro Network",
      description: "Build a professional network that actually helps — not just connects.",
      color: "#EC4899"
    },
    {
      icon: Building,
      title: "Portfolio Builder",
      description: "Showcase your skills with real, categorized projects recruiters care about.",
      color: "#06B6D4"
    },
    {
      icon: Calendar,
      title: "Experience Tracker",
      description: "Add internships, jobs, and learnings — everything that shapes your journey.",
      color: "#F97316"
    },
    {
      icon: Target,
      title: "Goal Planner",
      description: "Set career goals and let AI guide you step-by-step to reach them.",
      color: "#EF4444"
    },
    {
      icon: Trophy,
      title: "XP Quests",
      description: "Level up your career with gamified challenges and win badges as you grow.",
      color: "#EAB308"
    },
    {
      icon: Search,
      title: "Job Radar",
      description: "Get alerts for jobs, collaborations, and career opportunities in your domain.",
      color: "#6366F1"
    },
    {
      icon: Heart,
      title: "Real Feedback",
      description: "Get reactions and endorsements that boost your credibility — not just likes.",
      color: "#F43F5E"
    },
    {
      icon: Newspaper,
      title: "Insight Feed",
      description: "Stay ahead with personalized industry news, tips, and AI-powered posts.",
      color: "#059669"
    }
  ];

  return (
    <div 
      ref={containerRef}
      className="responsive-background min-h-screen w-full relative overflow-hidden"
      style={{ 
        backgroundImage: `url(${backgroundImage})`
      }}
    >
      {/* Background overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900/80 via-black/70 to-gray-800/80 backdrop-blur-sm"></div>
      
      {/* Particle System Background */}
      <ParticleSystem 
        containerRef={containerRef}
        mousePosition={mousePosition}
        particleCount={150}
        colorScheme="multi"
      />

      {/* Main Content with Entrance Choreography */}
      <EntranceChoreography>
        <ScrollNarrativeSystem 
          onStoryProgress={setStoryProgress}
        >
          <div className="relative z-20 min-h-screen">
            
            {/* Floating Robot Assistant */}
            <div className="fixed top-1/2 right-8 transform -translate-y-1/2 z-30" data-float-continuous>
              <AdaptiveRobot 
                containerRef={containerRef}
                mousePosition={mousePosition}
                interactions={robotInteractions}
              />
            </div>

            {/* Hero Section */}
            <div 
              className="container mx-auto px-4 py-24 min-h-screen flex flex-col justify-center"
              data-section
              data-animation="fadeUp"
            >
              <div className="neo-glass-panel rounded-lg p-8 mb-10 text-center" data-magnetic="0.1">
                <div className="space-y-6">
                  <div className="flex items-center justify-center space-x-2 mb-4" data-hero>
                    <Sparkles className="h-8 w-8 text-blue-400" data-float-continuous />
                    <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                      Brandentifier
                    </h1>
                    <Sparkles className="h-8 w-8 text-purple-400" data-float-continuous />
                  </div>
                  
                  <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed" data-hero>
                    AI-Powered Career Development Platform that transforms your professional journey with intelligent insights and personalized guidance
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8" data-hero>
                    {isAuthenticated ? (
                      <Button 
                        onClick={() => setLocation('/industry-pulse')}
                        size="lg"
                        className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105"
                        data-cta
                        data-magnetic="0.2"
                      >
                        Go to Dashboard
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                    ) : (
                      <Button 
                        onClick={handleCTAClick}
                        disabled={isLoading}
                        size="lg"
                        className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105"
                        data-cta
                        data-magnetic="0.2"
                      >
                        {isLoading ? "Loading..." : "Get Started"}
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Features Section */}
            <div 
              className="container mx-auto px-4 py-16"
              data-section
              data-animation="scale"
            >
              <div className="neo-glass-panel rounded-lg p-8">
                <h2 className="text-3xl font-bold text-white text-center mb-12" data-parallax="0.1">
                  Platform Features
                </h2>
                
                <div 
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                  data-cards
                >
                  {features.map((feature, index) => (
                    <div key={feature.title} data-card data-feature-card>
                      <EnhancedFeatureCard
                        icon={feature.icon}
                        title={feature.title}
                        description={feature.description}
                        color={feature.color}
                        onHover={handleFeatureHover}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Call to Action Section */}
            <div 
              className="container mx-auto px-4 py-20"
              data-section
              data-animation="rotate"
            >
              <div className="neo-glass-panel rounded-lg p-8 text-center" data-magnetic="0.15">
                <div className="space-y-6">
                  <h2 className="text-3xl font-bold text-white" data-cta>
                    Ready to Transform Your Career?
                  </h2>
                  <p className="text-xl text-gray-300 max-w-2xl mx-auto" data-cta>
                    Join thousands of professionals who are already accelerating their careers with AI-powered insights
                  </p>
                  {!isAuthenticated && (
                    <Button 
                      onClick={handleCTAClick}
                      disabled={isLoading}
                      size="lg"
                      className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-12 py-4 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105"
                      data-cta
                      data-magnetic="0.3"
                    >
                      {isLoading ? "Loading..." : "Start Your Journey"}
                      <ArrowRight className="ml-2 h-6 w-6" />
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Footer spacer */}
            <div className="h-20"></div>
          </div>
        </ScrollNarrativeSystem>
      </EntranceChoreography>
    </div>
  );
}