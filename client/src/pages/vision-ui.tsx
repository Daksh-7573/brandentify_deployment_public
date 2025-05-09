import { useState } from 'react';
import { 
  VisionCard, 
  VisionCardHeader, 
  VisionCardTitle, 
  VisionCardDescription, 
  VisionCardContent,
  VisionCardFooter
} from '@/components/ui/vision-card';
import { VisionButton } from '@/components/ui/vision-button';
import { VisionInput } from '@/components/ui/vision-input';
import { 
  VisionSelect, 
  VisionSelectTrigger, 
  VisionSelectValue, 
  VisionSelectContent, 
  VisionSelectItem 
} from '@/components/ui/vision-select';
import { ArrowRight, Zap, MessageSquare, ThumbsUp, Bot, Lightbulb, User, BellRing, FileText, ShieldCheck, Award, Search } from 'lucide-react';
import { VisionNowboardSuggestions } from '@/components/brand-quests/vision-nowboard-suggestions';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { VisionLayout } from '@/components/layout/vision-layout';

export default function VisionUIPage() {
  return (
    <VisionLayout>
      <div className="space-y-8">
        {/* Hero section */}
        <VisionCard className="mb-8" variant="dark" hover="glow">
          <VisionCardContent className="flex flex-col md:flex-row gap-6 items-center p-6">
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold mb-4 text-[#E5E5E7]">Vision Pro Inspired UI</h1>
              <p className="text-lg text-[#A1A1AA] mb-6">
                Experience the future of design with our glassmorphic interface, 
                inspired by Apple's Vision Pro aesthetic.
              </p>
              <div className="flex flex-wrap gap-3">
                <VisionButton>
                  Explore Components
                </VisionButton>
                <VisionButton variant="outline">
                  Learn More <ArrowRight className="ml-2 h-4 w-4" />
                </VisionButton>
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

        {/* Card Variants Showcase */}
        <h2 className="text-2xl font-bold mb-4 text-[#E5E5E7]">VisionCard Variants</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Default Variant */}
          <VisionCard variant="default" hover="none">
            <VisionCardHeader>
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-full bg-[#4F8CFF]/10 border border-[#4F8CFF]/20 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-[#4F8CFF]" />
                </div>
                <VisionCardTitle>Default Card</VisionCardTitle>
              </div>
              <VisionCardDescription>
                Standard variant with no hover effect
              </VisionCardDescription>
            </VisionCardHeader>
            <VisionCardContent>
              <div className="space-y-3">
                <div className="p-3 rounded-lg border border-[#3A3A3C] bg-white/5">
                  <p className="text-sm text-[#E5E5E7] font-medium">Card Content</p>
                  <p className="text-xs text-[#A1A1AA]">No hover effects applied</p>
                </div>
              </div>
            </VisionCardContent>
            <VisionCardFooter>
              <VisionButton variant="outline" size="sm">
                Default <ArrowRight className="ml-1 h-3 w-3" />
              </VisionButton>
            </VisionCardFooter>
          </VisionCard>

          {/* Dark Variant with Subtle Hover */}
          <VisionCard variant="dark" hover="subtle">
            <VisionCardHeader>
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-full bg-[#3ED7C2]/10 border border-[#3ED7C2]/20 flex items-center justify-center">
                  <Award className="h-5 w-5 text-[#3ED7C2]" />
                </div>
                <VisionCardTitle>Dark Card</VisionCardTitle>
              </div>
              <VisionCardDescription>
                Dark variant with subtle hover effect
              </VisionCardDescription>
            </VisionCardHeader>
            <VisionCardContent>
              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#A1A1AA]">Hover over this card</span>
                  <span className="font-medium text-[#E5E5E7]">Subtle effect</span>
                </div>
                <Progress 
                  value={65}
                  className="h-1.5 bg-white/5 [&>div]:bg-[#3ED7C2]"
                />
              </div>
            </VisionCardContent>
            <VisionCardFooter>
              <VisionButton variant="secondary" size="sm">
                Hover Me <ArrowRight className="ml-1 h-3 w-3" />
              </VisionButton>
            </VisionCardFooter>
          </VisionCard>

          {/* Light Variant with Glow Hover */}
          <VisionCard variant="light" hover="glow">
            <VisionCardHeader>
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-full bg-[#4ADE80]/10 border border-[#4ADE80]/20 flex items-center justify-center">
                  <ShieldCheck className="h-5 w-5 text-[#4ADE80]" />
                </div>
                <VisionCardTitle>Light Card</VisionCardTitle>
              </div>
              <VisionCardDescription>
                Light variant with glow hover effect
              </VisionCardDescription>
            </VisionCardHeader>
            <VisionCardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-lg border border-[#3A3A3C] bg-white/5">
                  <div className="h-8 w-8 rounded-full bg-[#4ADE80]/10 flex items-center justify-center border border-[#4ADE80]/20">
                    <ShieldCheck className="h-4 w-4 text-[#4ADE80]" />
                  </div>
                  <div>
                    <p className="text-sm text-[#E5E5E7] font-medium">Hover for glow effect</p>
                    <p className="text-xs text-[#A1A1AA]">See the glow animation</p>
                  </div>
                </div>
              </div>
            </VisionCardContent>
            <VisionCardFooter>
              <VisionButton variant="success" size="sm">
                Hover Me <ArrowRight className="ml-1 h-3 w-3" />
              </VisionButton>
            </VisionCardFooter>
          </VisionCard>
        </div>
        
        {/* Additional Use Cases */}
        <h2 className="text-2xl font-bold mb-4 text-[#E5E5E7]">Use Cases</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Document Card */}
          <VisionCard variant="default" hover="subtle">
            <VisionCardHeader>
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-full bg-[#4F8CFF]/10 border border-[#4F8CFF]/20 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-[#4F8CFF]" />
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
                  <div key={i} className="p-3 rounded-lg border border-[#3A3A3C] bg-white/5 hover:bg-white/8 transition-all">
                    <p className="text-sm text-[#E5E5E7] font-medium">Document {i}</p>
                    <p className="text-xs text-[#A1A1AA]">Last edited 2 days ago</p>
                  </div>
                ))}
              </div>
            </VisionCardContent>
            <VisionCardFooter>
              <VisionButton variant="outline" size="sm">
                View All <ArrowRight className="ml-1 h-3 w-3" />
              </VisionButton>
            </VisionCardFooter>
          </VisionCard>

          {/* Achievements Card */}
          <VisionCard variant="dark" hover="glow">
            <VisionCardHeader>
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-full bg-[#3ED7C2]/10 border border-[#3ED7C2]/20 flex items-center justify-center">
                  <Award className="h-5 w-5 text-[#3ED7C2]" />
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
              <VisionButton variant="secondary" size="sm">
                View Details <ArrowRight className="ml-1 h-3 w-3" />
              </VisionButton>
            </VisionCardFooter>
          </VisionCard>

          {/* Security Card */}
          <VisionCard variant="light" hover="subtle">
            <VisionCardHeader>
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-full bg-[#4ADE80]/10 border border-[#4ADE80]/20 flex items-center justify-center">
                  <ShieldCheck className="h-5 w-5 text-[#4ADE80]" />
                </div>
                <VisionCardTitle>Security Status</VisionCardTitle>
              </div>
              <VisionCardDescription>
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
              <VisionButton variant="success" size="sm">
                Security Settings <ArrowRight className="ml-1 h-3 w-3" />
              </VisionButton>
            </VisionCardFooter>
          </VisionCard>
        </div>
        
        {/* Form Controls */}
        <h2 className="text-2xl font-bold mb-4 text-[#E5E5E7]">Form Controls</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Input Fields */}
          <VisionCard variant="default" hover="subtle">
            <VisionCardHeader>
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-full bg-[#4F8CFF]/10 border border-[#4F8CFF]/20 flex items-center justify-center">
                  <User className="h-5 w-5 text-[#4F8CFF]" />
                </div>
                <VisionCardTitle>Input Controls</VisionCardTitle>
              </div>
              <VisionCardDescription>
                Vision-styled text input fields
              </VisionCardDescription>
            </VisionCardHeader>
            <VisionCardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs text-[#A1A1AA]">Basic Input</label>
                  <VisionInput placeholder="Enter text here..." />
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs text-[#A1A1AA]">With Icon</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#A1A1AA]" />
                    <VisionInput className="pl-9" placeholder="Search..." />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs text-[#A1A1AA]">Disabled Input</label>
                  <VisionInput disabled placeholder="Not available" />
                </div>
              </div>
            </VisionCardContent>
            <VisionCardFooter>
              <VisionButton variant="default" size="sm">
                Submit <ArrowRight className="ml-1 h-3 w-3" />
              </VisionButton>
            </VisionCardFooter>
          </VisionCard>

          {/* Select Fields */}
          <VisionCard variant="dark" hover="subtle">
            <VisionCardHeader>
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-full bg-[#3ED7C2]/10 border border-[#3ED7C2]/20 flex items-center justify-center">
                  <Zap className="h-5 w-5 text-[#3ED7C2]" />
                </div>
                <VisionCardTitle>Select Controls</VisionCardTitle>
              </div>
              <VisionCardDescription>
                Dropdown selection with glassmorphic styling
              </VisionCardDescription>
            </VisionCardHeader>
            <VisionCardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs text-[#A1A1AA]">Basic Select</label>
                  <VisionSelect>
                    <VisionSelectTrigger>
                      <VisionSelectValue placeholder="Select an option" />
                    </VisionSelectTrigger>
                    <VisionSelectContent>
                      <VisionSelectItem value="design">UI/UX Design</VisionSelectItem>
                      <VisionSelectItem value="development">Development</VisionSelectItem>
                      <VisionSelectItem value="marketing">Marketing</VisionSelectItem>
                      <VisionSelectItem value="product">Product Management</VisionSelectItem>
                    </VisionSelectContent>
                  </VisionSelect>
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs text-[#A1A1AA]">Sort By</label>
                  <VisionSelect defaultValue="recent">
                    <VisionSelectTrigger>
                      <VisionSelectValue placeholder="Sort by" />
                    </VisionSelectTrigger>
                    <VisionSelectContent>
                      <VisionSelectItem value="recent">Most Recent</VisionSelectItem>
                      <VisionSelectItem value="popular">Most Popular</VisionSelectItem>
                      <VisionSelectItem value="trending">Trending</VisionSelectItem>
                    </VisionSelectContent>
                  </VisionSelect>
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs text-[#A1A1AA]">Time Period</label>
                  <VisionSelect>
                    <VisionSelectTrigger>
                      <VisionSelectValue placeholder="Select time period" />
                    </VisionSelectTrigger>
                    <VisionSelectContent>
                      <VisionSelectItem value="day">Last 24 Hours</VisionSelectItem>
                      <VisionSelectItem value="week">Last 7 Days</VisionSelectItem>
                      <VisionSelectItem value="month">Last 30 Days</VisionSelectItem>
                      <VisionSelectItem value="year">Last Year</VisionSelectItem>
                    </VisionSelectContent>
                  </VisionSelect>
                </div>
              </div>
            </VisionCardContent>
            <VisionCardFooter>
              <VisionButton variant="secondary" size="sm">
                Apply Filters <ArrowRight className="ml-1 h-3 w-3" />
              </VisionButton>
            </VisionCardFooter>
          </VisionCard>

          {/* Button Variants */}
          <VisionCard variant="light" hover="glow">
            <VisionCardHeader>
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-full bg-[#4ADE80]/10 border border-[#4ADE80]/20 flex items-center justify-center">
                  <Award className="h-5 w-5 text-[#4ADE80]" />
                </div>
                <VisionCardTitle>Button Variants</VisionCardTitle>
              </div>
              <VisionCardDescription>
                Enhanced buttons with hover effects
              </VisionCardDescription>
            </VisionCardHeader>
            <VisionCardContent>
              <div className="grid grid-cols-2 gap-3">
                <VisionButton variant="default">
                  Default
                </VisionButton>
                <VisionButton variant="secondary">
                  Secondary
                </VisionButton>
                
                <VisionButton variant="success">
                  Success
                </VisionButton>
                <VisionButton variant="destructive">
                  Destructive
                </VisionButton>
                
                <VisionButton variant="warning">
                  Warning
                </VisionButton>
                <VisionButton variant="outline">
                  Outline
                </VisionButton>
                
                <VisionButton variant="glass">
                  Glass
                </VisionButton>
                <VisionButton variant="ghost">
                  Ghost
                </VisionButton>
              </div>
            </VisionCardContent>
            <VisionCardFooter>
              <VisionButton variant="link" className="mr-auto">
                Learn More
              </VisionButton>
              <VisionButton variant="success" size="sm">
                Proceed <ArrowRight className="ml-1 h-3 w-3" />
              </VisionButton>
            </VisionCardFooter>
          </VisionCard>
        </div>

        {/* Nowboard example using the new Vision UI style */}
        <h2 className="text-2xl font-bold mb-4 text-[#E5E5E7]">Integration Examples</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <VisionCard variant="dark" hover="subtle">
              <VisionCardHeader>
                <VisionCardTitle>Activity Dashboard</VisionCardTitle>
                <VisionCardDescription>
                  Your professional activity and engagement metrics
                </VisionCardDescription>
              </VisionCardHeader>
              <VisionCardContent>
                <div className="h-64 rounded-lg border border-[#3A3A3C] bg-white/5 flex items-center justify-center">
                  <p className="text-[#A1A1AA]">Activity Graph Placeholder</p>
                </div>
              </VisionCardContent>
              <VisionCardFooter className="flex justify-between items-center">
                <div className="text-xs text-[#A1A1AA]">
                  Last updated: Today at 12:05 PM
                </div>
                <VisionButton variant="outline" size="sm">
                  View Details <ArrowRight className="ml-1 h-3 w-3" />
                </VisionButton>
              </VisionCardFooter>
            </VisionCard>
          </div>
          
          <div>
            <VisionNowboardSuggestions userId={1} />
          </div>
        </div>
      </div>
    </VisionLayout>
  );
}