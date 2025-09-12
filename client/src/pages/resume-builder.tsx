import React from 'react';
import Header from '@/components/layout/header';
import backgroundImage from "@assets/Brandentifier Landing_1751376023002.png";

export default function ResumeBuilder() {
  return (
    <div 
      className="flex h-screen flex-col responsive-background"
      style={{ 
        backgroundImage: `url(${backgroundImage})`
      }}
    >
      <Header />
      <div className="flex flex-1 overflow-hidden pt-16 relative z-10">
        <div className="flex-1 overflow-auto w-full">
          <div className="max-w-5xl w-full mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-2 sm:py-4 md:py-6 lg:py-8">
            {/* Empty page - all details removed */}
          </div>
        </div>
      </div>
    </div>
  );
}