import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, AlertCircle, Sparkles, ArrowRight, Clock } from "lucide-react";
import backgroundImage from "@assets/Brandentifier Landing_1751376023002.png";

export default function PortfolioPreviewInterstitial() {
  const { user } = useAuth();
  const [_, setLocation] = useLocation();
  const [isSkipping, setIsSkipping] = useState(false);

  const userIdentifier = user?.id?.toString() || user?.username || user?.uid || '';

  // Fetch user data
  const { data: userData, isLoading: isUserLoading } = useQuery({
    queryKey: ['/api/users', userIdentifier],
    enabled: !!userIdentifier,
  });

  // Fetch experiences
  const { data: experiences = [], isLoading: isExpLoading } = useQuery({
    queryKey: ['/api/work-experiences', userIdentifier],
    enabled: !!userIdentifier,
  });

  // Fetch education
  const { data: educations = [], isLoading: isEduLoading } = useQuery({
    queryKey: ['/api/educations', userIdentifier],
    enabled: !!userIdentifier,
  });

  // Fetch projects
  const { data: projects = [], isLoading: isProjLoading } = useQuery({
    queryKey: ['/api/projects', userIdentifier],
    enabled: !!userIdentifier,
  });

  // Fetch skills
  const { data: skills = [], isLoading: isSkillsLoading } = useQuery({
    queryKey: ['/api/skills', userIdentifier],
    enabled: !!userIdentifier,
  });

  const isLoading = isUserLoading || isExpLoading || isEduLoading || isProjLoading || isSkillsLoading;

  // Calculate honest portfolio quality score
  const calculatePortfolioQuality = () => {
    let score = 0;
    
    // Basic info (max 50%)
    if (userData?.name) score += 8;
    if (userData?.photoURL) score += 8;
    if (userData?.title) score += 8;
    if (userData?.location) score += 8;
    if (userData?.industry) score += 8;
    if (userData?.lookingFor) score += 5;
    if (userData?.tagline) score += 5;
    
    // Portfolio sections (max 50%)
    if (experiences.length > 0) score += 15;
    if (educations.length > 0) score += 12;
    if (projects.length > 0) score += 15;
    if (skills.length >= 3) score += 8;
    
    return Math.min(score, 100);
  };

  const portfolioQuality = calculatePortfolioQuality();

  const checklistItems = [
    { 
      label: "Basic Info", 
      status: userData?.name && userData?.title && userData?.industry ? "complete" : "partial",
      detail: "Name, job title, industry"
    },
    { 
      label: "Work Experience", 
      status: experiences.length > 0 ? "complete" : "missing",
      detail: experiences.length > 0 ? `${experiences.length} added` : "Add your professional history"
    },
    { 
      label: "Education", 
      status: educations.length > 0 ? "complete" : "missing",
      detail: educations.length > 0 ? `${educations.length} added` : "Add your academic background"
    },
    { 
      label: "Projects", 
      status: projects.length > 0 ? "complete" : "missing",
      detail: projects.length > 0 ? `${projects.length} added` : "Showcase your work"
    },
    { 
      label: "Skills", 
      status: skills.length >= 3 ? "complete" : skills.length > 0 ? "partial" : "missing",
      detail: skills.length >= 3 ? `${skills.length} skills added` : `Add ${3 - skills.length} more skills`
    },
  ];

  const handleCompleteNow = () => {
    setLocation('/guided-portfolio');
  };

  const handleDoLater = () => {
    setIsSkipping(true);
    setTimeout(() => {
      setLocation('/brand-quests');
    }, 300);
  };

  if (!user) {
    setLocation('/auth');
    return null;
  }

  if (isLoading) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center"
        style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <div className="text-white text-lg">Loading your portfolio preview...</div>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    if (status === "complete") return <CheckCircle2 className="h-5 w-5 text-green-400" />;
    if (status === "partial") return <AlertCircle className="h-5 w-5 text-yellow-400" />;
    return <XCircle className="h-5 w-5 text-red-400" />;
  };

  const getStatusColor = (status: string) => {
    if (status === "complete") return "text-green-400";
    if (status === "partial") return "text-yellow-400";
    return "text-red-400";
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-6"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className="w-full max-w-4xl">
        {/* Main Card */}
        <div className="backdrop-blur-xl bg-[rgba(18,18,18,0.95)] border border-white/20 rounded-3xl shadow-2xl p-8 md:p-12">
          
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/30 mb-4">
              <Sparkles className="h-8 w-8 text-purple-400" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
              Your Portfolio Preview
            </h1>
            <p className="text-white/70 text-lg">
              Let's see how your professional portfolio looks
            </p>
          </div>

          {/* Portfolio Quality Score */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <span className="text-white font-medium">Portfolio Strength</span>
              <span className={`text-2xl font-bold ${
                portfolioQuality >= 70 ? 'text-green-400' : 
                portfolioQuality >= 40 ? 'text-yellow-400' : 
                'text-red-400'
              }`}>
                {portfolioQuality}%
              </span>
            </div>
            
            {/* Progress Bar */}
            <div className="h-3 bg-white/10 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-1000 ${
                  portfolioQuality >= 70 ? 'bg-gradient-to-r from-green-500 to-emerald-400' : 
                  portfolioQuality >= 40 ? 'bg-gradient-to-r from-yellow-500 to-amber-400' : 
                  'bg-gradient-to-r from-red-500 to-orange-400'
                }`}
                style={{ width: `${portfolioQuality}%` }}
              />
            </div>
            
            {/* Status Message */}
            <p className="text-white/60 text-sm mt-2">
              {portfolioQuality >= 70 
                ? "Great! Your portfolio is looking strong." 
                : portfolioQuality >= 40 
                ? "Getting there! Add more sections to strengthen your portfolio." 
                : "⚠️ Your portfolio needs more content to make an impact."}
            </p>
          </div>

          {/* Checklist */}
          <div className="space-y-4 mb-8">
            {checklistItems.map((item, index) => (
              <div 
                key={index}
                className="flex items-start gap-3 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
              >
                <div className="mt-0.5">
                  {getStatusIcon(item.status)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`font-medium ${getStatusColor(item.status)}`}>
                      {item.label}
                    </span>
                    {item.status === "complete" && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-400">
                        Complete
                      </span>
                    )}
                  </div>
                  <p className="text-white/60 text-sm">{item.detail}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Warning Banner for Low Completion */}
          {portfolioQuality < 50 && (
            <div className="mb-8 p-4 rounded-xl bg-red-500/10 border border-red-500/30">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-red-400 font-medium mb-1">Portfolio Not Ready</p>
                  <p className="text-white/70 text-sm">
                    Your portfolio is {portfolioQuality}% complete. To unlock advanced Brand Quests and create a professional presence, complete your portfolio sections now.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* CTAs */}
          <div className="grid md:grid-cols-2 gap-4">
            <Button
              onClick={handleCompleteNow}
              className="w-full h-14 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all"
              data-testid="button-complete-portfolio-now"
            >
              <Sparkles className="h-5 w-5 mr-2" />
              Complete Portfolio Now
              <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-white/20">
                ~20 min
              </span>
            </Button>
            
            <Button
              onClick={handleDoLater}
              disabled={isSkipping}
              variant="outline"
              className="w-full h-14 border-white/20 hover:bg-white/10 text-white font-semibold text-lg rounded-xl transition-all"
              data-testid="button-do-later"
            >
              {isSkipping ? (
                <>
                  <Clock className="h-5 w-5 mr-2 animate-spin" />
                  Redirecting...
                </>
              ) : (
                <>
                  Do This Later
                  <ArrowRight className="h-5 w-5 ml-2" />
                </>
              )}
            </Button>
          </div>

          {/* Footer Note */}
          <p className="text-center text-white/50 text-sm mt-6">
            {portfolioQuality < 50 
              ? "💡 Complete your portfolio to unlock all Brand Quests and features" 
              : "You can always update your portfolio from your profile page"}
          </p>
        </div>
      </div>
    </div>
  );
}
