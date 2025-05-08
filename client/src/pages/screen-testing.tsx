import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';

export default function ScreenTestingPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Screen Testing Page</h1>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Spatial UI Implementation</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            This page is a testing ground for the new spatial UI components that follow
            Vision Pro design guidelines.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <Card className="glass-panel">
              <CardHeader>
                <CardTitle>Glassmorphism Card</CardTitle>
              </CardHeader>
              <CardContent>
                <p>
                  This card demonstrates the glassy, translucent effect that's a key part
                  of the spatial UI design language.
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-background/80 backdrop-blur-md border border-white/10 shadow-lg">
              <CardHeader>
                <CardTitle>Depth-Based Card</CardTitle>
              </CardHeader>
              <CardContent>
                <p>
                  This card shows how we can use opacity and blur to create a sense of depth
                  in the UI.
                </p>
              </CardContent>
            </Card>
          </div>
          
          <div className="flex flex-wrap gap-4">
            <Button className="spatial-button">Large Touch Target</Button>
            <Button variant="outline" className="spatial-button">Secondary Action</Button>
            <Button variant="destructive" className="spatial-button">Attention Action</Button>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Spatial Demo</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            Check out our full spatial UI demo that showcases the complete implementation
            of Vision Pro design guidelines.
          </p>
          
          <Link href="/spatial-demo">
            <Button className="spatial-button">
              View Spatial Demo
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}