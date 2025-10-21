/**
 * Job Description Matcher Component
 * 
 * Analyzes job descriptions and provides:
 * - Match score (0-100%)
 * - Gap analysis with actionable fixes
 * - Resume rewrite suggestions
 * - Application strategy
 */

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Target,
  AlertTriangle,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Clock,
  DollarSign,
  Sparkles
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useUser } from '@/hooks/use-user';

interface Gap {
  gap: string;
  why?: string;
  howToFix?: string;
  timeEstimate?: string;
  impact?: string;
  benefit?: string;
}

interface GapAnalysis {
  critical: Gap[];
  important: Gap[];
  optional: Gap[];
}

interface JobMatchResult {
  jobMatchId: number;
  matchScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  gapAnalysis: GapAnalysis;
  applicationStrategy: string;
  interviewProbability: number;
  salaryEstimate: string;
  experienceMatch: boolean;
  educationMatch: boolean;
}

export default function JobMatcher() {
  const { user } = useUser();
  const [jobDescription, setJobDescription] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [jobUrl, setJobUrl] = useState('');

  const matchJobMutation = useMutation({
    mutationFn: async (data: {
      jobDescription: string;
      jobTitle: string;
      companyName?: string;
      jobUrl?: string;
    }) => {
      const response = await apiRequest('POST', '/api/career-tools/match-job', {
        ...data,
        userId: user?.id
      });
      return response.json();
    }
  });

  const handleAnalyze = () => {
    if (!jobDescription.trim() || !jobTitle.trim()) return;
    matchJobMutation.mutate({ 
      jobDescription, 
      jobTitle, 
      companyName: companyName || undefined,
      jobUrl: jobUrl || undefined
    });
  };

  const result = matchJobMutation.data as JobMatchResult | undefined;

  const getMatchColor = (score: number) => {
    if (score >= 75) return 'text-green-500';
    if (score >= 50) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getMatchBadge = (score: number) => {
    if (score >= 75) return { label: 'HIGH MATCH', variant: 'default' as const, color: 'bg-green-500' };
    if (score >= 50) return { label: 'MODERATE', variant: 'secondary' as const, color: 'bg-yellow-500' };
    return { label: 'LOW MATCH', variant: 'destructive' as const, color: 'bg-red-500' };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          Job Description Matcher
        </h1>
        <p className="text-muted-foreground">
          Find out if you're a match. Get brutal gaps + exactly how to fix them.
        </p>
      </div>

      {/* Input Section */}
      <Card className="p-6 glass-effect">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Job Title *
              </label>
              <Input
                placeholder="e.g., Senior Software Engineer"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                data-testid="input-job-title"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">
                Company Name (Optional)
              </label>
              <Input
                placeholder="e.g., Google, Meta, Startup Inc"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                data-testid="input-company-name"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              Job URL (Optional)
            </label>
            <Input
              placeholder="https://..."
              value={jobUrl}
              onChange={(e) => setJobUrl(e.target.value)}
              data-testid="input-job-url"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              Job Description *
            </label>
            <Textarea
              placeholder="Paste the full job description here..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              rows={12}
              className="font-mono text-sm"
              data-testid="textarea-job-description"
            />
          </div>

          <Button
            onClick={handleAnalyze}
            disabled={!jobDescription.trim() || !jobTitle.trim() || matchJobMutation.isPending}
            className="w-full"
            data-testid="button-analyze-match"
          >
            {matchJobMutation.isPending ? (
              <>
                <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                Analyzing Match...
              </>
            ) : (
              <>
                <Target className="mr-2 h-4 w-4" />
                Analyze Job Match
              </>
            )}
          </Button>
        </div>
      </Card>

      {/* Results Section */}
      {result && (
        <div className="space-y-6">
          {/* Match Score Overview */}
          <Card className="p-6 glass-effect">
            <div className="space-y-6">
              <div className="text-center">
                <div className={`text-6xl font-bold ${getMatchColor(result.matchScore)}`}>
                  {result.matchScore}%
                </div>
                <p className="text-sm text-muted-foreground mt-2">Match Score</p>
                <Badge className="mt-4" variant={getMatchBadge(result.matchScore).variant}>
                  {getMatchBadge(result.matchScore).label}
                </Badge>
              </div>

              <Separator />

              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-500">
                    {result.matchedSkills.length}
                  </div>
                  <p className="text-xs text-muted-foreground">Matched Skills</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-500">
                    {result.missingSkills.length}
                  </div>
                  <p className="text-xs text-muted-foreground">Missing Skills</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-500">
                    {result.interviewProbability}%
                  </div>
                  <p className="text-xs text-muted-foreground">Interview Prob</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-500">
                    {result.salaryEstimate}
                  </div>
                  <p className="text-xs text-muted-foreground">Est. Salary</p>
                </div>
              </div>

              {/* Requirements Match */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-sm">
                  {result.experienceMatch ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                  <span>Experience Level</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  {result.educationMatch ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                  <span>Education</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Skills Breakdown */}
          <Card className="p-6 glass-effect">
            <h3 className="font-bold mb-4">Skills Breakdown</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span className="font-medium">Matched Skills ({result.matchedSkills.length})</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {result.matchedSkills.map((skill, i) => (
                    <Badge key={i} variant="outline" className="bg-green-500/10 border-green-500/50">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <XCircle className="h-4 w-4 text-red-500" />
                  <span className="font-medium">Missing Skills ({result.missingSkills.length})</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {result.missingSkills.map((skill, i) => (
                    <Badge key={i} variant="outline" className="bg-red-500/10 border-red-500/50">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* Gap Analysis */}
          <Card className="p-6 glass-effect">
            <h3 className="font-bold mb-4">Gap Analysis</h3>
            <ScrollArea className="h-[400px]">
              <div className="space-y-4 pr-4">
                {/* Critical Gaps */}
                {result.gapAnalysis.critical && result.gapAnalysis.critical.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-red-500" />
                      <h4 className="font-medium text-red-500">Critical Gaps</h4>
                    </div>
                    {result.gapAnalysis.critical.map((gap, i) => (
                      <GapCard key={i} gap={gap} priority="critical" />
                    ))}
                  </div>
                )}

                {/* Important Gaps */}
                {result.gapAnalysis.important && result.gapAnalysis.important.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-yellow-500" />
                      <h4 className="font-medium text-yellow-500">Important Gaps</h4>
                    </div>
                    {result.gapAnalysis.important.map((gap, i) => (
                      <GapCard key={i} gap={gap} priority="important" />
                    ))}
                  </div>
                )}

                {/* Optional */}
                {result.gapAnalysis.optional && result.gapAnalysis.optional.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-blue-500" />
                      <h4 className="font-medium text-blue-500">Nice to Have</h4>
                    </div>
                    {result.gapAnalysis.optional.map((gap, i) => (
                      <GapCard key={i} gap={gap} priority="optional" />
                    ))}
                  </div>
                )}
              </div>
            </ScrollArea>
          </Card>

          {/* Application Strategy */}
          <Card className="p-6 glass-effect">
            <h3 className="font-bold mb-4">Application Strategy</h3>
            <pre className="whitespace-pre-wrap text-sm text-muted-foreground">
              {result.applicationStrategy}
            </pre>
          </Card>
        </div>
      )}
    </div>
  );
}

function GapCard({ gap, priority }: { gap: Gap; priority: string }) {
  const borderColor = priority === 'critical' 
    ? 'border-red-500/50 bg-red-500/5'
    : priority === 'important'
    ? 'border-yellow-500/50 bg-yellow-500/5'
    : 'border-blue-500/50 bg-blue-500/5';

  return (
    <Card className={`p-4 border-2 ${borderColor}`}>
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-4">
          <p className="font-medium">{gap.gap}</p>
          {gap.timeEstimate && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground whitespace-nowrap">
              <Clock className="h-3 w-3" />
              {gap.timeEstimate}
            </div>
          )}
        </div>
        {gap.why && (
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-red-400">Why:</span> {gap.why}
          </p>
        )}
        {gap.howToFix && (
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-green-400">Fix:</span> {gap.howToFix}
          </p>
        )}
        {gap.impact && (
          <p className="text-sm text-green-400 font-medium">
            {gap.impact}
          </p>
        )}
        {gap.benefit && (
          <p className="text-sm text-blue-400">
            {gap.benefit}
          </p>
        )}
      </div>
    </Card>
  );
}
