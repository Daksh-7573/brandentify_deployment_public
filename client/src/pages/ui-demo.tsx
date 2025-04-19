import React from "react";
import { UIShowcase } from "@/components/demo/ui-showcase";

const UIDemo: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-10">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto mb-10 text-center">
          <h1 className="text-4xl font-bold mb-4 gradient-text">Modern UI Components</h1>
          <p className="text-xl text-gray-600">
            Explore our collection of animated, interactive UI components with modern design principles.
          </p>
        </div>
        
        <UIShowcase />
      </div>
    </div>
  );
};

export default UIDemo;