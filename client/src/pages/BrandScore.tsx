import { useQuery } from '@tanstack/react-query';
import { useUser } from '@/hooks/use-user';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, AlertCircle, TrendingUp, Lightbulb, Target } from 'lucide-react';

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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <Skeleton className="h-12 w-64" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Skeleton className="h-96 lg:col-span-1" />
            <Skeleton className="h-96 lg:col-span-2" />
          </div>
        </div>
      </div>
    );
  }

  if (!brandScore) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6 flex items-center justify-center">
        <Card className="glass p-8 text-center">
          <p className="text-white">Unable to load brand score</p>
        </Card>
      </div>
    );
  }

  const getGradeColor = (grade: string) => {
    if (grade.startsWith('A')) return 'bg-emerald-500';
    if (grade.startsWith('B')) return 'bg-blue-500';
    if (grade === 'C') return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getStatusIcon = (status: string) => {
    if (status === 'excellent') return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
    if (status === 'good') return <TrendingUp className="w-5 h-5 text-blue-500" />;
    return <AlertCircle className="w-5 h-5 text-yellow-500" />;
  };

  const getStatusColor = (status: string) => {
    if (status === 'excellent') return 'text-emerald-500';
    if (status === 'good') return 'text-blue-500';
    if (status === 'needs_improvement') return 'text-yellow-500';
    return 'text-red-500';
  };

  const components = Object.values(brandScore.components);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Personal Brand Score</h1>
          <p className="text-slate-300">
            Real-time analysis of your professional profile strength
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="glass p-8 lg:col-span-1" data-testid="card-overall-score">
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
                    className="text-slate-700"
                  />
                  <circle
                    cx="96"
                    cy="96"
                    r="88"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 88}`}
                    strokeDashoffset={`${2 * Math.PI * 88 * (1 - brandScore.percentage / 100)}`}
                    className="text-purple-500 transition-all duration-1000"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-5xl font-bold text-white" data-testid="text-total-score">
                    {brandScore.totalScore}
                  </span>
                  <span className="text-slate-400">/ 100</span>
                </div>
              </div>

              <div className="text-center space-y-2">
                <Badge className={`${getGradeColor(brandScore.grade)} text-white px-4 py-2 text-lg`} data-testid="badge-grade">
                  Grade: {brandScore.grade}
                </Badge>
                <p className="text-sm text-slate-400">
                  Updated {new Date(brandScore.lastUpdated).toLocaleDateString()}
                </p>
              </div>

              <div className="w-full space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Profile Strength</span>
                  <span className="text-white font-semibold">{brandScore.percentage}%</span>
                </div>
                <Progress value={brandScore.percentage} className="h-2" />
              </div>
            </div>
          </Card>

          <Card className="glass p-8 lg:col-span-2" data-testid="card-component-breakdown">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Target className="w-6 h-6" />
              Component Breakdown
            </h2>
            <div className="space-y-4">
              {components.map((component, index) => (
                <div key={index} className="space-y-2" data-testid={`component-${component.name.toLowerCase().replace(/\s+/g, '-')}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(component.status)}
                      <span className="text-white font-medium">{component.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-sm font-semibold ${getStatusColor(component.status)}`}>
                        {component.percentage}%
                      </span>
                      <span className="text-slate-400 text-sm">
                        {component.score}/{component.maxScore}
                      </span>
                    </div>
                  </div>
                  <Progress value={component.percentage} className="h-2" />
                </div>
              ))}
            </div>
          </Card>
        </div>

        {brandScore.aiSuggestions.length > 0 && (
          <Card className="glass p-8" data-testid="card-ai-suggestions">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Lightbulb className="w-6 h-6 text-yellow-500" />
              AI-Powered Recommendations
            </h2>
            <div className="space-y-4">
              {brandScore.aiSuggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="flex gap-4 p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                  data-testid={`ai-suggestion-${index}`}
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                    <span className="text-purple-400 font-bold">{index + 1}</span>
                  </div>
                  <p className="text-slate-200 flex-1">{suggestion}</p>
                </div>
              ))}
            </div>
          </Card>
        )}

        <Card className="glass p-8" data-testid="card-all-suggestions">
          <h2 className="text-2xl font-bold text-white mb-6">All Improvement Suggestions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {components
              .filter(c => c.suggestions.length > 0)
              .map((component, index) => (
                <div key={index} className="space-y-3" data-testid={`suggestions-${component.name.toLowerCase().replace(/\s+/g, '-')}`}>
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    {getStatusIcon(component.status)}
                    {component.name}
                  </h3>
                  <ul className="space-y-2">
                    {component.suggestions.map((suggestion, sIndex) => (
                      <li
                        key={sIndex}
                        className="text-sm text-slate-300 pl-4 border-l-2 border-purple-500/50"
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
  );
}
