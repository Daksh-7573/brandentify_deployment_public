#!/usr/bin/env node
/**
 * Resume Upload Debug Isolation Test
 * 
 * Run this to identify exactly which layer is failing:
 * 1. File extraction
 * 2. Ollama availability  
 * 3. AI provider call
 * 4. Response format
 * 
 * Usage: node debug-resume-upload.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('\n' + '='.repeat(70));
console.log('🔍 RESUME UPLOAD DEBUG ISOLATION TEST');
console.log('='.repeat(70) + '\n');

// 1. Check Ollama availability
console.log('1️⃣ CHECKING OLLAMA AVAILABILITY...\n');

(async () => {
  try {
    const response = await fetch('http://localhost:11434/api/tags', {
      method: 'GET',
      timeout: 5000
    });
    
    if (response.ok) {
      console.log('✅ OLLAMA REACHABLE at http://localhost:11434');
      const data = await response.json();
      console.log('   Available models:', data.models?.length || 0);
      if (data.models && data.models[0]) {
        console.log('   Primary model:', data.models[0].name);
      }
    } else {
      console.log('❌ OLLAMA NOT RESPONDING (HTTP', response.status + ')');
    }
  } catch (error) {
    console.log('❌ OLLAMA CONNECTION FAILED');
    console.log('   Error:', error.message);
    console.log('   ACTION: Start Ollama with: ollama serve');
  }

  // 2. Check file extraction capability
  console.log('\n2️⃣ CHECKING FILE EXTRACTION...\n');
  
  try {
    // Create test resume
    const testResume = `
John Doe
Senior Software Engineer
john@example.com | linkedin.com/in/johndoe

PROFESSIONAL SUMMARY
Experienced full-stack developer with 8 years building scalable web applications.

TECHNICAL SKILLS
- Languages: JavaScript, TypeScript, Python, Go
- Frameworks: React, Next.js, Node.js, FastAPI
- Databases: PostgreSQL, MongoDB, Redis
- Tools: Docker, Kubernetes, Git, AWS

WORK EXPERIENCE
Senior Software Engineer | Tech Corp (2022-2025)
- Led team of 5 engineers delivering microservices
- Reduced API latency by 40% through optimization

Software Engineer | StartupXYZ (2020-2022)
- Built customer-facing React dashboard
- Implemented real-time data sync with WebSockets

EDUCATION
BS Computer Science | State University (2020)
`;
    
    const testFile = path.join(__dirname, 'test-resume.txt');
    fs.writeFileSync(testFile, testResume);
    
    const stats = fs.statSync(testFile);
    const content = fs.readFileSync(testFile, 'utf-8');
    
    console.log('✅ TEST RESUME CREATED');
    console.log('   File size:', stats.size, 'bytes');
    console.log('   Content length:', content.length, 'chars');
    console.log('   Content preview:', content.substring(0, 50).replace(/\n/g, ' ') + '...');
    
    // Cleanup
    fs.unlinkSync(testFile);
    
  } catch (error) {
    console.log('❌ FILE EXTRACTION FAILED');
    console.log('   Error:', error.message);
  }

  // 3. Check API server availability
  console.log('\n3️⃣ CHECKING API SERVER...\n');
  
  try {
    const response = await fetch('http://localhost:3000/api/health', {
      timeout: 5000
    });
    
    if (response.ok) {
      console.log('✅ API SERVER REACHABLE at http://localhost:3000');
    } else {
      console.log('❌ API SERVER NOT RESPONDING (HTTP', response.status + ')');
      console.log('   ACTION: Start with: npm run dev');
    }
  } catch (error) {
    console.log('❌ API SERVER CONNECTION FAILED');
    console.log('   Error:', error.message);
    console.log('   ACTION: Start with: npm run dev');
  }

  // 4. Check expected response structure
  console.log('\n4️⃣ CHECKING RESPONSE FORMAT...\n');
  
  console.log('✅ EXPECTED RESPONSE KEYS:');
  console.log('   - id (string)');
  console.log('   - success (boolean)');
  console.log('   - message (string) ⬅️ Frontend uses this for display');
  console.log('   - analysis (string) ⬅️ Frontend uses this as fallback');
  console.log('   - score (object)');
  console.log('   - timestamp (Date)\n');
  
  console.log('⚠️  IF RESPONSE MISSING "message" KEY:');
  console.log('   Frontend will show nothing even if analysis succeeds\n');

  // 5. Summary
  console.log('='.repeat(70));
  console.log('📋 WHAT TO CHECK:\n');
  
  console.log('Step 1: File reaches backend?');
  console.log('  → Look for: "File received: true"\n');
  
  console.log('Step 2: Text extraction works?');
  console.log('  → Look for: "Extracted text length: [number > 0]"\n');
  
  console.log('Step 3: Ollama is called?');
  console.log('  → Look for: "✅ AI response received: true"\n');
  
  console.log('Step 4: Response shown in Musk Chat?');
  console.log('  → Check browser console for errors');
  console.log('  → Check if response contains "message" or "analysis" key\n');

  console.log('='.repeat(70));
  console.log('\n🚀 NEXT STEPS:\n');
  
  console.log('1. RUN: node debug-resume-upload.js');
  console.log('2. CHECK: npm run dev (server logs)');
  console.log('3. UPLOAD: A test resume from browser');
  console.log('4. WATCH: Console logs for each step\n');

})().catch(console.error);
