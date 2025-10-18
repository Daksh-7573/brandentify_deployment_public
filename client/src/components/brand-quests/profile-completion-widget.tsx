import { useContext } from "react";
import { useLocation } from "wouter";
import { AuthContext } from "@/context/simple-auth-context";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { X, ChevronRight, Trophy, Sparkles, Briefcase, GraduationCap, FolderOpen } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

interface ProfileCompletionWidgetProps {
  userId: number;
  className?: string;
}

export function ProfileCompletionWidget({ userId, className = "" }: ProfileCompletionWidgetProps) {
  const [_, setLocation] = useLocation();
  const [isDismissed, setIsDismissed] = useState(false);
  const { user } = useContext(AuthContext);

  const userIdentifier = userId?.toString() || user?.id?.toString() || user?.username || user?.uid || '';

  // Fetch actual portfolio data
  const { data: userData } = useQuery({
    queryKey: ['/api/users', userIdentifier],
    enabled: !!userIdentifier,
  });

  const { data: experiences = [] } = useQuery({
    queryKey: ['/api/work-experiences', userIdentifier],
    enabled: !!userIdentifier,
  });

  const { data: educations = [] } = useQuery({
    queryKey: ['/api/educations', userIdentifier],
    enabled: !!userIdentifier,
  });

  const { data: projects = [] } = useQuery({
    queryKey: ['/api/projects', userIdentifier],
    enabled: !!userIdentifier,
  });

  const { data: skills = [] } = useQuery({
    queryKey: ['/api/skills', userIdentifier],
    enabled: !!userIdentifier,
  });

  // Calculate HONEST portfolio quality
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

  // Don't show if dismissed or portfolio is very strong
  if (isDismissed || portfolioQuality >= 85) {
    return null;
  }

  // Determine what's missing and what to prioritize
  const getMissingSection = () => {
    if (experiences.length === 0) {
      return {
        section: "Work Experience",
        icon: Briefcase,
        action: "Add Work Experience",
        benefit: "Unlock professional quest",
        route: "/guided-portfolio"
      };
    } else if (projects.length === 0) {
      return {
        section: "Projects",
        icon: FolderOpen,
        action: "Add a Project",
        benefit: "Showcase your skills",
        route: "/guided-portfolio"
      };
    } else if (educations.length === 0) {
      return {
        section: "Education",
        icon: GraduationCap,
        action: "Add Education",
        benefit: "Complete your background",
        route: "/guided-portfolio"
      };
    } else {
      return {
        section: "Portfolio",
        icon: Sparkles,
        action: "Enhance Portfolio",
        benefit: "Unlock advanced quests",
        route: "/profile"
      };
    }
  };

  const nextAction = getMissingSection();

  return (
    <div className={`neo-glass-panel border border-white/10 rounded-lg p-4 ${className}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-yellow-400" />
          <h3 className="text-white font-semibold">Unlock Better Quests</h3>
        </div>
        <button
          onClick={() => setIsDismissed(true)}
          className="text-white/40 hover:text-white/80 transition-colors"
          data-testid="button-dismiss-widget"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-white/70 text-sm">Portfolio Quality</span>
          <span className={`font-medium ${
            portfolioQuality >= 70 ? 'text-green-400' : 
            portfolioQuality >= 40 ? 'text-yellow-400' : 
            'text-red-400'
          }`}>
            {portfolioQuality}%
          </span>
        </div>
        <Progress value={portfolioQuality} className="h-2" />
        <p className="text-white/50 text-xs mt-1">
          {portfolioQuality < 50 && "⚠️ Portfolio needs content"}
          {portfolioQuality >= 50 && portfolioQuality < 70 && "Getting better!"}
          {portfolioQuality >= 70 && "Looking strong!"}
        </p>
      </div>

      {/* What's Missing */}
      <div className="space-y-1.5 mb-4">
        <div className="flex items-center gap-2 text-sm">
          <div className={`w-2 h-2 rounded-full ${experiences.length > 0 ? 'bg-green-400' : 'bg-red-400'}`} />
          <span className={experiences.length > 0 ? 'text-white/90' : 'text-white/50'}>
            Work Experience {experiences.length > 0 && '✓'}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <div className={`w-2 h-2 rounded-full ${projects.length > 0 ? 'bg-green-400' : 'bg-red-400'}`} />
          <span className={projects.length > 0 ? 'text-white/90' : 'text-white/50'}>
            Projects {projects.length > 0 && '✓'}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <div className={`w-2 h-2 rounded-full ${educations.length > 0 ? 'bg-green-400' : 'bg-yellow-400'}`} />
          <span className={educations.length > 0 ? 'text-white/90' : 'text-white/50'}>
            Education {educations.length > 0 ? '✓' : '(Optional)'}
          </span>
        </div>
      </div>

      {/* Next Action CTA */}
      <div className="bg-purple-500/10 border border-purple-400/30 rounded-lg p-3 mb-3">
        <div className="flex items-start gap-2 mb-2">
          <nextAction.icon className="h-4 w-4 text-purple-400 mt-0.5" />
          <div className="flex-1">
            <div className="text-white/90 font-medium text-sm">{nextAction.action}</div>
            <div className="text-white/60 text-xs mt-0.5">{nextAction.benefit}</div>
          </div>
        </div>
      </div>

      <Button
        onClick={() => setLocation(nextAction.route)}
        className="w-full bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:border-white/30 transition-all"
        data-testid="button-complete-profile"
      >
        {nextAction.action}
        <ChevronRight className="h-4 w-4 ml-1" />
      </Button>

      <button
        onClick={() => setIsDismissed(true)}
        className="w-full text-center text-white/40 hover:text-white/60 text-xs mt-2 transition-colors"
      >
        Remind me later
      </button>
    </div>
  );
}
