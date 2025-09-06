import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface PlatformRecommendation {
  platform: 'linkedin' | 'twitter' | 'instagram' | 'youtube';
  priority: number;
  percentage: number;
  reasoning: string;
  strategy: string;
  expectedROI: number;
  timeInvestment: number;
  keyMetrics: string[];
  contentFocus: string[];
  muskTip: string;
}

interface PlatformIntelligenceSummaryProps {
  recommendations: PlatformRecommendation[];
  userId: number;
  userProfile: {
    industry: string;
    domain: string;
    goals: string;
    experienceLevel: string;
  };
}

export function PlatformIntelligenceSummary({ 
  recommendations, 
  userId, 
  userProfile 
}: PlatformIntelligenceSummaryProps) {
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);

  const platformConfig = {
    linkedin: {
      name: 'LinkedIn',
      icon: '💼',
      color: 'from-blue-600 to-blue-800',
      textColor: 'text-blue-300',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20'
    },
    twitter: {
      name: 'Twitter/X',
      icon: '🐦',
      color: 'from-cyan-600 to-cyan-800',
      textColor: 'text-cyan-300',
      bgColor: 'bg-cyan-500/10',
      borderColor: 'border-cyan-500/20'
    },
    instagram: {
      name: 'Instagram',
      icon: '📸',
      color: 'from-pink-600 to-pink-800',
      textColor: 'text-pink-300',
      bgColor: 'bg-pink-500/10',
      borderColor: 'border-pink-500/20'
    },
    youtube: {
      name: 'YouTube',
      icon: '📹',
      color: 'from-red-600 to-red-800',
      textColor: 'text-red-300',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/20'
    }
  };

  const primaryPlatform = recommendations.find(r => r.priority === 1);
  const totalTimeInvestment = recommendations.reduce((sum, rec) => sum + rec.timeInvestment, 0);

  return (
    <div className="w-full space-y-4">
      {/* Header with User Profile Context */}
      <Card className="bg-black/20 backdrop-blur-md border border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <span className="text-purple-400">🧠</span>
            Your Personalized Platform Strategy
          </CardTitle>
          <div className="flex flex-wrap gap-2 text-sm text-white/70">
            <Badge variant="outline" className="text-purple-300 border-purple-500/30">
              {userProfile.industry}
            </Badge>
            <Badge variant="outline" className="text-blue-300 border-blue-500/30">
              {userProfile.domain}
            </Badge>
            <Badge variant="outline" className="text-green-300 border-green-500/30">
              Goal: {userProfile.goals}
            </Badge>
            <Badge variant="outline" className="text-yellow-300 border-yellow-500/30">
              {userProfile.experienceLevel} Level
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-white/80 text-sm leading-relaxed">
                Based on your {userProfile.industry} background and {userProfile.goals} goals, 
                we've analyzed the best platforms for your professional growth.
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/60">Primary Platform:</span>
                <span className="text-white font-medium">
                  {primaryPlatform ? platformConfig[primaryPlatform.platform].name : 'N/A'}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/60">Weekly Time Investment:</span>
                <span className="text-white font-medium">{totalTimeInvestment} minutes</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Platform Recommendations Grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {recommendations.map((recommendation) => {
          const config = platformConfig[recommendation.platform];
          const isSelected = selectedPlatform === recommendation.platform;
          
          return (
            <Card 
              key={recommendation.platform}
              className={cn(
                "bg-black/20 backdrop-blur-md border border-white/10 transition-all duration-300 cursor-pointer hover:scale-[1.02]",
                isSelected && "ring-2 ring-purple-500/50 bg-black/30"
              )}
              onClick={() => setSelectedPlatform(isSelected ? null : recommendation.platform)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold",
                      `bg-gradient-to-br ${config.color}`
                    )}>
                      <span className="text-lg">{config.icon}</span>
                    </div>
                    <div>
                      <h3 className="text-white font-semibold">{config.name}</h3>
                      <p className="text-xs text-white/60">Priority #{recommendation.priority}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={cn("text-lg font-bold", config.textColor)}>
                      {recommendation.percentage}%
                    </div>
                    <div className="text-xs text-white/60">focus</div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                {/* Focus Progress Bar */}
                <div>
                  <div className="flex justify-between text-xs text-white/60 mb-1">
                    <span>Effort Distribution</span>
                    <span>{recommendation.percentage}%</span>
                  </div>
                  <Progress 
                    value={recommendation.percentage} 
                    className="h-2 bg-white/10"
                  />
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-1">
                    <span className="text-green-400">📈</span>
                    <span className="text-white/60">ROI:</span>
                    <span className="text-green-300 font-medium">{recommendation.expectedROI}/10</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-blue-400">⏱️</span>
                    <span className="text-white/60">{recommendation.timeInvestment}min/week</span>
                  </div>
                </div>

                {/* Reasoning */}
                <div className={cn("p-2 rounded-lg", config.bgColor, config.borderColor, "border")}>
                  <div className="flex items-center gap-1 text-xs font-medium mb-1">
                    <span>🎯</span>
                    <span className={config.textColor}>Strategy Reasoning</span>
                  </div>
                  <p className="text-xs text-white/70 leading-relaxed">
                    {recommendation.reasoning}
                  </p>
                </div>

                {/* Expandable Details */}
                {isSelected && (
                  <div className="space-y-3 animate-in slide-in-from-top-2 duration-300">
                    {/* Strategy */}
                    <div className="bg-white/5 p-3 rounded-lg border border-white/10">
                      <h4 className="text-sm font-medium text-white mb-2 flex items-center gap-1">
                        <span>🚀</span>
                        Recommended Strategy
                      </h4>
                      <p className="text-xs text-white/70 leading-relaxed">
                        {recommendation.strategy}
                      </p>
                    </div>

                    {/* Content Focus */}
                    <div className="bg-white/5 p-3 rounded-lg border border-white/10">
                      <h4 className="text-sm font-medium text-white mb-2 flex items-center gap-1">
                        <span>📝</span>
                        Content Focus Areas
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {recommendation.contentFocus.map((focus, index) => (
                          <Badge 
                            key={index}
                            variant="outline" 
                            className="text-xs text-white/60 border-white/20"
                          >
                            {focus}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Key Metrics */}
                    <div className="bg-white/5 p-3 rounded-lg border border-white/10">
                      <h4 className="text-sm font-medium text-white mb-2 flex items-center gap-1">
                        <span>📊</span>
                        Success Metrics
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {recommendation.keyMetrics.slice(0, 4).map((metric, index) => (
                          <Badge 
                            key={index}
                            variant="outline" 
                            className="text-xs text-blue-300 border-blue-500/30"
                          >
                            {metric}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Musk Tip */}
                    <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 p-3 rounded-lg border border-yellow-500/20">
                      <h4 className="text-sm font-medium text-yellow-300 mb-2 flex items-center gap-1">
                        <span>💡</span>
                        Musk-Style Tip
                      </h4>
                      <p className="text-xs text-yellow-200/80 leading-relaxed italic">
                        "{recommendation.muskTip}"
                      </p>
                    </div>
                  </div>
                )}

                {/* Expand/Collapse Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-white/60 hover:text-white hover:bg-white/10"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedPlatform(isSelected ? null : recommendation.platform);
                  }}
                >
                  {isSelected ? 'Show Less' : 'Show Details'} 
                  <span className="ml-1">{isSelected ? '↑' : '↓'}</span>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Summary Actions */}
      <Card className="bg-black/20 backdrop-blur-md border border-white/10">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-white font-medium">Ready to execute your strategy?</h3>
              <p className="text-white/60 text-sm">Social Quests will be generated based on this intelligence.</p>
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                    View Active Quests
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>See your personalized Social Quests based on this analysis</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}