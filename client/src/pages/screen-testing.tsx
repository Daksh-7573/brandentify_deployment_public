import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import Header from '@/components/layout/header';
import { motion } from 'framer-motion';

export default function ScreenTestingPage() {
  const [activeCategory, setActiveCategory] = useState('components');
  
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="fixed top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-900 via-gray-950 to-black -z-10 opacity-70"></div>
      
      <Header className="bg-transparent backdrop-blur-md z-20" />
      
      <main className="container py-12 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold mb-2 text-white tracking-tight">Vision Pro Inspired UI</h1>
          <p className="text-gray-400 mb-8 text-lg">Spatial computing design system for web interfaces</p>
        </motion.div>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sidebar - Glass effect panel */}
          <motion.div 
            className="lg:col-span-3 lg:sticky lg:top-24 lg:self-start h-fit"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="bg-gray-900/40 backdrop-blur-lg border-gray-800 rounded-3xl shadow-xl overflow-hidden">
              <CardHeader className="border-b border-gray-800/50 pb-4">
                <CardTitle className="text-xl text-white">Test Categories</CardTitle>
                <CardDescription className="text-gray-400">
                  Select a design category
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <nav className="space-y-2">
                  {["components", "layouts", "animations", "glassmorphism", "depth"].map((category) => (
                    <Button 
                      key={category}
                      variant={activeCategory === category ? "default" : "ghost"} 
                      className={`w-full justify-start rounded-xl h-12 text-base ${
                        activeCategory === category
                          ? "bg-white/10 text-white backdrop-blur-sm"
                          : "text-gray-400 hover:text-white hover:bg-white/5"
                      }`}
                      onClick={() => setActiveCategory(category)}
                    >
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </Button>
                  ))}
                </nav>
                
                <Separator className="my-6 bg-gray-800/50" />
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="dark-mode" className="text-gray-400">Dark Mode</Label>
                    <Switch id="dark-mode" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="blur-effects" className="text-gray-400">Blur Effects</Label>
                    <Switch id="blur-effects" defaultChecked />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          {/* Main content - with glass effect */}
          <motion.div 
            className="lg:col-span-9"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card className="bg-gray-900/30 backdrop-blur-xl border-gray-800 rounded-3xl shadow-xl overflow-hidden">
              <CardHeader className="border-b border-gray-800/50">
                <CardTitle className="text-2xl text-white">Vision Pro Design System</CardTitle>
                <CardDescription className="text-gray-400">
                  Spatial computing aesthetics adapted for web interfaces
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <Tabs defaultValue="components" value={activeCategory} onValueChange={setActiveCategory} className="w-full">
                  <TabsList className="mb-6 p-1 bg-gray-800/50 backdrop-blur-md rounded-2xl h-14 grid-cols-5">
                    <TabsTrigger value="components" className="rounded-xl data-[state=active]:bg-gray-700/50 data-[state=active]:backdrop-blur-lg text-base h-12">Components</TabsTrigger>
                    <TabsTrigger value="layouts" className="rounded-xl data-[state=active]:bg-gray-700/50 data-[state=active]:backdrop-blur-lg text-base h-12">Layouts</TabsTrigger>
                    <TabsTrigger value="animations" className="rounded-xl data-[state=active]:bg-gray-700/50 data-[state=active]:backdrop-blur-lg text-base h-12">Animations</TabsTrigger>
                    <TabsTrigger value="glassmorphism" className="rounded-xl data-[state=active]:bg-gray-700/50 data-[state=active]:backdrop-blur-lg text-base h-12">Glass UI</TabsTrigger>
                    <TabsTrigger value="depth" className="rounded-xl data-[state=active]:bg-gray-700/50 data-[state=active]:backdrop-blur-lg text-base h-12">Depth</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="components" className="mt-2 space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {/* Component showcase - with glass effect */}
                      <div className="p-6 bg-gray-800/30 backdrop-blur-md rounded-2xl border border-gray-700/50 shadow-lg">
                        <h3 className="text-xl font-medium mb-4 text-white">Button Components</h3>
                        <div className="space-y-4">
                          <Button className="bg-blue-600 hover:bg-blue-700 rounded-xl h-12 px-6 w-full font-medium text-white shadow-lg shadow-blue-500/20 transition-all hover:shadow-blue-500/40">
                            Primary Action
                          </Button>
                          <Button variant="secondary" className="bg-gray-800/80 hover:bg-gray-700/80 text-white rounded-xl h-12 px-6 w-full backdrop-blur-sm">
                            Secondary Action
                          </Button>
                          <Button variant="outline" className="border-gray-700 text-gray-300 hover:bg-gray-800/50 rounded-xl h-12 px-6 w-full">
                            Outline Button
                          </Button>
                          <Button variant="ghost" className="text-gray-400 hover:text-white hover:bg-white/5 rounded-xl h-12 px-6 w-full">
                            Ghost Button
                          </Button>
                        </div>
                      </div>
                      
                      {/* Card showcase - with glass effect */}
                      <div className="p-6 bg-gray-800/30 backdrop-blur-md rounded-2xl border border-gray-700/50 shadow-lg">
                        <h3 className="text-xl font-medium mb-4 text-white">Card Components</h3>
                        <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700/50 rounded-2xl overflow-hidden">
                          <CardHeader className="border-b border-gray-700/30">
                            <CardTitle className="text-white">Vision Card</CardTitle>
                            <CardDescription className="text-gray-400">Card with glass effect</CardDescription>
                          </CardHeader>
                          <CardContent className="pt-4">
                            <p className="text-gray-300">This card demonstrates the glassmorphism effect with subtle backdrop blur.</p>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="layouts" className="mt-2 space-y-6">
                    <div className="space-y-6">
                      <h3 className="text-xl font-medium text-white mb-4">Spatial Grid Layout</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map((i) => (
                          <motion.div 
                            key={i}
                            className="h-24 bg-gray-800/40 backdrop-blur-sm rounded-2xl border border-gray-700/50 flex items-center justify-center text-white shadow-lg"
                            whileHover={{ 
                              scale: 1.03, 
                              backgroundColor: 'rgba(59, 130, 246, 0.2)',
                              transition: { duration: 0.2 } 
                            }}
                          >
                            Grid Item {i}
                          </motion.div>
                        ))}
                      </div>
                      
                      <h3 className="text-xl font-medium text-white mb-4">Spatial Flex Layout</h3>
                      <div className="flex flex-col md:flex-row gap-4">
                        {[1, 2, 3].map((i) => (
                          <motion.div 
                            key={i}
                            className="h-24 flex-1 bg-gray-800/40 backdrop-blur-sm rounded-2xl border border-gray-700/50 flex items-center justify-center text-white shadow-lg"
                            whileHover={{ 
                              scale: 1.02, 
                              backgroundColor: 'rgba(59, 130, 246, 0.2)',
                              transition: { duration: 0.2 }
                            }}
                          >
                            Flex Item {i}
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="animations" className="mt-2 space-y-6">
                    <div className="space-y-6">
                      <h3 className="text-xl font-medium text-white mb-4">Spatial Animations</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <div className="p-6 bg-gray-800/30 backdrop-blur-md rounded-2xl border border-gray-700/50 shadow-lg">
                          <h4 className="text-lg font-medium mb-4 text-white">Hover Effect</h4>
                          <motion.div 
                            className="h-24 bg-blue-500/20 rounded-2xl flex items-center justify-center text-white"
                            whileHover={{ 
                              scale: 1.05, 
                              backgroundColor: 'rgba(59, 130, 246, 0.3)',
                              boxShadow: '0 0 20px rgba(59, 130, 246, 0.3)'
                            }}
                          >
                            Hover Me
                          </motion.div>
                        </div>
                        
                        <div className="p-6 bg-gray-800/30 backdrop-blur-md rounded-2xl border border-gray-700/50 shadow-lg">
                          <h4 className="text-lg font-medium mb-4 text-white">Float Effect</h4>
                          <motion.div 
                            className="h-24 bg-purple-500/20 rounded-2xl flex items-center justify-center text-white"
                            animate={{ 
                              y: [0, -10, 0], 
                            }}
                            transition={{ 
                              repeat: Infinity, 
                              duration: 4,
                              ease: "easeInOut"
                            }}
                          >
                            Floating Element
                          </motion.div>
                        </div>
                        
                        <div className="p-6 bg-gray-800/30 backdrop-blur-md rounded-2xl border border-gray-700/50 shadow-lg">
                          <h4 className="text-lg font-medium mb-4 text-white">Pulse Effect</h4>
                          <motion.div 
                            className="h-24 bg-teal-500/20 rounded-2xl flex items-center justify-center text-white"
                            animate={{ 
                              boxShadow: [
                                '0 0 0 rgba(20, 184, 166, 0)',
                                '0 0 20px rgba(20, 184, 166, 0.5)',
                                '0 0 0 rgba(20, 184, 166, 0)'
                              ]
                            }}
                            transition={{ 
                              repeat: Infinity, 
                              duration: 2 
                            }}
                          >
                            Pulsing Element
                          </motion.div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="glassmorphism" className="mt-2 space-y-6">
                    <div className="relative h-96 p-6 rounded-2xl overflow-hidden">
                      {/* Background with gradient colors for showcasing glass effect */}
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 opacity-20"></div>
                      <div className="absolute top-1/4 left-1/4 w-32 h-32 rounded-full bg-blue-500/30 blur-3xl"></div>
                      <div className="absolute bottom-1/3 right-1/4 w-40 h-40 rounded-full bg-purple-500/30 blur-3xl"></div>
                      <div className="absolute top-1/2 right-1/3 w-24 h-24 rounded-full bg-teal-500/30 blur-3xl"></div>
                      
                      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-6 h-full">
                        {/* Glass card with depth effect */}
                        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-xl p-6 flex flex-col">
                          <h3 className="text-xl font-medium text-white mb-2">Glass Card</h3>
                          <p className="text-gray-300 mb-4">This card demonstrates the true glassmorphism effect with translucency and backdrop blur.</p>
                          <div className="mt-auto flex gap-2">
                            <Button className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white rounded-xl">Action</Button>
                            <Button variant="ghost" className="text-white/70 hover:text-white hover:bg-white/5 rounded-xl">Cancel</Button>
                          </div>
                        </div>
                        
                        {/* Another glass card with different opacity */}
                        <div className="bg-black/20 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-xl p-6 flex flex-col">
                          <h3 className="text-xl font-medium text-white mb-2">Frosted Glass</h3>
                          <p className="text-gray-300 mb-4">A darker variant of glassmorphism that uses a different level of opacity and blur.</p>
                          <div className="mt-auto">
                            <Button className="bg-blue-500/80 hover:bg-blue-600/80 backdrop-blur-sm text-white rounded-xl w-full">Primary Action</Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="depth" className="mt-2 space-y-6">
                    <div className="relative h-96 p-6 rounded-2xl overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"></div>
                      
                      <div className="relative z-10 flex flex-col h-full justify-center items-center">
                        <h3 className="text-xl font-medium text-white mb-6">Layered Depth Effect</h3>
                        
                        <div className="relative w-full max-w-lg">
                          {/* Bottom layer */}
                          <motion.div 
                            className="absolute inset-0 bg-blue-900/20 border border-blue-700/20 rounded-2xl"
                            initial={{ y: 40, opacity: 0.4 }}
                            animate={{ y: 40, opacity: 0.4 }}
                            transition={{ type: "spring", stiffness: 100 }}
                          />
                          
                          {/* Middle layer */}
                          <motion.div 
                            className="absolute inset-0 bg-blue-800/30 border border-blue-600/30 rounded-2xl"
                            initial={{ y: 20, opacity: 0.6 }}
                            animate={{ y: 20, opacity: 0.6 }}
                            transition={{ type: "spring", stiffness: 100 }}
                          />
                          
                          {/* Top layer - interactive */}
                          <motion.div 
                            className="relative bg-gray-800/80 backdrop-blur-lg border border-gray-700/50 rounded-2xl p-6 shadow-xl"
                            whileHover={{ y: -5, transition: { type: "spring", stiffness: 300 } }}
                          >
                            <h4 className="text-lg font-medium text-white mb-2">Spatial Card</h4>
                            <p className="text-gray-300 mb-4">This card demonstrates depth through layering and interactive motion.</p>
                            <div className="mt-4">
                              <Button className="bg-blue-600/80 hover:bg-blue-700/80 text-white rounded-xl w-full">
                                Interact With Me
                              </Button>
                            </div>
                          </motion.div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
            
            {/* Floating control panel */}
            <motion.div 
              className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-gray-900/70 backdrop-blur-lg border border-gray-800 rounded-full px-6 py-3 shadow-xl flex items-center gap-4 z-30"
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8, type: "spring" }}
            >
              <Button variant="ghost" className="text-gray-400 hover:text-white rounded-full p-2 h-auto">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
              </Button>
              <Separator orientation="vertical" className="h-8 bg-gray-700" />
              <Button variant="ghost" className="text-blue-400 hover:text-blue-300 rounded-full p-2 h-auto">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
              </Button>
              <Button variant="ghost" className="text-gray-400 hover:text-white rounded-full p-2 h-auto">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>
              </Button>
              <Separator orientation="vertical" className="h-8 bg-gray-700" />
              <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-4">
                Download UI Kit
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}