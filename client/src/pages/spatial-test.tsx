import React, { useState } from 'react';
import { SpatialLayout, FloatingWindow } from '@/components/spatial/SpatialLayout';
import { VisionHeading1, VisionHeading2, VisionHeading3 } from '@/components/ui/vision-headings';
import { EnhancedCard, EnhancedCardHeader, EnhancedCardContent, EnhancedCardFooter } from '@/components/ui/enhanced-card';
import { Button } from '@/components/ui/button';
import { Home, User, Settings, Plus, X } from 'lucide-react';
import { VisionProNavigation } from '@/components/ui/visionpro-nav';

/**
 * SpatialTest - A dedicated page to test the Vision Pro UI components
 * 
 * This page demonstrates various Vision Pro-inspired UI elements and effects
 * in both spatial and regular layouts.
 */
export default function SpatialTest() {
  const [showWindow1, setShowWindow1] = useState(true);
  const [showWindow2, setShowWindow2] = useState(true);
  const [showWindow3, setShowWindow3] = useState(false);
  
  // Navigation items for the Vision Pro navigation
  const navItems = [
    { href: '/spatial-test', icon: <Home className="h-5 w-5" />, label: 'Home' },
    { href: '/profile', icon: <User className="h-5 w-5" />, label: 'Profile' },
    { href: '/settings', icon: <Settings className="h-5 w-5" />, label: 'Settings' },
  ];
  
  return (
    <SpatialLayout backgroundImage="radial-gradient(circle at center, rgba(25, 35, 60, 0.9) 0%, rgba(10, 15, 30, 0.95) 70%, rgba(5, 10, 20, 1) 100%)">
      {/* Main Content Window */}
      <FloatingWindow
        title="Vision Pro Components"
        initialPosition={{ x: 0, y: 0, z: 0 }}
        width="800px"
        onClose={() => setShowWindow1(false)}
        isOpen={showWindow1}
      >
        <div className="p-6 space-y-8">
          <VisionHeading1 variant="gradient">
            Vision Pro UI Components
          </VisionHeading1>
          
          <VisionHeading2 variant="glow">
            Experience Vision Pro-inspired Design
          </VisionHeading2>
          
          <p className="text-white/80 vision-luminous-text">
            This page demonstrates various UI components with Vision Pro styling.
            Experience the dynamic lighting effects, depth controls, and glassmorphic design.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <EnhancedCard variant="spatial" className="col-span-1">
              <EnhancedCardHeader>
                <h3 className="text-xl font-semibold vision-luminous-text">Enhanced Card</h3>
              </EnhancedCardHeader>
              <EnhancedCardContent>
                <p className="text-white/70">
                  This card features dynamic lighting that follows mouse movements,
                  subtle 3D transformations, and glassmorphic effects.
                </p>
              </EnhancedCardContent>
              <EnhancedCardFooter>
                <Button variant="outline" size="sm">Learn More</Button>
              </EnhancedCardFooter>
            </EnhancedCard>
            
            <EnhancedCard variant="dramatic" className="col-span-1">
              <EnhancedCardHeader>
                <h3 className="text-xl font-semibold vision-luminous-text">Dramatic Lighting</h3>
              </EnhancedCardHeader>
              <EnhancedCardContent>
                <p className="text-white/70">
                  The "dramatic" variant adds more pronounced lighting effects
                  and deeper shadows for a more immersive experience.
                </p>
              </EnhancedCardContent>
              <EnhancedCardFooter>
                <Button variant="outline" size="sm">Explore</Button>
              </EnhancedCardFooter>
            </EnhancedCard>
          </div>
          
          <VisionHeading3 variant="highlight">
            Navigation Components
          </VisionHeading3>
          
          <div className="mt-6">
            <VisionProNavigation 
              items={navItems} 
              orientation="horizontal" 
              variant="glassy"
            />
          </div>
          
          <div className="mt-8 flex gap-4">
            <Button
              onClick={() => setShowWindow3(true)}
              className="vision-button"
            >
              <Plus className="mr-2 h-4 w-4" />
              Open New Window
            </Button>
          </div>
        </div>
      </FloatingWindow>
      
      {/* Secondary Window */}
      <FloatingWindow
        title="Spatial Design System"
        initialPosition={{ x: -300, y: 150, z: -10 }}
        width="400px"
        scale={0.9}
        onClose={() => setShowWindow2(false)}
        isOpen={showWindow2}
      >
        <div className="p-5 space-y-4">
          <h3 className="text-xl font-semibold text-white vision-luminous-text">
            Spatial UI Controls
          </h3>
          
          <p className="text-white/70">
            This window demonstrates the spatial UI system with physically-based positioning
            in 3D space.
          </p>
          
          <div className="vision-card p-4 mt-4">
            <p className="text-white/80">
              Windows can be positioned in a 3D environment, creating a more
              immersive and spatial experience.
            </p>
          </div>
          
          <div className="flex justify-end mt-4">
            <Button variant="default" size="sm">
              Continue
            </Button>
          </div>
        </div>
      </FloatingWindow>
      
      {/* Third Window (optional) */}
      {showWindow3 && (
        <FloatingWindow
          title="Additional Window"
          initialPosition={{ x: 300, y: 100, z: -5 }}
          width="350px"
          scale={0.85}
          onClose={() => setShowWindow3(false)}
          isOpen={true}
        >
          <div className="p-4">
            <VisionHeading3 variant="gradient">
              Dynamic Windows
            </VisionHeading3>
            
            <p className="text-white/70 mt-3">
              Windows can be dynamically added, removed, and positioned
              in the spatial environment.
            </p>
            
            <div className="mt-4 flex justify-end">
              <Button 
                variant="destructive" 
                size="sm"
                onClick={() => setShowWindow3(false)}
              >
                <X className="mr-2 h-4 w-4" />
                Close Window
              </Button>
            </div>
          </div>
        </FloatingWindow>
      )}
    </SpatialLayout>
  );
}