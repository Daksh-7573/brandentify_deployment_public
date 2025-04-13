import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AnimatedContainer, AnimatedItem } from '@/components/ui/animated-container';
import { HoverCard } from '@/components/ui/hover-card';
import { MorphContainer } from '@/components/ui/morph-container';
import { GlowBorder } from '@/components/ui/glow-border';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAnimatedText } from '@/hooks/use-animated-text';
import { VARIANTS, AnimationVariant } from '@/lib/animation-utils';
import '@/components/ui/animations.css';

export function AnimationShowcase() {
  const [currentTab, setCurrentTab] = useState('enter-exit');
  const [animationVariant, setAnimationVariant] = useState<AnimationVariant>('normal');
  const [hoverEffect, setHoverEffect] = useState<'scale' | 'lift' | 'glow' | 'border' | 'tilt'>('scale');
  
  // Text animations
  const typewriterText = useAnimatedText({
    text: "This is a typewriter effect",
    type: 'typewriter',
    speed: 50
  });
  
  const scrambleText = useAnimatedText({
    text: "Text scramble effect",
    type: 'scramble',
    speed: 50
  });

  // Split text into individual spans for character animations
  const createSpans = (text: string) => {
    return text.split('').map((char, i) => (
      <span key={i} style={{ '--i': i + 11 } as React.CSSProperties}>{char}</span>
    ));
  };
  
  // Morphing states
  const [isMorphed, setIsMorphed] = useState(false);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <AnimatedContainer animation="slideDown" className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Animation Showcase</h1>
        <p className="text-gray-600 mb-6">
          A demonstration of different animation styles that can be applied across the Brandentifier platform.
        </p>
      </AnimatedContainer>

      <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-4">
        <TabsList className="grid grid-cols-5 gap-2">
          <TabsTrigger value="enter-exit">Entrance Animations</TabsTrigger>
          <TabsTrigger value="hover">Hover Animations</TabsTrigger>
          <TabsTrigger value="text">Text Animations</TabsTrigger>
          <TabsTrigger value="morph">Morphing</TabsTrigger>
          <TabsTrigger value="glow">Glowing Effects</TabsTrigger>
        </TabsList>

        {/* ENTRANCE ANIMATIONS */}
        <TabsContent value="enter-exit">
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Entrance Animations</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="space-y-2">
                <Label htmlFor="animation-variant">Animation Intensity</Label>
                <Select 
                  value={animationVariant}
                  onValueChange={(value) => setAnimationVariant(value as AnimationVariant)}
                >
                  <SelectTrigger id="animation-variant">
                    <SelectValue placeholder="Select variant" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="subtle">Subtle</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="expressive">Expressive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <AnimatedContainer animation="fade" staggerChildren className="space-y-4">
                <h3 className="font-semibold">Fade In</h3>
                {[1, 2, 3].map((item) => (
                  <AnimatedItem key={item} animation="fade" className="bg-white shadow rounded p-4">
                    Item {item}
                  </AnimatedItem>
                ))}
              </AnimatedContainer>
              
              <AnimatedContainer animation="slideUp" staggerChildren className="space-y-4">
                <h3 className="font-semibold">Slide Up</h3>
                {[1, 2, 3].map((item) => (
                  <AnimatedItem key={item} animation="slideUp" className="bg-white shadow rounded p-4">
                    Item {item}
                  </AnimatedItem>
                ))}
              </AnimatedContainer>
              
              <AnimatedContainer animation="scale" staggerChildren className="space-y-4">
                <h3 className="font-semibold">Scale In</h3>
                {[1, 2, 3].map((item) => (
                  <AnimatedItem key={item} animation="scale" className="bg-white shadow rounded p-4">
                    Item {item}
                  </AnimatedItem>
                ))}
              </AnimatedContainer>
            </div>
          </Card>
        </TabsContent>

        {/* HOVER ANIMATIONS */}
        <TabsContent value="hover">
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Hover Animations</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="space-y-2">
                <Label htmlFor="hover-effect">Hover Effect</Label>
                <Select 
                  value={hoverEffect}
                  onValueChange={(value) => setHoverEffect(value as any)}
                >
                  <SelectTrigger id="hover-effect">
                    <SelectValue placeholder="Select effect" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="scale">Scale</SelectItem>
                    <SelectItem value="lift">Lift</SelectItem>
                    <SelectItem value="glow">Glow</SelectItem>
                    <SelectItem value="border">Border</SelectItem>
                    <SelectItem value="tilt">3D Tilt</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="hover-intensity">Animation Intensity</Label>
                <Select 
                  value={animationVariant}
                  onValueChange={(value) => setAnimationVariant(value as AnimationVariant)}
                >
                  <SelectTrigger id="hover-intensity">
                    <SelectValue placeholder="Select intensity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="subtle">Subtle</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="expressive">Expressive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h3 className="font-semibold mb-2">Card Hover</h3>
                <HoverCard 
                  className="bg-white shadow p-4 h-32 flex items-center justify-center"
                  variant={animationVariant}
                  effect={hoverEffect}
                >
                  <p className="text-center">Hover over me!</p>
                </HoverCard>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Button Hover</h3>
                <motion.div
                  className="flex justify-center"
                  whileHover={VARIANTS.buttonHover.hover}
                  whileTap={VARIANTS.buttonHover.tap}
                >
                  <Button>Animated Button</Button>
                </motion.div>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">OS Animation Style</h3>
                <div className="bg-white shadow p-4 h-32 flex flex-col items-center justify-center rounded-lg hover:shadow-lg transition-all duration-300 hover:bg-gray-50 cursor-pointer">
                  <div className="w-12 h-12 rounded-full bg-blue-100 mb-2 flex items-center justify-center transition-transform hover:scale-110">
                    <span className="text-blue-500 text-lg">i</span>
                  </div>
                  <p className="text-center">OS-style Icon</p>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* TEXT ANIMATIONS */}
        <TabsContent value="text">
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Text Animations</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Typewriter Effect</h3>
                  <div className="p-4 bg-white shadow rounded">
                    <p className={typewriterText.className}>{typewriterText.text}</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Scramble Effect</h3>
                  <div className="p-4 bg-white shadow rounded">
                    <p>{scrambleText.text}</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Fade Characters</h3>
                  <div className="p-4 bg-white shadow rounded">
                    <p className="animated-text fade-characters">
                      {createSpans("Characters fade in one by one")}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Slide Up Characters</h3>
                  <div className="p-4 bg-white shadow rounded">
                    <p className="animated-text slide-up">
                      {createSpans("Each letter slides up")}
                    </p>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Bounce Characters</h3>
                  <div className="p-4 bg-white shadow rounded">
                    <p className="animated-text bounce">
                      {createSpans("Bouncy text animation")}
                    </p>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Rainbow Color</h3>
                  <div className="p-4 bg-white shadow rounded">
                    <p className="animated-text rainbow">
                      {createSpans("Rainbow colored text")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* MORPHING ANIMATIONS */}
        <TabsContent value="morph">
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Morphing Animations</h2>
            
            <div className="flex justify-center mb-4">
              <Button onClick={() => setIsMorphed(!isMorphed)}>
                {isMorphed ? "Reset Shape" : "Morph Shape"}
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2">Shape Morphing</h3>
                <div className="flex justify-center">
                  <MorphContainer
                    from={{ borderRadius: "8px", width: "150px", height: "150px" }}
                    to={isMorphed ? { borderRadius: "75px", width: "150px", height: "150px" } : { borderRadius: "8px", width: "150px", height: "150px" }}
                    className="bg-blue-500 flex items-center justify-center text-white font-bold"
                  >
                    {isMorphed ? "Circle" : "Square"}
                  </MorphContainer>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Card Morphing</h3>
                <MorphContainer
                  from={{ height: "100px" }}
                  to={isMorphed ? { height: "200px" } : { height: "100px" }}
                  className="bg-white shadow p-4 rounded"
                >
                  <h4 className="font-bold mb-2">Expandable Card</h4>
                  <p>This card changes its height when morphed.</p>
                  {isMorphed && (
                    <p className="mt-4">Additional content is revealed when the card is expanded!</p>
                  )}
                </MorphContainer>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* GLOWING EFFECTS */}
        <TabsContent value="glow">
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Glowing Effects</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h3 className="font-semibold mb-2">Pulsing Border</h3>
                <GlowBorder pulseAnimation className="p-6 bg-white rounded-lg">
                  <p className="text-center">Pulsing glow border effect</p>
                </GlowBorder>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Static Glow</h3>
                <GlowBorder glowColor="rgba(59, 130, 246, 0.8)" className="p-6 bg-white rounded-lg">
                  <p className="text-center">Static blue glow effect</p>
                </GlowBorder>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Gradient Glow</h3>
                <div className="rounded-lg p-[2px] bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500">
                  <div className="bg-white p-6 rounded-lg h-full">
                    <p className="text-center">Gradient border</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}