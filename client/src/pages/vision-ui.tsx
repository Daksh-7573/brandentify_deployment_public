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
      className="min-h-screen w-full" 
      style={{ 
        backgroundColor: '#1C1C1E',
        backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(60, 60, 80, 0.2) 0%, rgba(28, 28, 30, 0.05) 100%)'
      }}
    >
      {/* Vision Pro-style header */}
      <header className="py-6 px-8 backdrop-blur-md bg-[#1C1C1E]/80 border-b border-[#3A3A3C]">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-[#E5E5E7]">Vision UI Demo</h1>
          <div className="flex items-center gap-4">
            <Button variant="ghost" className="text-[#A1A1AA] hover:text-[#E5E5E7]">
              <BellRing className="h-5 w-5" />
            </Button>
            <Avatar className="h-9 w-9 border border-[#3A3A3C]">
              <AvatarFallback className="bg-[#4F8CFF]/10">
                <User className="h-5 w-5 text-[#4F8CFF]" />
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
              <h1 className="text-3xl md:text-4xl font-bold mb-4 text-[#E5E5E7]">Vision Pro Inspired UI</h1>
              <p className="text-lg text-[#A1A1AA] mb-6">
                Experience the future of design with our glassmorphic interface, 
                inspired by Apple's Vision Pro aesthetic.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button className="bg-[#4F8CFF]/10 border border-[#4F8CFF]/20 text-[#E5E5E7] hover:bg-[#4F8CFF]/20">
                  Explore Components
                </Button>
                <Button variant="outline" className="border-[#3A3A3C] text-[#A1A1AA] hover:bg-white/5 hover:text-[#E5E5E7] hover:border-[#3A3A3C]">
                  Learn More <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="flex-shrink-0 w-full md:w-1/3 aspect-video rounded-xl bg-white/5 border border-[#3A3A3C] flex items-center justify-center">
              <div className="text-center">
                <Lightbulb className="h-12 w-12 mx-auto mb-2 text-[#4F8CFF]/80" />
                <p className="text-[#A1A1AA]">Preview Area</p>
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
                <div className="h-10 w-10 rounded-full bg-[#4F8CFF]/10 border border-[#4F8CFF]/20 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-[#4F8CFF]" />
                </div>
                <VisionCardTitle>Documents</VisionCardTitle>
              </div>
              <VisionCardDescription className="text-[#A1A1AA]">
                Manage and organize your professional documents
              </VisionCardDescription>
            </VisionCardHeader>
            <VisionCardContent>
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="p-3 rounded-lg border border-[#3A3A3C] bg-white/5 hover:bg-white/8 transition-all">
                    <p className="text-sm text-[#E5E5E7] font-medium">Document {i}</p>
                    <p className="text-xs text-[#A1A1AA]">Last edited 2 days ago</p>
                  </div>
                ))}
              </div>
            </VisionCardContent>
            <VisionCardFooter>
              <Button variant="outline" size="sm" className="bg-white/5 border-[#3A3A3C] text-[#E5E5E7] hover:bg-[#4F8CFF]/10 hover:border-[#4F8CFF]/20 hover:text-[#E5E5E7]">
                View All <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </VisionCardFooter>
          </VisionCard>

          {/* Card 2 */}
          <VisionCard variant="dark" hover="subtle">
            <VisionCardHeader>
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-full bg-[#3ED7C2]/10 border border-[#3ED7C2]/20 flex items-center justify-center">
                  <Award className="h-5 w-5 text-[#3ED7C2]" />
                </div>
                <VisionCardTitle>Achievements</VisionCardTitle>
              </div>
              <VisionCardDescription className="text-[#A1A1AA]">
                Track your progress and recent accomplishments
              </VisionCardDescription>
            </VisionCardHeader>
            <VisionCardContent>
              <div className="space-y-4">
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[#A1A1AA]">Weekly Progress</span>
                    <span className="font-medium text-[#E5E5E7]">65%</span>
                  </div>
                  <Progress 
                    value={65}
                    className="h-1.5 bg-white/5 [&>div]:bg-[#4F8CFF]"
                  />
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[#A1A1AA]">Monthly Goals</span>
                    <span className="font-medium text-[#E5E5E7]">42%</span>
                  </div>
                  <Progress 
                    value={42}
                    className="h-1.5 bg-white/5 [&>div]:bg-[#3ED7C2]"
                  />
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[#A1A1AA]">Annual Target</span>
                    <span className="font-medium text-[#E5E5E7]">78%</span>
                  </div>
                  <Progress 
                    value={78}
                    className="h-1.5 bg-white/5 [&>div]:bg-[#4ADE80]"
                  />
                </div>
              </div>
            </VisionCardContent>
            <VisionCardFooter>
              <Button variant="outline" size="sm" className="bg-white/5 border-[#3A3A3C] text-[#E5E5E7] hover:bg-[#3ED7C2]/10 hover:border-[#3ED7C2]/20 hover:text-[#E5E5E7]">
                View Details <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </VisionCardFooter>
          </VisionCard>

          {/* Card 3 */}
          <VisionCard variant="dark" hover="subtle">
            <VisionCardHeader>
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-full bg-[#4F8CFF]/10 border border-[#4F8CFF]/20 flex items-center justify-center">
                  <ShieldCheck className="h-5 w-5 text-[#4F8CFF]" />
                </div>
                <VisionCardTitle>Security Status</VisionCardTitle>
              </div>
              <VisionCardDescription className="text-[#A1A1AA]">
                Account security and verification status
              </VisionCardDescription>
            </VisionCardHeader>
            <VisionCardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-lg border border-[#3A3A3C] bg-white/5">
                  <div className="h-8 w-8 rounded-full bg-[#4ADE80]/10 flex items-center justify-center border border-[#4ADE80]/20">
                    <ShieldCheck className="h-4 w-4 text-[#4ADE80]" />
                  </div>
                  <div>
                    <p className="text-sm text-[#E5E5E7] font-medium">Account Secure</p>
                    <p className="text-xs text-[#A1A1AA]">Last verified 3 days ago</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 rounded-lg border border-[#3A3A3C] bg-white/5">
                  <div className="h-8 w-8 rounded-full bg-[#FCD34D]/10 flex items-center justify-center border border-[#FCD34D]/20">
                    <BellRing className="h-4 w-4 text-[#FCD34D]" />
                  </div>
                  <div>
                    <p className="text-sm text-[#E5E5E7] font-medium">Notifications Active</p>
                    <p className="text-xs text-[#A1A1AA]">Security alerts enabled</p>
                  </div>
                </div>
              </div>
            </VisionCardContent>
            <VisionCardFooter>
              <Button variant="outline" size="sm" className="bg-white/5 border-[#3A3A3C] text-[#E5E5E7] hover:bg-[#4F8CFF]/10 hover:border-[#4F8CFF]/20 hover:text-[#E5E5E7]">
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
                <VisionCardDescription className="text-[#A1A1AA]">
                  Your professional activity and engagement metrics
                </VisionCardDescription>
              </VisionCardHeader>
              <VisionCardContent>
                <div className="h-64 rounded-lg border border-[#3A3A3C] bg-white/5 flex items-center justify-center">
                  <p className="text-[#A1A1AA]">Activity Graph Placeholder</p>
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