/**
 * Resume Scorer Component
 * 
 * Provides brutal, actionable resume analysis with:
 * - Overall score breakdown (ATS, metrics, keywords, structure, clarity)
 * - One-click fix application
 * - Real-time score updates
 */

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  TrendingUp,
  Sparkles,
  FileText,
  Target
} from 'lucide-react';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useUser } from '@/hooks/use-user';

interface ResumeScoreBreakdown {
  overall: number;
  atsCompatibility: number;
  impactMetrics: number;
  keywords: number;
  structure: number;
  clarity: number;
}

interface ResumeFix {
  id: number;
  priority: 'critical' | 'important' | 'optional';
  category: string;
  lineNumber?: number;
  currentText: string;
  suggestedText: string;
  reasoning: string;
  expectedImpact: string;
  timeToFix: string;
  impactScore: number;
  isApplied: boolean;
}

interface ResumeAnalysisResult {
  resumeScoreId: number;
  score: ResumeScoreBreakdown;
  criticalIssues: ResumeFix[];
  importantIssues: ResumeFix[];
  optionalIssues: ResumeFix[];
  analysis: string;
}

export default function ResumeScorer() {
  const { user } = useUser();
  const [resumeText, setResumeText] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [currentResumeScoreId, setCurrentResumeScoreId] = useState<number | null>(null);

  const analyzeResumeMutation = useMutation({
    mutationFn: async (data: { resumeText: string; targetRole?: string }) => {
      const response = await apiRequest('POST', '/api/career-tools/analyze-resume', {
        resumeText: data.resumeText,
        userId: user?.id,
        targetRole: data.targetRole || undefined
      });
      return response.json();
    },
    onSuccess: (data: ResumeAnalysisResult) => {
      setCurrentResumeScoreId(data.resumeScoreId);
      queryClient.invalidateQueries({ queryKey: ['/api/career-tools/resume-score', data.resumeScoreId] });
    }
  });

  const { data: resumeScoreData, isLoading: isLoadingScore } = useQuery({
    queryKey: ['/api/career-tools/resume-score', currentResumeScoreId],
    enabled: currentResumeScoreId !== null,
  });

  const applyFixMutation = useMutation({
    mutationFn: async (fixId: number) => {
      const response = await apiRequest('POST', '/api/career-tools/apply-fix', {
        resumeScoreId: currentResumeScoreId,
        fixId
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/career-tools/resume-score', currentResumeScoreId] });
    }
  });

  const handleAnalyze = () => {
    if (!resumeText.trim()) return;
    analyzeResumeMutation.mutate({ resumeText, targetRole });
  };

  const handleApplyFix = (fixId: number) => {
    applyFixMutation.mutate(fixId);
  };

  const analysis = (analyzeResumeMutation.data || resumeScoreData) as ResumeAnalysisResult | undefined;
  const score = analysis?.score;
  const fixes = [
    ...(analysis?.criticalIssues || []),
    ...(analysis?.importantIssues || []),
    ...(analysis?.optionalIssues || [])
  ];

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getPriorityColor = (priority: string) => {
    if (priority === 'critical') return 'destructive';
    if (priority === 'important') return 'default';
    return 'secondary';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Resume Scorer
        </h1>
        <p className="text-muted-foreground">
          Get brutal, actionable feedback on your resume. No BS, just fixes.
        </p>
      </div>

      {/* Input Section */}
      <Card className="p-6 glass-effect">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Target Role (Optional)
            </label>
            <Input
              placeholder="e.g., Senior Software Engineer, Product Manager"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              data-testid="input-target-role"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">
              Paste Your Resume
            </label>
            <Textarea
              placeholder="Paste your resume text here... (or upload PDF via Musk AI)"
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              rows={10}
              className="font-mono text-sm"
              data-testid="textarea-resume"
            />
          </div>
          <Button
            onClick={handleAnalyze}
            disabled={!resumeText.trim() || analyzeResumeMutation.isPending}
            className="w-full"
            data-testid="button-analyze"
          >
            {analyzeResumeMutation.isPending ? (
              <>
                <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                Analyzing with AI...
              </>
            ) : (
              <>
                <Target className="mr-2 h-4 w-4" />
                Get Brutal Feedback
              </>
            )}
          </Button>
        </div>
      </Card>

      {/* Results Section */}
      {analysis && score && (
        <div className="space-y-6">
          {/* Score Overview */}
          <Card className="p-6 glass-effect">
            <div className="space-y-6">
              <div className="text-center">
                <div className={`text-6xl font-bold ${getScoreColor(score.overall)}`}>
                  {score.overall}
                  <span className="text-2xl text-muted-foreground">/100</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">Overall Resume Score</p>
              </div>

              <Separator />

              {/* Score Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ScoreItem
                  label="ATS Compatibility"
                  score={score.atsCompatibility}
                  max={25}
                  icon={<FileText className="h-4 w-4" />}
                />
                <ScoreItem
                  label="Impact Metrics"
                  score={score.impactMetrics}
                  max={25}
                  icon={<TrendingUp className="h-4 w-4" />}
                />
                <ScoreItem
                  label="Keyword Optimization"
                  score={score.keywords}
                  max={20}
                  icon={<Target className="h-4 w-4" />}
                />
                <ScoreItem
                  label="Structure & Formatting"
                  score={score.structure}
                  max={15}
                  icon={<CheckCircle className="h-4 w-4" />}
                />
                <ScoreItem
                  label="Clarity & Action Verbs"
                  score={score.clarity}
                  max={15}
                  icon={<Sparkles className="h-4 w-4" />}
                />
              </div>
            </div>
          </Card>

          {/* Fixes List */}
          <Card className="p-6 glass-effect">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Fixes ({fixes.length})</h2>
                <Badge variant="outline">
                  {fixes.filter(f => f.isApplied).length} / {fixes.length} applied
                </Badge>
              </div>

              <ScrollArea className="h-[500px] pr-4">
                <div className="space-y-4">
                  {fixes.map((fix, index) => (
                    <FixCard
                      key={fix.id || index}
                      fix={fix}
                      onApply={() => handleApplyFix(fix.id)}
                      isApplying={applyFixMutation.isPending}
                    />
                  ))}
                </div>
              </ScrollArea>
            </div>
          </Card>

          {/* AI Analysis */}
          {analysis?.analysis && (
            <Card className="p-6 glass-effect">
              <h3 className="font-bold mb-4">AI Analysis</h3>
              <pre className="whitespace-pre-wrap text-sm text-muted-foreground font-mono">
                {analysis.analysis}
              </pre>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

function ScoreItem({ label, score, max, icon }: { 
  label: string; 
  score: number; 
  max: number; 
  icon: React.ReactNode;
}) {
  const percentage = (score / max) * 100;
  const color = percentage >= 80 ? 'bg-green-500' : percentage >= 60 ? 'bg-yellow-500' : 'bg-red-500';

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-sm font-medium">{label}</span>
        </div>
        <span className="text-sm font-bold">
          {score}/{max}
        </span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div 
          className={`h-full ${color} transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function FixCard({ 
  fix, 
  onApply, 
  isApplying 
}: { 
  fix: ResumeFix; 
  onApply: () => void; 
  isApplying: boolean;
}) {
  const priorityColor = fix.priority === 'critical' 
    ? 'border-red-500/50 bg-red-500/5' 
    : fix.priority === 'important'
    ? 'border-yellow-500/50 bg-yellow-500/5'
    : 'border-blue-500/50 bg-blue-500/5';

  return (
    <Card className={`p-4 border-2 ${priorityColor} ${fix.isApplied ? 'opacity-50' : ''}`}>
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-2">
            {fix.isApplied ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <AlertCircle className="h-5 w-5 text-yellow-500" />
            )}
            <Badge variant={getPriorityBadgeVariant(fix.priority)}>
              {fix.priority.toUpperCase()}
            </Badge>
            <Badge variant="outline">{fix.category}</Badge>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            {fix.timeToFix}
          </div>
        </div>

        {/* Current vs Suggested */}
        <div className="space-y-2">
          <div>
            <p className="text-xs font-medium text-red-400 mb-1">Current:</p>
            <p className="text-sm bg-red-500/10 p-2 rounded">{fix.currentText}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-green-400 mb-1">Suggested:</p>
            <p className="text-sm bg-green-500/10 p-2 rounded">{fix.suggestedText}</p>
          </div>
        </div>

        {/* Reasoning & Impact */}
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">{fix.reasoning}</p>
          <div className="flex items-center gap-4 text-xs">
            <span className="text-green-400 font-medium">
              Impact: {fix.expectedImpact}
            </span>
          </div>
        </div>

        {/* Apply Button */}
        {!fix.isApplied && (
          <Button
            onClick={onApply}
            disabled={isApplying}
            size="sm"
            className="w-full"
            data-testid={`button-apply-fix-${fix.id}`}
          >
            {isApplying ? 'Applying...' : '✨ Apply Fix'}
          </Button>
        )}
        {fix.isApplied && (
          <div className="text-center text-sm text-green-500 font-medium">
            ✓ Applied
          </div>
        )}
      </div>
    </Card>
  );
}

function getPriorityBadgeVariant(priority: string): 'destructive' | 'default' | 'secondary' {
  if (priority === 'critical') return 'destructive';
  if (priority === 'important') return 'default';
  return 'secondary';
}
