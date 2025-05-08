import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import Header from '@/components/layout/header';

export default function ScreenTestingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-8">
        <h1 className="text-3xl font-bold mb-6">Screen Testing Page</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Sidebar */}
          <div className="md:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle>Test Categories</CardTitle>
                <CardDescription>Select a category to test</CardDescription>
              </CardHeader>
              <CardContent>
                <nav className="space-y-2">
                  <Button variant="ghost" className="w-full justify-start">
                    UI Components
                  </Button>
                  <Button variant="ghost" className="w-full justify-start">
                    Responsive Layouts
                  </Button>
                  <Button variant="ghost" className="w-full justify-start">
                    Animations
                  </Button>
                  <Button variant="ghost" className="w-full justify-start">
                    Performance
                  </Button>
                </nav>
              </CardContent>
            </Card>
          </div>
          
          {/* Main content */}
          <div className="md:col-span-9">
            <Card>
              <CardHeader>
                <CardTitle>Screen Testing Dashboard</CardTitle>
                <CardDescription>
                  Test and visualize various UI components and layouts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="components">
                  <TabsList className="mb-4">
                    <TabsTrigger value="components">UI Components</TabsTrigger>
                    <TabsTrigger value="layouts">Layouts</TabsTrigger>
                    <TabsTrigger value="animation">Animation</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="components">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Component tests would go here */}
                      <div className="p-4 border rounded-md">
                        <h3 className="text-lg font-medium mb-2">Button Component</h3>
                        <div className="space-y-2">
                          <Button variant="default">Default Button</Button>
                          <Button variant="secondary">Secondary Button</Button>
                          <Button variant="destructive">Destructive Button</Button>
                          <Button variant="outline">Outline Button</Button>
                        </div>
                      </div>
                      
                      <div className="p-4 border rounded-md">
                        <h3 className="text-lg font-medium mb-2">Card Component</h3>
                        <Card>
                          <CardHeader>
                            <CardTitle>Card Title</CardTitle>
                            <CardDescription>Card Description</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <p>Card Content Example</p>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="layouts">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium mb-2">Grid Layout Test</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map((i) => (
                          <div key={i} className="h-20 bg-muted rounded-md flex items-center justify-center">
                            Grid Item {i}
                          </div>
                        ))}
                      </div>
                      
                      <h3 className="text-lg font-medium mb-2">Flex Layout Test</h3>
                      <div className="flex flex-col md:flex-row gap-4">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="h-20 flex-1 bg-muted rounded-md flex items-center justify-center">
                            Flex Item {i}
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="animation">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium mb-2">Animation Tests</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="p-4 border rounded-md">
                          <h4 className="text-md font-medium mb-2">Fade In</h4>
                          <div className="h-20 bg-primary/20 rounded-md animate-in fade-in duration-500"></div>
                        </div>
                        <div className="p-4 border rounded-md">
                          <h4 className="text-md font-medium mb-2">Slide In</h4>
                          <div className="h-20 bg-primary/20 rounded-md animate-in slide-in-from-bottom duration-500"></div>
                        </div>
                        <div className="p-4 border rounded-md">
                          <h4 className="text-md font-medium mb-2">Scale In</h4>
                          <div className="h-20 bg-primary/20 rounded-md animate-in zoom-in duration-500"></div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}