// This is a custom fix file to address the default features issue
// Key points to note:
// 1. Display service.features array data instead of hardcoded array
// 2. Show empty div if no features are available
// 3. Keep all styling consistent with original implementation

import React from 'react';
import { motion } from 'framer-motion';

export const renderServiceFeatures = (service: any, index: number) => {
  if (!service.features || !Array.isArray(service.features) || service.features.length === 0) {
    return <div className="mb-6"></div>;
  }
  
  return (
    <ul className="mb-6 pl-1">
      {service.features.map((feature: string, i: number) => (
        <motion.li 
          key={i}
          className="flex items-center gap-2 text-sm text-gray-700 mb-2"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 + (i * 0.1) }}
          style={{ fontFamily: 'Poppins, sans-serif' }}
        >
          <div className="text-xs w-5 h-5 rounded-full flex items-center justify-center"
               style={{
                 background: index % 3 === 0 ? '#fce7f3' : 
                             index % 3 === 1 ? '#ede9fe' : 
                             '#dbeafe',
                 color: index % 3 === 0 ? '#ec4899' : 
                        index % 3 === 1 ? '#8b5cf6' : 
                        '#3b82f6'
               }}>
            ✓
          </div>
          {feature}
        </motion.li>
      ))}
    </ul>
  );
};