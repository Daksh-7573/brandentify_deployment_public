import { useState } from 'react';
import { 
  VisionCard, 
  VisionCardHeader, 
  VisionCardTitle, 
  VisionCardDescription, 
  VisionCardContent,
  VisionCardFooter
} from '@/components/ui/vision-card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Zap, MessageSquare, ThumbsUp, Bot, Lightbulb, User, BellRing, FileText, ShieldCheck, Award } from 'lucide-react';
import { VisionNowboardSuggestions } from '@/components/brand-quests/vision-nowboard-suggestions';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';

export default function VisionUIPage() {
  return (
    <div 
      className="min-h-screen w-full bg-gradient-to-br from-gray-900 to-gray-950" 
      style={{ 
        backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(50, 50, 70, 0.3) 0%, rgba(20, 20, 40, 0.1) 100%)'
      }}
    >
      {/* Vision Pro-style header */}
      <header className="py-6 px-8 backdrop-blur-md bg-black/10 border-b border-white/10">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-white">Vision UI Demo</h1>
          <div className="flex items-center gap-4">
            <Button variant="ghost" className="text-white/70 hover:text-white">
              <BellRing className="h-5 w-5" />
            </Button>
            <Avatar className="h-9 w-9 border border-white/20">
              <AvatarFallback className="bg-primary/20">
                <User className="h-5 w-5 text-primary" />
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <main className="container p-8 mx-auto">
        {/* Hero section */}
        <VisionCard className="mb-8" variant="dark" size="lg">
          <VisionCardContent className="flex flex-col md:flex-row gap-6 items-center">
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold mb-4 text-white">Vision Pro Inspired UI</h1>
              <p className="text-lg text-white/80 mb-6">
                Experience the future of design with our glassmorphic interface, 
                inspired by Apple's Vision Pro aesthetic.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button className="bg-white/10 border border-white/20 text-white hover:bg-white/20">
                  Explore Components
                </Button>
                <Button variant="outline" className="border-white/20 text-white/90 hover:bg-white/10">
                  Learn More <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="flex-shrink-0 w-full md:w-1/3 aspect-video rounded-xl bg-black/40 border border-white/10 flex items-center justify-center">
              <div className="text-center">
                <Lightbulb className="h-12 w-12 mx-auto mb-2 text-primary/80" />
                <p className="text-white/70">Preview Area</p>
              </div>
            </div>
          </VisionCardContent>
        </VisionCard>

        {/* Grid layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Card 1 */}
          <VisionCard variant="dark" hover="subtle">
            <VisionCardHeader>
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-primary/80" />
                </div>
                <VisionCardTitle>Documents</VisionCardTitle>
              </div>
              <VisionCardDescription>
                Manage and organize your professional documents
              </VisionCardDescription>
            </VisionCardHeader>
            <VisionCardContent>
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="p-3 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-all">
                    <p className="text-sm text-white/90 font-medium">Document {i}</p>
                    <p className="text-xs text-white/60">Last edited 2 days ago</p>
                  </div>
                ))}
              </div>
            </VisionCardContent>
            <VisionCardFooter>
              <Button variant="outline" size="sm" className="bg-white/5 border-white/20 text-white/90 hover:bg-white/10">
                View All <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </VisionCardFooter>
          </VisionCard>

          {/* Card 2 */}
          <VisionCard variant="dark" hover="subtle">
            <VisionCardHeader>
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-full bg-purple-900/30 border border-purple-500/20 flex items-center justify-center">
                  <Award className="h-5 w-5 text-purple-400" />
                </div>
                <VisionCardTitle>Achievements</VisionCardTitle>
              </div>
              <VisionCardDescription>
                Track your progress and recent accomplishments
              </VisionCardDescription>
            </VisionCardHeader>
            <VisionCardContent>
              <div className="space-y-4">
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-white/50">Weekly Progress</span>
                    <span className="font-medium text-white/90">65%</span>
                  </div>
                  <Progress 
                    value={65}
                    className="h-1.5 bg-white/5 [&>div]:bg-purple-500/80"
                  />
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-white/50">Monthly Goals</span>
                    <span className="font-medium text-white/90">42%</span>
                  </div>
                  <Progress 
                    value={42}
                    className="h-1.5 bg-white/5 [&>div]:bg-blue-500/80"
                  />
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-white/50">Annual Target</span>
                    <span className="font-medium text-white/90">78%</span>
                  </div>
                  <Progress 
                    value={78}
                    className="h-1.5 bg-white/5 [&>div]:bg-green-500/80"
                  />
                </div>
              </div>
            </VisionCardContent>
            <VisionCardFooter>
              <Button variant="outline" size="sm" className="bg-white/5 border-white/20 text-white/90 hover:bg-white/10">
                View Details <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </VisionCardFooter>
          </VisionCard>

          {/* Card 3 */}
          <VisionCard variant="dark" hover="subtle">
            <VisionCardHeader>
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-full bg-blue-900/30 border border-blue-500/20 flex items-center justify-center">
                  <ShieldCheck className="h-5 w-5 text-blue-400" />
                </div>
                <VisionCardTitle>Security Status</VisionCardTitle>
              </div>
              <VisionCardDescription>
                Account security and verification status
              </VisionCardDescription>
            </VisionCardHeader>
            <VisionCardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-lg border border-white/10 bg-white/5">
                  <div className="h-8 w-8 rounded-full bg-green-950/50 flex items-center justify-center border border-green-500/20">
                    <ShieldCheck className="h-4 w-4 text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm text-white/90 font-medium">Account Secure</p>
                    <p className="text-xs text-white/60">Last verified 3 days ago</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 rounded-lg border border-white/10 bg-white/5">
                  <div className="h-8 w-8 rounded-full bg-amber-950/50 flex items-center justify-center border border-amber-500/20">
                    <BellRing className="h-4 w-4 text-amber-400" />
                  </div>
                  <div>
                    <p className="text-sm text-white/90 font-medium">Notifications Active</p>
                    <p className="text-xs text-white/60">Security alerts enabled</p>
                  </div>
                </div>
              </div>
            </VisionCardContent>
            <VisionCardFooter>
              <Button variant="outline" size="sm" className="bg-white/5 border-white/20 text-white/90 hover:bg-white/10">
                Security Settings <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </VisionCardFooter>
          </VisionCard>
        </div>
        
        {/* Nowboard example using the new Vision UI style */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <VisionCard variant="dark" size="lg" hover="subtle">
              <VisionCardHeader>
                <VisionCardTitle>Activity Dashboard</VisionCardTitle>
                <VisionCardDescription>
                  Your professional activity and engagement metrics
                </VisionCardDescription>
              </VisionCardHeader>
              <VisionCardContent>
                <div className="h-64 rounded-lg border border-white/10 bg-white/5 flex items-center justify-center">
                  <p className="text-white/50">Activity Graph Placeholder</p>
                </div>
              </VisionCardContent>
            </VisionCard>
          </div>
          
          <div>
            <VisionNowboardSuggestions userId={1} />
          </div>
        </div>
      </main>
    </div>
  );
}