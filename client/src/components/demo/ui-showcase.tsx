import React, { useState } from "react";
import { AnimatedButton } from "@/components/ui/animated-button";
import { QuantumCard } from "@/components/ui/quantum-card";
import { motion } from "framer-motion";
import { 
  ChevronRight, 
  Zap, 
  Sparkles,
  Star,
  MessageSquare,
  ArrowRight,
  Globe
} from "lucide-react";

export const UIShowcase: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'buttons' | 'cards'>('cards');

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-center mb-8 gap-4">
        <AnimatedButton 
          variant={activeTab === 'buttons' ? 'default' : 'outline'} 
          animation="pulse"
          onClick={() => setActiveTab('buttons')}
        >
          Animated Buttons
        </AnimatedButton>
        <AnimatedButton 
          variant={activeTab === 'cards' ? 'default' : 'outline'} 
          animation="pulse"
          onClick={() => setActiveTab('cards')}
        >
          3D Quantum Cards
        </AnimatedButton>
      </div>

      {activeTab === 'buttons' && (
        <section>
          <h2 className="text-2xl font-bold mb-6 gradient-text">Animated Button Showcase</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-6 bg-white rounded-xl shadow-md">
              <h3 className="font-semibold mb-4">Pulse Animation</h3>
              <AnimatedButton animation="pulse" className="w-full">
                Pulse Effect <ChevronRight className="ml-2 h-4 w-4" />
              </AnimatedButton>
            </div>
            
            <div className="p-6 bg-white rounded-xl shadow-md">
              <h3 className="font-semibold mb-4">Scale Animation</h3>
              <AnimatedButton animation="scale" className="w-full">
                Scale Effect <ChevronRight className="ml-2 h-4 w-4" />
              </AnimatedButton>
            </div>
            
            <div className="p-6 bg-white rounded-xl shadow-md">
              <h3 className="font-semibold mb-4">Slide Animation</h3>
              <AnimatedButton animation="slide" className="w-full">
                Slide Effect <ChevronRight className="ml-2 h-4 w-4" />
              </AnimatedButton>
            </div>

            <div className="p-6 bg-white rounded-xl shadow-md">
              <h3 className="font-semibold mb-4">Glow Animation</h3>
              <AnimatedButton animation="glow" className="w-full">
                Glow Effect <Sparkles className="ml-2 h-4 w-4" />
              </AnimatedButton>
            </div>
            
            <div className="p-6 bg-white rounded-xl shadow-md">
              <h3 className="font-semibold mb-4">Gradient Animation</h3>
              <AnimatedButton 
                animation="gradient" 
                className="w-full text-white"
                gradientColors={["#6366F1", "#14B8A6", "#6366F1"]}
              >
                Gradient Effect <Zap className="ml-2 h-4 w-4" />
              </AnimatedButton>
            </div>
            
            <div className="p-6 bg-white rounded-xl shadow-md">
              <h3 className="font-semibold mb-4">Ripple Animation</h3>
              <AnimatedButton animation="ripple" className="w-full">
                Ripple Effect <Star className="ml-2 h-4 w-4" />
              </AnimatedButton>
            </div>

            <div className="p-6 bg-white rounded-xl shadow-md">
              <h3 className="font-semibold mb-4">Float Animation</h3>
              <AnimatedButton animation="float" className="w-full">
                Float Effect <Globe className="ml-2 h-4 w-4" />
              </AnimatedButton>
            </div>
            
            <div className="p-6 bg-white rounded-xl shadow-md">
              <h3 className="font-semibold mb-4">3D Animation</h3>
              <AnimatedButton animation="3d" className="w-full">
                3D Effect <MessageSquare className="ml-2 h-4 w-4" />
              </AnimatedButton>
            </div>
            
            <div className="p-6 bg-white rounded-xl shadow-md">
              <h3 className="font-semibold mb-4">With Icon</h3>
              <AnimatedButton 
                animation="gradient" 
                className="w-full text-white"
                withIcon={<ArrowRight className="h-4 w-4" />}
                iconPosition="right"
              >
                Icon Button
              </AnimatedButton>
            </div>
          </div>
        </section>
      )}

      {activeTab === 'cards' && (
        <section>
          <h2 className="text-2xl font-bold mb-6 gradient-text">Quantum Card Showcase</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold mb-4">Holographic Style</h3>
              <QuantumCard 
                visualStyle="holographic"
                depth={40}
                badge={<span className="bg-purple-600 text-white text-xs font-medium px-2.5 py-0.5 rounded-full">New</span>}
              >
                <div className="p-4">
                  <h4 className="text-lg font-semibold mb-2">Holographic Card</h4>
                  <p className="text-gray-700">This card features a holographic effect with rainbow edges and dynamic sheen.</p>
                </div>
              </QuantumCard>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Neoglow Style</h3>
              <QuantumCard 
                visualStyle="neoglow"
                depth={40}
              >
                <div className="p-4 text-white">
                  <h4 className="text-lg font-semibold mb-2">Neoglow Card</h4>
                  <p className="text-gray-100">Features a dark background with neon glow effects for a futuristic feel.</p>
                </div>
              </QuantumCard>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Clay Style</h3>
              <QuantumCard 
                visualStyle="clay"
                depth={20}
                floating={true}
                layeredContent={true}
              >
                <div className="p-4">
                  <h4 className="text-lg font-semibold mb-2">Clay Card</h4>
                  <p className="text-gray-700 mb-3">Soft, clay-like appearance with subtle shadows and depth.</p>
                  <div className="mt-2 flex justify-end">
                    <AnimatedButton animation="scale" size="sm">
                      Learn More
                    </AnimatedButton>
                  </div>
                </div>
              </QuantumCard>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Professional Style</h3>
              <QuantumCard 
                visualStyle="professional"
                depth={15}
                rotationIntensity={0.3}
                badge={<span className="bg-blue-600 text-white text-xs font-medium px-2.5 py-0.5 rounded-full">Featured</span>}
                footer={
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">Last updated: Apr 19</span>
                    <AnimatedButton size="sm" variant="outline" animation="scale">View</AnimatedButton>
                  </div>
                }
              >
                <div className="p-4">
                  <h4 className="text-lg font-semibold mb-2">Professional Card</h4>
                  <p className="text-gray-700">Clean, minimal design focused on content with subtle interaction effects.</p>
                </div>
              </QuantumCard>
            </div>

            <div className="md:col-span-2">
              <h3 className="font-semibold mb-4">Glassmorphic Style with Layered Content</h3>
              <QuantumCard 
                visualStyle="glassmorphic"
                depth={50}
                layeredContent={true}
                hoverScale={1.03}
                className="h-64"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-teal-500/10 rounded-xl"></div>
                <div className="p-6 flex flex-col h-full justify-between relative">
                  <div>
                    <h4 className="text-xl font-bold mb-1">Layered Content Demo</h4>
                    <p className="text-gray-700 mb-4">This card demonstrates content at different z-index layers to create depth.</p>
                  </div>
                  
                  <motion.div 
                    className="absolute bottom-20 right-20"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  >
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500/20 to-teal-500/20 flex items-center justify-center">
                      <Sparkles className="text-purple-600" />
                    </div>
                  </motion.div>
                  
                  <div className="flex justify-end">
                    <AnimatedButton animation="gradient" size="sm">
                      Explore <ArrowRight className="ml-1 h-4 w-4" />
                    </AnimatedButton>
                  </div>
                </div>
              </QuantumCard>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};