import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  FileText,
  TrendingUp,
  AlertTriangle,
  ThumbsUp,
  Target,
  Sparkles,
  Lightbulb,
  DollarSign
} from 'lucide-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { useUser } from '@/hooks/use-user';

export default function PitchDeckAnalyzer() {
  const { user } = useUser();
  const [deckName, setDeckName] = useState('');
  const [fundingStage, setFundingStage] = useState('');
  const [targetRaise, setTargetRaise] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [currentAnalysisId, setCurrentAnalysisId] = useState<number | null>(null);

  const analyzeMutation = useMutation({
    mutationFn: async (data: { file: File; deckName: string; fundingStage?: string; targetRaise?: string }) => {
      const formData = new FormData();
      formData.append('deck', data.file);
      formData.append('userId', String(user?.id));
      formData.append('deckName', data.deckName);
      if (data.fundingStage) formData.append('fundingStage', data.fundingStage);
      if (data.targetRaise) formData.append('targetRaise', data.targetRaise);

      const response = await fetch('/api/career-tools/upload-pitch-deck', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
      }

      return response.json();
    },
    onSuccess: (data) => {
      setCurrentAnalysisId(data.analysisId);
      queryClient.invalidateQueries({ queryKey: ['/api/career-tools/pitch-deck', data.analysisId] });
    }
  });

  const { data: analysisData, isLoading: isLoadingAnalysis } = useQuery({
    queryKey: ['/api/career-tools/pitch-deck', currentAnalysisId],
    enabled: currentAnalysisId !== null
  });

  const analysis = analysisData?.analysis ? {
    ...analysisData.analysis,
    problemStatementAnalysis: typeof analysisData.analysis.problem_statement_analysis === 'string'
      ? JSON.parse(analysisData.analysis.problem_statement_analysis)
      : analysisData.analysis.problem_statement_analysis,
    criticalIssues: typeof analysisData.analysis.critical_issues === 'string'
      ? JSON.parse(analysisData.analysis.critical_issues)
      : analysisData.analysis.critical_issues,
    strengthsHighlighted: typeof analysisData.analysis.strengths_highlighted === 'string'
      ? JSON.parse(analysisData.analysis.strengths_highlighted)
      : analysisData.analysis.strengths_highlighted,
    recommendedChanges: typeof analysisData.analysis.recommended_changes === 'string'
      ? JSON.parse(analysisData.analysis.recommended_changes)
      : analysisData.analysis.recommended_changes
  } : null;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      if (!deckName) {
        setDeckName(file.name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file && (file.type === 'application/pdf' || file.name.endsWith('.pdf') || file.name.endsWith('.pptx'))) {
      setSelectedFile(file);
      if (!deckName) {
        setDeckName(file.name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  const handleAnalyze = () => {
    if (!selectedFile || !deckName.trim()) return;

    analyzeMutation.mutate({
      file: selectedFile,
      deckName,
      fundingStage,
      targetRaise
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-500';
    if (score >= 50) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getProbabilityColor = (prob: number) => {
    if (prob >= 60) return 'text-green-500';
    if (prob >= 30) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold mb-2">Pitch Deck Analyzer</h2>
        <p className="text-muted-foreground">
          Get brutal, investor-level feedback on your startup pitch deck. See your fundraising probability and critical issues.
        </p>
      </div>

      {/* Input Section */}
      <Card className="p-6 glass-effect">
        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Pitch Deck Name <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="e.g., My Startup - Series A Pitch"
                value={deckName}
                onChange={(e) => setDeckName(e.target.value)}
                data-testid="input-deck-name"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">
                Funding Stage
              </label>
              <Select value={fundingStage} onValueChange={setFundingStage}>
                <SelectTrigger data-testid="select-funding-stage">
                  <SelectValue placeholder="Select stage..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pre-seed">Pre-Seed</SelectItem>
                  <SelectItem value="seed">Seed</SelectItem>
                  <SelectItem value="series-a">Series A</SelectItem>
                  <SelectItem value="series-b">Series B</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              Target Raise (Optional)
            </label>
            <Input
              placeholder="e.g., $2M"
              value={targetRaise}
              onChange={(e) => setTargetRaise(e.target.value)}
              data-testid="input-target-raise"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              Upload Pitch Deck (PDF or PPTX) <span className="text-red-500">*</span>
            </label>
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isDragging
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              {selectedFile ? (
                <div className="space-y-2">
                  <FileText className="h-12 w-12 mx-auto text-primary" />
                  <p className="font-medium">{selectedFile.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(selectedFile.size / 1024).toFixed(1)} KB
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedFile(null)}
                    data-testid="button-remove-file"
                  >
                    Remove
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground" />
                  <p className="font-medium">Drop your pitch deck here</p>
                  <p className="text-sm text-muted-foreground">
                    or click to browse
                  </p>
                  <input
                    type="file"
                    accept=".pdf,.ppt,.pptx"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="deck-upload"
                    data-testid="input-file-upload"
                  />
                  <Button
                    variant="outline"
                    onClick={() => document.getElementById('deck-upload')?.click()}
                    data-testid="button-browse-file"
                  >
                    Browse Files
                  </Button>
                </div>
              )}
            </div>
          </div>

          <Button
            onClick={handleAnalyze}
            disabled={!selectedFile || !deckName.trim() || analyzeMutation.isPending}
            className="w-full"
            size="lg"
            data-testid="button-analyze"
          >
            {analyzeMutation.isPending ? (
              <>
                <Sparkles className="mr-2 h-5 w-5 animate-spin" />
                Analyzing with Investor AI...
              </>
            ) : (
              <>
                <Target className="mr-2 h-5 w-5" />
                Get Investor Feedback
              </>
            )}
          </Button>
        </div>
      </Card>

      {/* Results Section */}
      {analysis && (
        <div className="space-y-6">
          {/* Overall Score */}
          <Card className="p-6 glass-effect">
            <div className="grid md:grid-cols-5 gap-4">
              <div className="md:col-span-1">
                <div className="text-center">
                  <div className="text-sm text-muted-foreground mb-2">Overall Score</div>
                  <div className={`text-5xl font-bold ${getScoreColor(analysis.overall_score)}`}>
                    {analysis.overall_score}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">/100</div>
                  <Progress value={analysis.overall_score} className="mt-3" />
                </div>
              </div>
              <div className="md:col-span-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Story</div>
                  <div className={`text-2xl font-bold ${getScoreColor(analysis.story_score * 4)}`}>
                    {analysis.story_score}/25
                  </div>
                  <Progress value={(analysis.story_score / 25) * 100} className="mt-2" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Market</div>
                  <div className={`text-2xl font-bold ${getScoreColor(analysis.market_score * 4)}`}>
                    {analysis.market_score}/25
                  </div>
                  <Progress value={(analysis.market_score / 25) * 100} className="mt-2" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Financials</div>
                  <div className={`text-2xl font-bold ${getScoreColor(analysis.financials_score * 4)}`}>
                    {analysis.financials_score}/25
                  </div>
                  <Progress value={(analysis.financials_score / 25) * 100} className="mt-2" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Team</div>
                  <div className={`text-2xl font-bold ${getScoreColor(analysis.team_score * 4)}`}>
                    {analysis.team_score}/25
                  </div>
                  <Progress value={(analysis.team_score / 25) * 100} className="mt-2" />
                </div>
              </div>
            </div>
          </Card>

          {/* Funding Probability & Valuation */}
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="p-6 glass-effect">
              <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Suggested Valuation
              </h3>
              <div className="text-2xl font-bold text-primary">
                {analysis.suggested_valuation}
              </div>
            </Card>

            <Card className="p-6 glass-effect">
              <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Funding Probability
              </h3>
              <div className={`text-2xl font-bold ${getProbabilityColor(analysis.funding_probability)}`}>
                {analysis.funding_probability}%
              </div>
              <Progress value={analysis.funding_probability} className="mt-2" />
            </Card>
          </div>

          {/* Critical Issues */}
          {analysis.criticalIssues && analysis.criticalIssues.length > 0 && (
            <Card className="p-6 glass-effect border-red-500/30">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-red-500">
                <AlertTriangle className="h-5 w-5" />
                Critical Issues ({analysis.criticalIssues.length})
              </h3>
              <div className="space-y-3">
                {analysis.criticalIssues.map((issue: string, i: number) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-red-500/10 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                    <p className="text-sm">{issue}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Strengths */}
          {analysis.strengthsHighlighted && analysis.strengthsHighlighted.length > 0 && (
            <Card className="p-6 glass-effect border-green-500/30">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-green-500">
                <ThumbsUp className="h-5 w-5" />
                Key Strengths ({analysis.strengthsHighlighted.length})
              </h3>
              <div className="space-y-3">
                {analysis.strengthsHighlighted.map((strength: string, i: number) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-green-500/10 rounded-lg">
                    <ThumbsUp className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <p className="text-sm">{strength}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Recommended Changes */}
          {analysis.recommendedChanges && analysis.recommendedChanges.length > 0 && (
            <Card className="p-6 glass-effect">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                Priority Fixes ({analysis.recommendedChanges.length})
              </h3>
              <div className="space-y-4">
                {analysis.recommendedChanges.map((change: any, i: number) => (
                  <div key={i} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-primary">Priority {change.priority || i + 1}</Badge>
                        {change.impact && (
                          <Badge variant="outline" className={
                            change.impact === 'high' ? 'border-red-500 text-red-500' :
                            change.impact === 'medium' ? 'border-yellow-500 text-yellow-500' :
                            'border-blue-500 text-blue-500'
                          }>
                            {change.impact.toUpperCase()}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="font-bold mb-1">{change.change}</div>
                    <p className="text-sm text-muted-foreground">{change.reason}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Investor Feedback */}
          <Card className="p-6 glass-effect">
            <h3 className="text-xl font-bold mb-4">Full Investor Analysis</h3>
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <p className="whitespace-pre-wrap">{analysis.investor_feedback}</p>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
