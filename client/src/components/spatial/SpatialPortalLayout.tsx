import React, { ReactNode } from 'react';
import SpatialLayout, { FloatingWindow } from './SpatialLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SpatialWindowProps {
  children: ReactNode;
  title?: string;
  position?: 'center' | 'left' | 'right' | 'top' | 'bottom';
  width?: string;
  className?: string;
}

// A special window component for the spatial layout
export function SpatialWindow({ 
  children, 
  title, 
  position = 'center',
  width = 'auto',
  className = ''
}: SpatialWindowProps) {
  return (
    <FloatingWindow
      position={position}
      width={width}
      className={className}
      glassEffect={true}
    >
      <Card className="border-0 shadow-none bg-transparent">
        {title && (
          <CardHeader className="pb-2">
            <CardTitle>{title}</CardTitle>
          </CardHeader>
        )}
        <CardContent>
          {children}
        </CardContent>
      </Card>
    </FloatingWindow>
  );
}

interface SpatialPortalLayoutProps {
  mainContent: ReactNode;
  leftSidebar?: ReactNode;
  rightSidebar?: ReactNode;
  topBar?: ReactNode;
  bottomBar?: ReactNode;
}

// A complete spatial portal layout with main content and optional sidebars
export default function SpatialPortalLayout({
  mainContent,
  leftSidebar,
  rightSidebar,
  topBar,
  bottomBar
}: SpatialPortalLayoutProps) {
  return (
    <SpatialLayout className="min-h-screen bg-gradient-to-b from-background to-background/95">
      {/* Main centered content */}
      <SpatialWindow 
        position="center"
        width="60%"
        className="bg-background/90 min-h-[60vh]"
      >
        {mainContent}
      </SpatialWindow>

      {/* Left sidebar */}
      {leftSidebar && (
        <SpatialWindow
          position="left"
          width="25%"
          className="bg-background/80 max-h-[70vh] overflow-y-auto"
          title="Navigation"
        >
          {leftSidebar}
        </SpatialWindow>
      )}

      {/* Right sidebar */}
      {rightSidebar && (
        <SpatialWindow
          position="right"
          width="25%"
          className="bg-background/80 max-h-[70vh] overflow-y-auto"
        >
          {rightSidebar}
        </SpatialWindow>
      )}

      {/* Top bar */}
      {topBar && (
        <SpatialWindow
          position="top"
          width="50%"
          className="bg-background/80 max-h-[20vh]"
        >
          {topBar}
        </SpatialWindow>
      )}

      {/* Bottom bar */}
      {bottomBar && (
        <SpatialWindow
          position="bottom"
          width="50%"
          className="bg-background/80 max-h-[20vh]"
        >
          {bottomBar}
        </SpatialWindow>
      )}
    </SpatialLayout>
  );
}