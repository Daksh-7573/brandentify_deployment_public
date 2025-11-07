import { useQuery } from '@tanstack/react-query';
import { useUser } from '@/hooks/use-user';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, AlertCircle, TrendingUp, Lightbulb, Target } from 'lucide-react';
import backgroundImage from "@assets/Brandentifier Landing_1751376023002.png";
import Header from "@/components/layout/header";

interface BrandScoreComponent {
  name: string;
  score: number;
  maxScore: number;
  percentage: number;
  status: 'excellent' | 'good' | 'needs_improvement' | 'missing';
  suggestions: string[];
}

interface BrandScore {
  totalScore: number;
  maxScore: number;
  percentage: number;
  grade: 'A+' | 'A' | 'B+' | 'B' | 'C' | 'D' | 'F';
  components: {
    profileBasics: BrandScoreComponent;
    experience: BrandScoreComponent;
    education: BrandScoreComponent;
    skills: BrandScoreComponent;
    portfolio: BrandScoreComponent;
    engagement: BrandScoreComponent;
    network: BrandScoreComponent;
    goalsVision: BrandScoreComponent;
  };
  aiSuggestions: string[];
  lastUpdated: string;
}

export default function BrandScore() {
  const { user } = useUser();

  const { data: scoreData, isLoading } = useQuery<{ success: boolean; brandScore: BrandScore }>({
    queryKey: user?.id ? [`/api/brand-score/${user.id}`] : [],
    enabled: !!user?.id
  });

  const brandScore = scoreData?.brandScore;

  if (isLoading) {
    return (
      <div 
        className="flex h-screen flex-col responsive-background"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900/80 via-black/70 to-gray-800/80 backdrop-blur-sm"></div>
        <Header />
        <div className="flex flex-1 overflow-hidden pt-16 relative z-10">
          <div className="flex-1 overflow-auto w-full">
            <div className="max-w-6xl w-full mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-2 sm:py-4 md:py-6 lg:py-8">
              <Skeleton className="h-12 w-64 mb-6" />
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Skeleton className="h-96 lg:col-span-1" />
                <Skeleton className="h-96 lg:col-span-2" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!brandScore) {
    return (
      <div 
        className="flex h-screen flex-col responsive-background"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900/80 via-black/70 to-gray-800/80 backdrop-blur-sm"></div>
        <Header />
        <div className="flex flex-1 overflow-hidden pt-16 relative z-10 items-center justify-center">
          <Card className="glass p-8 text-center">
            <p className="text-white">Unable to load brand score</p>
          </Card>
        </div>
      </div>
    );
  }

  const getGradeColor = (grade: string) => {
    if (grade.startsWith('A')) return 'bg-gradient-to-r from-blue-400 to-purple-500';
    if (grade.startsWith('B')) return 'bg-gradient-to-r from-blue-400 to-purple-500';
    if (grade === 'C') return 'bg-gradient-to-r from-blue-400 to-purple-500';
    return 'bg-gradient-to-r from-gray-400 to-gray-500';
  };

  const getStatusIcon = (status: string) => {
    if (status === 'excellent') return <CheckCircle2 className="w-5 h-5 text-purple-400" />;
    if (status === 'good') return <TrendingUp className="w-5 h-5 text-blue-400" />;
    return <AlertCircle className="w-5 h-5 text-cyan-400" />;
  };

  const getStatusColor = (status: string) => {
    if (status === 'excellent') return 'text-purple-400';
    if (status === 'good') return 'text-blue-400';
    if (status === 'needs_improvement') return 'text-cyan-400';
    return 'text-slate-400';
  };

  const components = Object.values(brandScore.components);

  return (
    <div 
      className="flex h-screen flex-col responsive-background"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900/80 via-black/70 to-gray-800/80 backdrop-blur-sm"></div>
      <Header />
      <div className="flex flex-1 overflow-hidden pt-16 relative z-10">
        <div className="flex-1 overflow-auto w-full">
          <div className="max-w-6xl w-full mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-2 sm:py-4 md:py-6 lg:py-8">
            <div className="mb-4 sm:mb-6 md:mb-8">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">Personal Brand Score</h1>
              <p className="text-muted-foreground mt-1 text-xs sm:text-sm md:text-base leading-tight">
                Real-time analysis of your professional profile strength
              </p>
            </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="glass p-8 lg:col-span-1 border-white/10" data-testid="card-overall-score">
            <div className="flex flex-col items-center space-y-6">
              <div className="relative w-48 h-48">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="96"
                    cy="96"
                    r="88"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="none"
                    className="text-white/10"
                  />
                  <circle
                    cx="96"
                    cy="96"
                    r="88"
                    stroke="url(#gradient)"
                    strokeWidth="12"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 88}`}
                    strokeDashoffset={`${2 * Math.PI * 88 * (1 - brandScore.percentage / 100)}`}
                    className="transition-all duration-1000"
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#60a5fa" />
                      <stop offset="100%" stopColor="#a855f7" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent" data-testid="text-total-score">
                    {brandScore.totalScore}
                  </span>
                  <span className="text-white/60 text-lg">/ 100</span>
                </div>
              </div>

              <div className="text-center space-y-3">
                <Badge className={`${getGradeColor(brandScore.grade)} text-white px-6 py-2 text-lg font-semibold shadow-lg`} data-testid="badge-grade">
                  Grade {brandScore.grade}
                </Badge>
                <p className="text-sm text-white/60">
                  Updated {new Date(brandScore.lastUpdated).toLocaleDateString()}
                </p>
              </div>

              <div className="w-full space-y-3 pt-4 border-t border-white/10">
                <div className="flex justify-between text-sm">
                  <span className="text-white/70">Profile Strength</span>
                  <span className="text-white font-semibold">{brandScore.percentage}%</span>
                </div>
                <div className="h-2 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-400 to-purple-500 transition-all duration-1000"
                    style={{ width: `${brandScore.percentage}%` }}
                  />
                </div>
              </div>
            </div>
          </Card>

          <Card className="glass p-8 lg:col-span-2 border-white/10" data-testid="card-component-breakdown">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Target className="w-6 h-6 text-purple-400" />
              Component Breakdown
            </h2>
            <div className="space-y-4">
              {components.map((component, index) => (
                <div key={index} className="space-y-3 p-4 rounded-lg bg-gradient-to-b from-gray-800/30 to-gray-900/20 backdrop-blur-sm border border-white/10 hover:shadow-md transition-all duration-300" data-testid={`component-${component.name.toLowerCase().replace(/\s+/g, '-')}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(component.status)}
                      <span className="text-white font-medium">{component.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-sm font-semibold ${getStatusColor(component.status)}`}>
                        {component.percentage}%
                      </span>
                      <span className="text-white/60 text-sm">
                        {component.score}/{component.maxScore}
                      </span>
                    </div>
                  </div>
                  <div className="h-2 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-400 to-purple-500 transition-all duration-500 ease-in-out"
                      style={{ width: `${component.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {brandScore.aiSuggestions.length > 0 && (
          <Card className="glass p-8 border-white/10" data-testid="card-ai-suggestions">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Lightbulb className="w-6 h-6 text-purple-400" />
              AI-Powered Recommendations
            </h2>
            <div className="space-y-4">
              {brandScore.aiSuggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="flex gap-4 p-5 rounded-lg bg-gradient-to-b from-gray-800/30 to-gray-900/20 backdrop-blur-sm border border-white/10 hover:shadow-md transition-all duration-300"
                  data-testid={`ai-suggestion-${index}`}
                >
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-sm">{index + 1}</span>
                  </div>
                  <p className="text-white/90 flex-1 leading-relaxed">{suggestion}</p>
                </div>
              ))}
            </div>
          </Card>
        )}

        <Card className="glass p-8 border-white/10" data-testid="card-all-suggestions">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <CheckCircle2 className="w-6 h-6 text-blue-400" />
            Detailed Improvement Guide
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {components
              .filter(c => c.suggestions.length > 0)
              .map((component, index) => (
                <div key={index} className="p-5 rounded-lg bg-gradient-to-b from-gray-800/30 to-gray-900/20 backdrop-blur-sm border border-white/10 hover:shadow-md transition-all duration-300" data-testid={`suggestions-${component.name.toLowerCase().replace(/\s+/g, '-')}`}>
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
                    {getStatusIcon(component.status)}
                    {component.name}
                  </h3>
                  <ul className="space-y-3">
                    {component.suggestions.map((suggestion, sIndex) => (
                      <li
                        key={sIndex}
                        className="text-sm text-white/80 pl-4 border-l-2 border-blue-400/50 hover:border-purple-400 transition-colors leading-relaxed"
                        data-testid={`suggestion-${index}-${sIndex}`}
                      >
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
          </div>
        </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
