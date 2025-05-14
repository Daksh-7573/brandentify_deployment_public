import React, { useState } from 'react';
import { 
  NeoPageContainer, 
  NeoGlassCard, 
  NeoGlassButton, 
  NeoGlassSwitch, 
  NeoGlassProgress, 
  NeoGlassAvatar,
  NeoGlassInput, 
  NeoGlassBadge,
  NeoGlassSparkle
} from '@/components/ui/neo-glass';
import NeoGlassMuskAI from '@/components/musk/neo-glass-musk';
import { Heart, Star, Sparkles, Image, LayoutGrid, MessageSquare, Bell } from 'lucide-react';

export default function NeoGlassDemoPage() {
  const [switchOn, setSwitchOn] = useState(false);
  
  const placeholderImage = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80';
  
  return (
    <NeoPageContainer className="p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col gap-12">
          {/* Header Card */}
          <NeoGlassCard 
            className="flex flex-col items-center justify-center p-10 text-center relative overflow-visible"
            glow="primary"
          >
            <h1 className="text-4xl md:text-5xl font-bold neo-glass-text mb-4">
              Neo-Glass UI
            </h1>
            <p className="neo-glass-text-muted text-xl max-w-2xl">
              Modern glassmorphism UI for Brandentifier with frosted glass elements, 
              gradients, and elegant glowing accents.
            </p>
            
            {/* Sparkles */}
            <NeoGlassSparkle top="-20px" left="15%" />
            <NeoGlassSparkle top="40px" left="85%" delay={1.2} />
            <NeoGlassSparkle top="80%" left="10%" delay={0.5} />
            <NeoGlassSparkle top="70%" left="90%" delay={1.7} />
          </NeoGlassCard>
          
          {/* Components Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Buttons Card */}
            <NeoGlassCard>
              <h2 className="neo-glass-text text-xl font-semibold mb-4">Buttons</h2>
              <div className="flex flex-col gap-4">
                <NeoGlassButton variant="primary">Primary Button</NeoGlassButton>
                <NeoGlassButton variant="secondary">Secondary Button</NeoGlassButton>
                <NeoGlassButton variant="tertiary">Tertiary Button</NeoGlassButton>
                <NeoGlassButton>Default Button</NeoGlassButton>
                
                <div className="flex gap-2">
                  <NeoGlassButton variant="primary" isIcon>
                    <Heart className="w-5 h-5" />
                  </NeoGlassButton>
                  <NeoGlassButton variant="secondary" isIcon>
                    <Star className="w-5 h-5" />
                  </NeoGlassButton>
                  <NeoGlassButton variant="tertiary" isIcon>
                    <Sparkles className="w-5 h-5" />
                  </NeoGlassButton>
                </div>
              </div>
            </NeoGlassCard>
            
            {/* Profile Card */}
            <NeoGlassCard className="flex flex-col items-center text-center" glow="secondary">
              <div className="relative">
                <NeoGlassAvatar 
                  src={placeholderImage} 
                  alt="Laura Williams"
                  size={96}
                  className="mb-4"
                />
                <NeoGlassSparkle top="-10px" left="-5px" />
              </div>
              <h3 className="neo-glass-text text-xl font-semibold">Laura Williams</h3>
              <p className="neo-glass-text-muted mb-4">Product Designer</p>
              
              <div className="flex gap-2 mb-6">
                <NeoGlassBadge>UI Design</NeoGlassBadge>
                <NeoGlassBadge>UX Research</NeoGlassBadge>
              </div>
              
              <NeoGlassButton variant="primary">View Profile</NeoGlassButton>
            </NeoGlassCard>
            
            {/* Progress Card */}
            <NeoGlassCard>
              <div className="flex justify-between items-center mb-6">
                <h2 className="neo-glass-text text-xl font-semibold">Profile completed!</h2>
                <div className="w-12 h-12 rounded-full flex items-center justify-center neo-glass-text" style={{ background: 'rgba(255, 255, 255, 0.2)' }}>
                  <span className="text-lg font-semibold">80%</span>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="neo-glass-text-muted text-sm">Process</span>
                  </div>
                  <NeoGlassProgress value={80} />
                </div>
                
                <div className="flex gap-3 pt-2">
                  <NeoGlassButton variant="primary">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Complete
                  </NeoGlassButton>
                  <NeoGlassButton>
                    Skip
                  </NeoGlassButton>
                </div>
              </div>
            </NeoGlassCard>
            
            {/* Toggle & Input Card */}
            <NeoGlassCard>
              <h2 className="neo-glass-text text-xl font-semibold mb-4">Toggles & Inputs</h2>
              
              <div className="space-y-5 mb-6">
                <NeoGlassSwitch 
                  checked={switchOn}
                  onChange={() => setSwitchOn(!switchOn)}
                  label={switchOn ? 'ON' : 'OFF'}
                />
                
                <NeoGlassInput 
                  label="Your Name"
                  placeholder="Enter your name"
                />
                
                <NeoGlassInput 
                  label="Email Address"
                  type="email"
                  placeholder="you@example.com"
                />
              </div>
              
              <NeoGlassButton variant="secondary" className="w-full">
                Save Settings
              </NeoGlassButton>
            </NeoGlassCard>
            
            {/* Tip Card */}
            <NeoGlassCard className="relative" glow="tertiary">
              <div className="absolute top-3 right-3">
                <Bell className="w-5 h-5 text-white/70" />
              </div>
              
              <h2 className="neo-glass-text text-xl font-semibold mb-2">Tip of the Day</h2>
              
              <p className="neo-glass-text-muted mb-6">
                Keep your project descriptions concise and focused. Use bullet points to highlight key achievements.
              </p>
              
              <div className="flex justify-between">
                <NeoGlassButton variant="tertiary" isIcon>
                  <Heart className="w-4 h-4" />
                </NeoGlassButton>
                
                <NeoGlassButton className="text-sm py-1 px-3">
                  Next Tip
                </NeoGlassButton>
              </div>
            </NeoGlassCard>
            
            {/* Media Card */}
            <NeoGlassCard glow="primary">
              <h2 className="neo-glass-text text-xl font-semibold mb-3">App Redesign</h2>
              <p className="neo-glass-text-muted mb-3">UI Design</p>
              
              <div className="h-36 mb-4 bg-blue-500/30 rounded-lg flex items-center justify-center">
                <Image className="w-12 h-12 text-white/70" />
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex">
                  <NeoGlassButton variant="primary" isIcon>
                    <Heart className="w-4 h-4" />
                  </NeoGlassButton>
                  <NeoGlassButton variant="secondary" isIcon className="ml-2">
                    <MessageSquare className="w-4 h-4" />
                  </NeoGlassButton>
                </div>
                
                <NeoGlassButton>
                  <LayoutGrid className="w-4 h-4 mr-2" />
                  Showcase
                </NeoGlassButton>
              </div>
            </NeoGlassCard>
          </div>
        </div>
      </div>
      
      {/* Musk AI Component */}
      <NeoGlassMuskAI />
    </NeoPageContainer>
  );
}