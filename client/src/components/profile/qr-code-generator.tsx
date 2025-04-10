import React, { useEffect, useState } from 'react';

interface QRCodeGeneratorProps {
  text: string;
  size?: number;
  primaryColor?: string;
  backgroundColor?: string;
}

/**
 * A simple QR code generator component that creates SVG-based QR codes
 */
const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({
  text,
  size = 200,
  primaryColor = '#000000',
  backgroundColor = '#ffffff'
}) => {
  const [svgPath, setSvgPath] = useState<string>('');
  
  useEffect(() => {
    // Generate a simple QR code pattern based on the text
    // This is a very simplified version - in production we'd use a real QR library
    const generateQRCode = () => {
      // Create a pseudo-random but deterministic pattern based on the input text
      const hash = Array.from(text).reduce((acc, char) => {
        return ((acc << 5) - acc) + char.charCodeAt(0);
      }, 0);
      
      // Generate a simple pattern for demonstration purposes
      let path = '';
      const cellSize = size / 25; // 25x25 grid
      const seedRandom = (seed: number) => () => {
        const x = Math.sin(seed++) * 10000;
        return x - Math.floor(x);
      };
      
      const random = seedRandom(hash);
      
      // Create fixed positioning markers (corners)
      // Top-left marker
      path += `M 0 0 h ${cellSize * 7} v ${cellSize * 7} h -${cellSize * 7} Z `;
      path += `M ${cellSize} ${cellSize} h ${cellSize * 5} v ${cellSize * 5} h -${cellSize * 5} Z `;
      path += `M ${cellSize * 2} ${cellSize * 2} h ${cellSize * 3} v ${cellSize * 3} h -${cellSize * 3} Z `;
      
      // Top-right marker
      path += `M ${size - cellSize * 7} 0 h ${cellSize * 7} v ${cellSize * 7} h -${cellSize * 7} Z `;
      path += `M ${size - cellSize * 6} ${cellSize} h ${cellSize * 5} v ${cellSize * 5} h -${cellSize * 5} Z `;
      path += `M ${size - cellSize * 5} ${cellSize * 2} h ${cellSize * 3} v ${cellSize * 3} h -${cellSize * 3} Z `;
      
      // Bottom-left marker
      path += `M 0 ${size - cellSize * 7} h ${cellSize * 7} v ${cellSize * 7} h -${cellSize * 7} Z `;
      path += `M ${cellSize} ${size - cellSize * 6} h ${cellSize * 5} v ${cellSize * 5} h -${cellSize * 5} Z `;
      path += `M ${cellSize * 2} ${size - cellSize * 5} h ${cellSize * 3} v ${cellSize * 3} h -${cellSize * 3} Z `;
      
      // Generate data cells (simplified, for demonstration only)
      for (let i = 0; i < 20; i++) {
        for (let j = 0; j < 20; j++) {
          // Skip areas with positioning markers
          if ((i < 7 && j < 7) || (i < 7 && j > 12) || (i > 12 && j < 7)) {
            continue;
          }
          
          // Create a deterministic pattern based on hash
          if (random() > 0.5) {
            const x = j * cellSize + cellSize / 2;
            const y = i * cellSize + cellSize / 2;
            path += `M ${x - cellSize / 3} ${y - cellSize / 3} h ${cellSize * 0.66} v ${cellSize * 0.66} h -${cellSize * 0.66} Z `;
          }
        }
      }
      
      setSvgPath(path);
    };
    
    generateQRCode();
  }, [text, size]);
  
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox={`0 0 ${size} ${size}`}
      style={{ background: backgroundColor }}
    >
      <path d={svgPath} fill={primaryColor} />
    </svg>
  );
};

export default QRCodeGenerator;