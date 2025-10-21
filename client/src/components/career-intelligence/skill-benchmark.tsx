import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  Target,
  TrendingUp,
  DollarSign,
  Award,
  Clock,
  BookOpen,
  Users,
  Sparkles,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useUser } from '@/hooks/use-user';

export default function SkillBenchmark() {
  const { user } = useUser();
  const [skillName, setSkillName] = useState('');
  const [userProficiency, setUserProficiency] = useState([50]);
  const [industry, setIndustry] = useState('');
  const [yearsOfExperience, setYearsOfExperience] = useState('');
  const [currentBenchmarkId, setCurrentBenchmarkId] = useState<number | null>(null);

  const benchmarkMutation = useMutation({
    mutationFn: async (data: {
      skillName: string;
      userProficiency: number;
      industry?: string;
      yearsOfExperience?: number;
    }) => {
      const response = await apiRequest('POST', '/api/career-tools/benchmark-skill', {
        userId: user?.id,
        ...data
      });
      return response.json();
    },
    onSuccess: (data) => {
      setCurrentBenchmarkId(data.benchmarkId);
    }
  });

  const { data: benchmarkData, isLoading: isLoadingBenchmark } = useQuery({
    queryKey: ['/api/career-tools/skill-benchmark', currentBenchmarkId],
    enabled: currentBenchmarkId !== null
  });

  const benchmark = benchmarkData?.benchmark;
  const analysis = benchmark ? {
    ...benchmark,
    salaryByLevel: typeof benchmark.salary_by_level === 'string'
      ? JSON.parse(benchmark.salary_by_level)
      : benchmark.salary_by_level,
    learningPath: typeof benchmark.learning_path === 'string'
      ? JSON.parse(benchmark.learning_path)
      : benchmark.learning_path,
    industryTrends: typeof benchmark.industry_trends === 'string'
      ? JSON.parse(benchmark.industry_trends)
      : benchmark.industry_trends,
    certificationRecommendations: typeof benchmark.certification_recommendations === 'string'
      ? JSON.parse(benchmark.certification_recommendations)
      : benchmark.certification_recommendations
  } : null;

  const handleBenchmark = () => {
    if (!skillName.trim()) return;

    benchmarkMutation.mutate({
      skillName,
      userProficiency: userProficiency[0],
      industry: industry || undefined,
      yearsOfExperience: yearsOfExperience ? parseInt(yearsOfExperience) : undefined
    });
  };

  const getMarketDemandColor = (demand: string) => {
    switch (demand) {
      case 'high': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'rising': return 'text-green-500';
      case 'stable': return 'text-blue-500';
      case 'declining': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold mb-2">Skill Benchmark Engine</h2>
        <p className="text-muted-foreground">
          See how your skills stack up against the market. Get salary data, learning roadmaps, and certification recommendations.
        </p>
      </div>

      {/* Input Section */}
      <Card className="p-6 glass-effect">
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Skill Name <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="e.g., React, Python, AWS, Data Science"
                value={skillName}
                onChange={(e) => setSkillName(e.target.value)}
                data-testid="input-skill-name"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">
                Industry (Optional)
              </label>
              <Input
                placeholder="e.g., Tech, Finance, Healthcare"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                data-testid="input-industry"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              Your Proficiency: {userProficiency[0]}/100
            </label>
            <div className="flex items-center gap-4">
              <Slider
                value={userProficiency}
                onValueChange={setUserProficiency}
                max={100}
                step={5}
                className="flex-1"
                data-testid="slider-proficiency"
              />
              <span className="text-2xl font-bold w-16 text-right">
                {userProficiency[0]}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              0 = Beginner, 50 = Intermediate, 100 = Expert
            </p>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              Years of Experience (Optional)
            </label>
            <Input
              type="number"
              placeholder="e.g., 3"
              value={yearsOfExperience}
              onChange={(e) => setYearsOfExperience(e.target.value)}
              data-testid="input-years-experience"
            />
          </div>

          <Button
            onClick={handleBenchmark}
            disabled={!skillName.trim() || benchmarkMutation.isPending}
            className="w-full"
            size="lg"
            data-testid="button-benchmark"
          >
            {benchmarkMutation.isPending ? (
              <>
                <Sparkles className="mr-2 h-5 w-5 animate-spin" />
                Analyzing Against Market...
              </>
            ) : (
              <>
                <Target className="mr-2 h-5 w-5" />
                Benchmark My Skill
              </>
            )}
          </Button>
        </div>
      </Card>

      {/* Results Section */}
      {analysis && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid md:grid-cols-3 gap-4">
            <Card className="p-6 glass-effect">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Percentile Rank</span>
                <Target className="h-5 w-5 text-primary" />
              </div>
              <div className="text-3xl font-bold">{analysis.percentile_rank}th</div>
              <Progress value={analysis.percentile_rank} className="mt-2" />
            </Card>

            <Card className="p-6 glass-effect">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Market Demand</span>
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <Badge className={getMarketDemandColor(analysis.market_demand)}>
                {analysis.market_demand?.toUpperCase()}
              </Badge>
              <p className="text-sm mt-2">{analysis.average_salary}</p>
            </Card>

            <Card className="p-6 glass-effect">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Time to Top 25%</span>
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <div className="text-2xl font-bold">{analysis.time_to_improve}</div>
            </Card>
          </div>

          {/* Market Comparison */}
          <Card className="p-6 glass-effect">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Users className="h-5 w-5" />
              Market Comparison
            </h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm">Your Proficiency</span>
                    <span className="text-sm font-bold">{analysis.user_proficiency}/100</span>
                  </div>
                  <Progress value={analysis.user_proficiency} className="h-3" />
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm">Market Average</span>
                    <span className="text-sm font-bold">{analysis.market_average}/100</span>
                  </div>
                  <Progress value={analysis.market_average} className="h-3" />
                </div>
              </div>
              <Separator />
              <p className="text-sm text-muted-foreground">{analysis.analysis}</p>
            </div>
          </Card>

          {/* Salary Intelligence */}
          <Card className="p-6 glass-effect">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Salary Intelligence
            </h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Junior Level</div>
                <div className="text-lg font-bold">{analysis.salaryByLevel?.junior || 'N/A'}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Mid Level</div>
                <div className="text-lg font-bold">{analysis.salaryByLevel?.mid || 'N/A'}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Senior Level</div>
                <div className="text-lg font-bold">{analysis.salaryByLevel?.senior || 'N/A'}</div>
              </div>
            </div>
            {analysis.top_companies_hiring && analysis.top_companies_hiring.length > 0 && (
              <>
                <Separator className="my-4" />
                <div>
                  <div className="text-sm font-medium mb-2">Top Companies Hiring</div>
                  <div className="flex flex-wrap gap-2">
                    {analysis.top_companies_hiring.map((company: string, i: number) => (
                      <Badge key={i} variant="outline">{company}</Badge>
                    ))}
                  </div>
                </div>
              </>
            )}
          </Card>

          {/* Learning Roadmap */}
          {analysis.learningPath && analysis.learningPath.length > 0 && (
            <Card className="p-6 glass-effect">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Learning Roadmap
              </h3>
              <div className="space-y-6">
                {analysis.learningPath.map((phase: any, i: number) => (
                  <div key={i} className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Badge className="bg-primary">{i + 1}</Badge>
                      <div>
                        <div className="font-bold">{phase.phase}</div>
                        <div className="text-sm text-muted-foreground">{phase.duration}</div>
                      </div>
                    </div>
                    <div className="pl-11 space-y-2">
                      {phase.resources && (
                        <div>
                          <div className="text-sm font-medium mb-1">Resources:</div>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            {phase.resources.map((resource: string, j: number) => (
                              <li key={j}>• {resource}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {phase.milestones && (
                        <div>
                          <div className="text-sm font-medium mb-1">Milestones:</div>
                          <ul className="text-sm space-y-1">
                            {phase.milestones.map((milestone: string, j: number) => (
                              <li key={j} className="flex items-start gap-2">
                                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                                <span>{milestone}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                    {i < analysis.learningPath.length - 1 && <Separator />}
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Certifications */}
          {analysis.certificationRecommendations && analysis.certificationRecommendations.length > 0 && (
            <Card className="p-6 glass-effect">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Award className="h-5 w-5" />
                Recommended Certifications
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {analysis.certificationRecommendations.map((cert: any, i: number) => (
                  <Card key={i} className="p-4 border-2">
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-bold">{cert.name}</div>
                      <Badge variant="outline">Impact: {cert.impactScore}/100</Badge>
                    </div>
                    <div className="text-sm space-y-1">
                      <div className="text-muted-foreground">{cert.provider}</div>
                      <div>Cost: {cert.estimatedCost}</div>
                      <div>Time: {cert.timeToComplete}</div>
                    </div>
                  </Card>
                ))}
              </div>
            </Card>
          )}

          {/* Industry Trends */}
          {analysis.industryTrends && (
            <Card className="p-6 glass-effect">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Market Trends
              </h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Trend</div>
                  <div className={`text-lg font-bold ${getTrendColor(analysis.industryTrends.trend)}`}>
                    {analysis.industryTrends.trend?.toUpperCase()}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Growth Rate</div>
                  <div className="text-lg font-bold">{analysis.industryTrends.growthRate}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Outlook</div>
                  <div className="text-sm">{analysis.industryTrends.outlook}</div>
                </div>
              </div>
            </Card>
          )}

          {/* Related Skills */}
          {analysis.related_skills && analysis.related_skills.length > 0 && (
            <Card className="p-6 glass-effect">
              <h3 className="text-xl font-bold mb-4">Related Skills to Learn</h3>
              <div className="flex flex-wrap gap-2">
                {analysis.related_skills.map((skill: string, i: number) => (
                  <Badge key={i} variant="secondary" className="text-sm">{skill}</Badge>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
