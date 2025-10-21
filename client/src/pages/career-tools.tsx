/**
 * Career Intelligence Suite - Hub Page
 * 
 * Access to:
 * - Resume Scorer (brutal analysis + one-click fixes)
 * - Job Description Matcher (gap analysis + strategy)
 * - Skill Benchmark (coming soon)
 * - Pitch Deck Analyzer (coming soon)
 */

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Target, TrendingUp, Presentation, Sparkles } from 'lucide-react';
import ResumeScorer from '@/components/career-intelligence/resume-scorer';
import JobMatcher from '@/components/career-intelligence/job-matcher';

export default function CareerTools() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <Sparkles className="h-8 w-8 text-purple-400" />
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              Career Intelligence Suite
            </h1>
          </div>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            AI-powered career tools that give you brutal honesty and actionable fixes. 
            No generic advice. Just real market data and exact next steps.
          </p>
        </div>

        {/* Tools */}
        <Tabs defaultValue="resume" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-8">
            <TabsTrigger value="resume" className="flex items-center gap-2" data-testid="tab-resume">
              <FileText className="h-4 w-4" />
              <span className="hidden md:inline">Resume Scorer</span>
              <span className="md:hidden">Resume</span>
            </TabsTrigger>
            <TabsTrigger value="job" className="flex items-center gap-2" data-testid="tab-job">
              <Target className="h-4 w-4" />
              <span className="hidden md:inline">Job Matcher</span>
              <span className="md:hidden">Jobs</span>
            </TabsTrigger>
            <TabsTrigger value="skills" disabled className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden md:inline">Skills (Soon)</span>
              <span className="md:hidden">Skills</span>
            </TabsTrigger>
            <TabsTrigger value="pitch" disabled className="flex items-center gap-2">
              <Presentation className="h-4 w-4" />
              <span className="hidden md:inline">Pitch (Soon)</span>
              <span className="md:hidden">Pitch</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="resume">
            <ResumeScorer />
          </TabsContent>

          <TabsContent value="job">
            <JobMatcher />
          </TabsContent>

          <TabsContent value="skills">
            <ComingSoonCard 
              title="Skill Benchmark Engine"
              description="See how your skills stack up against the market. Get brutal gaps + learning roadmaps."
              features={[
                "Real salary data by skill level",
                "Market demand trends",
                "Learning time estimates",
                "Certification recommendations"
              ]}
            />
          </TabsContent>

          <TabsContent value="pitch">
            <ComingSoonCard 
              title="Pitch Deck Analyzer"
              description="Upload your startup pitch deck. Get investor-level feedback on story, financials, and market fit."
              features={[
                "Investor perspective analysis",
                "Financial projection validation",
                "Market size reality check",
                "Storytelling score"
              ]}
            />
          </TabsContent>
        </Tabs>

        {/* Footer Info */}
        <Card className="p-6 glass-effect border-purple-500/20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-purple-400 mb-2">100% FREE</div>
              <p className="text-sm text-gray-400">All analysis powered by local AI (Ollama)</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-400 mb-2">Real Data</div>
              <p className="text-sm text-gray-400">Market intelligence from 500+ job postings/week</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-pink-400 mb-2">Actionable</div>
              <p className="text-sm text-gray-400">One-click fixes, not generic advice</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function ComingSoonCard({ 
  title, 
  description, 
  features 
}: { 
  title: string; 
  description: string; 
  features: string[];
}) {
  return (
    <Card className="p-12 glass-effect text-center space-y-6">
      <div className="space-y-4">
        <h2 className="text-3xl font-bold">{title}</h2>
        <p className="text-gray-400 max-w-2xl mx-auto">{description}</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
        {features.map((feature, i) => (
          <div key={i} className="flex items-center gap-2 text-left">
            <div className="h-2 w-2 rounded-full bg-purple-400" />
            <span className="text-sm">{feature}</span>
          </div>
        ))}
      </div>
      <Badge variant="outline" className="mt-6">
        Coming in Phase 2 (4 weeks)
      </Badge>
    </Card>
  );
}

function Badge({ children, variant, className }: { 
  children: React.ReactNode; 
  variant?: string; 
  className?: string;
}) {
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${className}`}>
      {children}
    </span>
  );
}
