// Simple test script to check if packages are available
console.log("Testing package imports...");

try {
  const vite = await import("vite");
  console.log("✅ Vite imported successfully:", typeof vite.createServer);
} catch (error) {
  console.log("❌ Vite import failed:", error.message);
}

try {
  const express = await import("express");
  console.log("✅ Express imported successfully:", typeof express.default);
} catch (error) {
  console.log("❌ Express import failed:", error.message);
}

try {
  const react = await import("react");
  console.log("✅ React imported successfully:", typeof react.default);
} catch (error) {
  console.log("❌ React import failed:", error.message);
}

try {
  const { nanoid } = await import("nanoid");
  console.log("✅ Nanoid imported successfully:", typeof nanoid);
} catch (error) {
  console.log("❌ Nanoid import failed:", error.message);
}

// Check if packages exist in node_modules
import fs from 'fs';
import path from 'path';

const checkPackage = (packageName) => {
  const packagePath = path.join(process.cwd(), 'node_modules', packageName);
  const exists = fs.existsSync(packagePath);
  console.log(`${exists ? '✅' : '❌'} Package ${packageName} ${exists ? 'exists' : 'missing'} in node_modules`);
  return exists;
};

checkPackage('vite');
checkPackage('express');
checkPackage('react');
checkPackage('nanoid');
checkPackage('@vitejs/plugin-react');