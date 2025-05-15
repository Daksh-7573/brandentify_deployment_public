import React from 'react';
import { NeoGlassLayout, NeoGlassSection } from '@/components/layout/neo-glass-layout';

const NeoGlassSimple: React.FC = () => {
  return (
    <NeoGlassLayout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-white">Neo-Glass UI Theme</h1>
          
        <NeoGlassSection className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Glass Panel Example</h2>
          <p className="mb-4">This demonstrates our frosted glass effect with 60% opacity panels (40% transparent).</p>
          <button className="neo-glass-button">Primary Button</button>
        </NeoGlassSection>
          
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <NeoGlassSection>
            <h3 className="text-xl font-medium mb-2">Card Example 1</h3>
            <p>Cards have a lighter opacity than panels with the same frost effect.</p>
          </NeoGlassSection>
          <NeoGlassSection>
            <h3 className="text-xl font-medium mb-2">Card Example 2</h3>
            <p>Perfect for content organization and separation.</p>
          </NeoGlassSection>
        </div>
          
        <NeoGlassSection>
          <h2 className="text-2xl font-semibold mb-4">Form Elements</h2>
          
          <div className="mb-4">
            <label className="block text-white mb-2">Input Field</label>
            <input 
              type="text" 
              className="neo-glass-input" 
              placeholder="Enter text here..." 
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-white mb-2">Textarea</label>
            <textarea 
              className="neo-glass-input" 
              placeholder="Enter longer text here..." 
              rows={4}
            ></textarea>
          </div>
          
          <div className="mb-4">
            <label className="block text-white mb-2">Select</label>
            <select className="neo-glass-input">
              <option value="option1">Option 1</option>
              <option value="option2">Option 2</option>
              <option value="option3">Option 3</option>
            </select>
          </div>
          
          <div className="flex justify-end gap-4 mt-6">
            <button className="neo-glass-button secondary">Cancel</button>
            <button className="neo-glass-button">Submit</button>
          </div>
        </NeoGlassSection>
      </div>
    </NeoGlassLayout>
  );
};

export default NeoGlassSimple;