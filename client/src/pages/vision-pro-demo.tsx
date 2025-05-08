import React, { useState } from 'react';
import { User, MessageSquare, Briefcase, Award, Lightbulb, Share2, Send, ArrowRight, Eye, Layers, Move3d } from 'lucide-react';
import { 
  TrackableButton, 
  GazeAwareCard, 
  SpatialInfoPanel,
  VisionProDetector,
  FloatingElement,
  SmartTransition,
  DepthGradient 
} from '@/components/vision-pro';

/**
 * Vision Pro Demo Page
 * 
 * This page demonstrates all the Vision Pro UI components in a realistic
 * career profile context, showing how they work together to create a
 * more immersive and spatial experience.
 */
const VisionProDemoPage: React.FC = () => {
  // Demo user data
  const demoUser = {
    name: "Alex Johnson",
    title: "Senior Product Designer",
    photoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1064&q=80",
  };
  
  // Demo skills
  const demoSkills = [
    "UI/UX Design",
    "User Research",
    "Product Strategy",
    "Design Systems",
    "Figma & Adobe XD"
  ];
  
  // Demo experience
  const demoExperience = [
    { company: "DesignCraft", role: "Senior Product Designer", years: "2020 - Present" },
    { company: "InnovateTech", role: "UX Designer", years: "2017 - 2020" },
    { company: "CreativeAgency", role: "UI Designer", years: "2015 - 2017" }
  ];
  
  // Demo achievements
  const demoAchievements = [
    "Led design for 3 award-winning products",
    "Reduced user onboarding time by 40%",
    "Speaker at Design Summit 2023",
    "Published in UX Magazine"
  ];
  
  return (
    <VisionProDetector>
      {(capabilities) => (
        <div className="relative min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 overflow-hidden p-4">
          {/* Vision Pro detection banner */}
          <div className="absolute top-0 left-0 right-0 bg-primary/10 text-primary text-center py-2 z-50">
            {capabilities.hasVisionProFeatures 
              ? "✨ Vision Pro mode activated! Enhanced spatial UI enabled."
              : "Standard mode active. Vision Pro enhancements will activate automatically when detected."}
          </div>
          
          {/* Main container */}
          <div className="max-w-7xl mx-auto pt-12 relative">
            {/* Main profile card - large, easily trackable */}
            <div className="relative mx-auto mt-8 mb-16 max-w-2xl">
              <GazeAwareCard 
                title="Professional Profile"
                variant="elevated"
                icon={<User />}
                className="w-full"
              >
                <div className="flex flex-col md:flex-row gap-6 items-center mb-6">
                  <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-primary shrink-0">
                    <img src={demoUser.photoUrl} alt={demoUser.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-gray-800 dark:text-white">{demoUser.name}</h2>
                    <p className="text-xl text-gray-600 dark:text-gray-300">{demoUser.title}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Using {capabilities.hasVisionProFeatures ? 'Vision Pro enhanced' : 'standard'} interface
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                  <TrackableButton 
                    size="large" 
                    variant="primary"
                    icon={<MessageSquare size={18} />}
                    optimizedForVisionPro={capabilities.hasVisionProFeatures}
                  >
                    Connect
                  </TrackableButton>
                  <TrackableButton 
                    size="large" 
                    variant="outline"
                    icon={<Share2 size={18} />}
                    optimizedForVisionPro={capabilities.hasVisionProFeatures}
                  >
                    Share Profile
                  </TrackableButton>
                </div>
              </GazeAwareCard>
            </div>
            
            {/* Interactive elements with spatial anchoring */}
            <div className="relative h-[600px] border border-gray-200 dark:border-gray-700 rounded-3xl bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm mx-4 my-8">
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-gray-400 dark:text-gray-500 text-xl font-medium">
                  Spatial Information Zone
                </p>
              </div>
              
              {/* Spatially anchored skills section */}
              <SpatialInfoPanel 
                title="Top Skills" 
                icon={<Lightbulb />}
                items={demoSkills.map(skill => skill)}
                position="top-right" 
                zDepth={5}
                glassEffect={true}
              />
              
              {/* Spatially anchored experience section */}
              <SpatialInfoPanel 
                title="Experience" 
                icon={<Briefcase />}
                items={demoExperience.map(e => (
                  <div key={e.company}>
                    <p className="font-medium">{e.role}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {e.company} · {e.years}
                    </p>
                  </div>
                ))}
                position="bottom-left" 
                zDepth={3}
                glassEffect={true}
              />
              
              {/* Spatially anchored achievements section */}
              <SpatialInfoPanel 
                title="Achievements" 
                icon={<Award />}
                items={demoAchievements.map(achievement => achievement)}
                position="top-left" 
                zDepth={4}
                glassEffect={true}
              />
            </div>
            
            {/* Action Panel */}
            <div className="max-w-4xl mx-auto mt-8 p-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-xl shadow-lg">
              <h3 className="text-xl font-bold mb-4">Vision Pro UI Components</h3>
              <p className="mb-4 text-gray-600 dark:text-gray-300">
                These components are optimized for Vision Pro's gesture and eye tracking capabilities.
                They feature larger touch targets, enhanced visual feedback, and depth effects.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <TrackableButton 
                  variant="primary"
                  icon={<Send size={16} />}
                  optimizedForVisionPro={capabilities.hasVisionProFeatures}
                >
                  Primary Action
                </TrackableButton>
                
                <TrackableButton 
                  variant="secondary"
                  optimizedForVisionPro={capabilities.hasVisionProFeatures}
                >
                  Secondary Action
                </TrackableButton>
                
                <TrackableButton 
                  variant="outline"
                  optimizedForVisionPro={capabilities.hasVisionProFeatures}
                >
                  Outline Style
                </TrackableButton>
              </div>
            </div>
            
            {/* NEW COMPONENTS SHOWCASE */}
            <div className="max-w-5xl mx-auto mt-16 mb-12">
              <h2 className="text-2xl font-bold mb-8 text-center text-gray-800 dark:text-white">
                New Vision Pro UI Components
              </h2>
              
              {/* Quick Design Wins Showcase */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* 1. FloatingElement Showcase */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-700 dark:text-gray-200">
                    <Move3d className="text-primary" size={20} />
                    Floating UI Elements
                  </h3>
                  <div className="h-64 relative flex items-center justify-center bg-gray-100/50 dark:bg-gray-700/30 rounded-lg">
                    <FloatingElement 
                      floatLevel={6} 
                      glowEffect={true}
                      className="p-5 w-full max-w-xs mx-auto"
                    >
                      <div className="space-y-3">
                        <h4 className="font-medium text-gray-800 dark:text-white">Career Growth Plan</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          Hover to see this card float above the background with subtle parallax movement.
                        </p>
                        <div className="pt-2">
                          <button className="px-4 py-2 bg-primary/90 text-white rounded-md text-sm w-full">
                            Explore Plan
                          </button>
                        </div>
                      </div>
                    </FloatingElement>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Cards and menus that appear to float in space with subtle parallax movement on cursor hover. Great for call-to-action elements.
                  </p>
                </div>
                
                {/* 2. SmartTransition Showcase */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-700 dark:text-gray-200">
                    <ArrowRight className="text-primary" size={20} />
                    Smart Transitions
                  </h3>
                  <div className="h-64 relative flex items-center justify-center bg-gray-100/50 dark:bg-gray-700/30 rounded-lg">
                    <SmartTransition 
                      type="spatial"
                      direction="forward"
                      secondaryContent={
                        <div className="p-5 bg-white/90 dark:bg-gray-800/90 rounded-xl border border-gray-200 dark:border-gray-700 w-full max-w-xs mx-auto">
                          <div className="space-y-3">
                            <h4 className="font-medium text-primary">Career Mentor Details</h4>
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                                <User size={20} className="text-primary" />
                              </div>
                              <div>
                                <p className="font-medium">Sarah Wilson</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">UX Director • 8 yrs exp</p>
                              </div>
                            </div>
                            <p className="text-sm">
                              Available for 30-min mentoring sessions on Tuesdays
                            </p>
                          </div>
                        </div>
                      }
                    >
                      <div className="p-5 bg-white/90 dark:bg-gray-800/90 rounded-xl border border-gray-200 dark:border-gray-700 w-full max-w-xs mx-auto">
                        <div className="space-y-3">
                          <h4 className="font-medium text-gray-800 dark:text-white">Find a Career Mentor</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            Hover over this card to see a spatial transition effect. The content will smoothly transform in 3D space.
                          </p>
                          <div className="pt-2 flex justify-end">
                            <div className="px-3 py-1.5 bg-primary/10 text-primary rounded-md text-xs flex items-center gap-1">
                              <Eye size={14} />
                              <span>Hover to see details</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </SmartTransition>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Smooth transitions between UI states that respect spatial positioning. Perfect for revealing additional content while maintaining context.
                  </p>
                </div>
                
                {/* 3. DepthGradient Showcase */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-700 dark:text-gray-200">
                    <Layers className="text-primary" size={20} />
                    Depth Gradients
                  </h3>
                  <div className="h-64 relative flex items-center justify-center bg-gray-100/50 dark:bg-gray-700/30 rounded-lg">
                    <div className="relative w-full max-w-xs mx-auto">
                      <DepthGradient 
                        depth={8} 
                        colorTheme="primary"
                        direction="radial"
                        className="mb-3 p-5"
                      >
                        <h4 className="font-medium text-gray-800 dark:text-white">Career Milestone</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                          Completed Advanced UX Certification
                        </p>
                        <div className="mt-3 flex items-center justify-between">
                          <span className="text-xs text-gray-500 dark:text-gray-400">Last week</span>
                          <span className="px-2 py-0.5 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 text-xs rounded-full">+25 XP</span>
                        </div>
                      </DepthGradient>
                      
                      <DepthGradient 
                        depth={3} 
                        colorTheme="secondary"
                        direction="horizontal"
                        className="p-5 ml-6"
                      >
                        <h4 className="font-medium text-gray-800 dark:text-white">Upcoming Goal</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                          Complete portfolio update
                        </p>
                        <div className="mt-3 flex items-center justify-between">
                          <span className="text-xs text-gray-500 dark:text-gray-400">Due in 2 days</span>
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100 text-xs rounded-full">In progress</span>
                        </div>
                      </DepthGradient>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Subtle color gradients and shadow effects create the illusion of depth. Items with higher depth values appear closer to the user.
                  </p>
                </div>
              </div>
              
              {/* Component explanation */}
              <div className="mt-12 p-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-xl shadow-lg">
                <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-white">Quick Design Wins Implementation</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  These Vision Pro UI components enhance the spatial computing experience by providing depth cues, improved interaction feedback, and smooth transitions between states.
                </p>
                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  <p>• <strong>FloatingElement</strong>: Creates cards and menus that appear to float with parallax effects</p>
                  <p>• <strong>SmartTransition</strong>: Implements smooth transitions that respect spatial positioning</p>
                  <p>• <strong>DepthGradient</strong>: Uses subtle color and shadow changes for depth perception</p>
                </div>
              </div>
            </div>
            
            {/* Info footer */}
            <div className="mt-8 mb-8 text-center text-gray-500 dark:text-gray-400 text-sm">
              <p>
                Hover over elements to see enhanced Vision Pro feedback effects. <br />
                These components automatically adjust based on device capabilities.
              </p>
            </div>
          </div>
        </div>
      )}
    </VisionProDetector>
  );
};

export default VisionProDemoPage;