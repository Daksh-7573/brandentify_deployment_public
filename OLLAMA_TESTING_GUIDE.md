# Ollama Integration Testing Guide

## Level 1: Service Connectivity Tests ✅

### 1.1 Test Ollama is Running
```bash
# In a terminal, start Ollama
ollama serve

# Expected output:
# listening on 127.0.0.1:11434
```

### 1.2 Test Direct Ollama Connection
```bash
# In another terminal
curl http://localhost:11434/api/health

# Expected output:
# {"status":"success"}
```

### 1.3 Test Model is Pulled
```bash
ollama list

# Expected output:
# NAME            ID              SIZE    MODIFIED
# phi3:latest     2e0d431e7638    1.3GB   2 hours ago
```

If `phi3` is not listed, pull it:
```bash
ollama pull phi3
```

## Level 2: Application Health Check ✅

### 2.1 Start Application
```bash
npm run dev

# Expected: Server starts on port 5000
```

### 2.2 Test Ollama Health Endpoint
```bash
curl http://localhost:5000/api/health/ollama

# Expected response:
{
  "service": "ollama",
  "available": true,
  "model": "phi3",
  "url": "http://localhost:11434",
  "timestamp": "2025-03-01T..."
}
```

### 2.3 Debug: Check Logs
```
Browser Console: Look for any errors
App Terminal: Look for "Ollama available: true"
```

## Level 3: Direct Service Function Tests ✅

### 3.1 Test From Node Terminal
```bash
# In project directory
node -e "
const { analyzeResumeWithOllama } = require('./dist/services/ollama-service.js');

analyzeResumeWithOllama('John Doe, Software Engineer, 5 years experience in React and Node.js')
  .then(result => console.log(JSON.stringify(result, null, 2)))
  .catch(err => console.error('Error:', err.message));
"
```

Expected output: JSON with `summary`, `strengths`, `weaknesses`, `skills_detected`, etc.

### 3.2 Test TypeScript Direct
```bash
# Create test file: test-ollama.ts
```typescript
import { analyzeResumeWithOllama } from './server/services/ollama-service';

const testResume = `
John Doe
Senior Software Engineer
5 years experience with React, Node.js, TypeScript
AWS certified, 2 major projects
`;

analyzeResumeWithOllama(testResume)
  .then(result => console.log(JSON.stringify(result, null, 2)))
  .catch(err => console.error('Error:', err));
```

```bash
npx ts-node test-ollama.ts
```

## Level 4: Resume Upload Integration Test ✅

### 4.1 Create Test Resume File
Create `test-resume.txt`:
```
John Doe
john.doe@example.com | (555) 123-4567

PROFESSIONAL SUMMARY
Senior Software Engineer with 5+ years of experience building scalable web applications.

EXPERIENCE
Senior Engineer | TechCorp (2020-2025)
- Led development of microservices architecture using Node.js and TypeScript
- Achieved 40% performance improvement through optimization
- Managed team of 4 engineers

Engineer | StartupXYZ (2018-2020)
- Built React frontend and Express backend
- Implemented CI/CD pipeline with GitHub Actions
- Reduced deployment time by 60%

SKILLS
Languages: JavaScript, TypeScript, Python
Frontend: React, Vue, Next.js
Backend: Node.js, Express, GraphQL
Databases: PostgreSQL, MongoDB, Redis
Tools: Docker, Kubernetes, AWS, Git

EDUCATION
BS Computer Science | University (2018)
```

### 4.2 Upload via API (cURL)
```bash
curl -X POST http://localhost:5000/api/musk/resume-upload \
  -F "file=@test-resume.txt" \
  -F "userId=user-123"

# Expected response:
{
  "success": true,
  "score": 75,
  "analysis": {
    "summary": "Experienced software engineer with strong technical background...",
    "strengths": [
      "5+ years relevant experience",
      "Full-stack capabilities",
      "Leadership experience",
      ...
    ],
    "weaknesses": [
      "Limited specific industry certifications",
      ...
    ],
    "skills_detected": ["JavaScript", "TypeScript", "React", ...],
    "improvement_suggestions": [...]
  },
  "timestamp": "2025-03-01T..."
}
```

### 4.3 Upload via Frontend
1. Open Musk Chat in browser
2. Click "Upload Resume"
3. Select test-resume.txt
4. Wait for analysis (3-5 seconds)
5. Verify scores and feedback appear

## Level 5: Pitch Deck Upload Integration Test ✅

### 5.1 Create Test Pitch Deck (Text)
Create `test-pitch.txt`:
```
ACME AI Platform - Series A Pitch Deck

SLIDE 1: The Problem
- Companies waste 30% time on manual data processing
- Current solutions cost $50K+/year and lack customization
- Market size: $5B TAM

SLIDE 2: Our Solution
- AI-powered automation platform
- 80% cost reduction vs competitors
- Enterprise-grade security and compliance

SLIDE 3: Traction
- 50 customers in 6 months
- $2.3M ARR
- 150% net retention
- 3 Fortune 500 pilots

SLIDE 4: Team
- CEO: 15 years at Google/Meta
- CTO: Stanford PhD, published researcher
- 2 additional senior engineers

SLIDE 5: Market & Competition
- TAM: $5B (growing 40% YoY)
- Current competitors: Zapier ($5B), Automation Anywhere ($25B)
- Our advantage: AI-native, lower cost, better UX

SLIDE 6: Go-to-Market
- Sales team: 8 sales engineers
- Partnerships: AWS, Salesforce integration
- Product-led growth: 2K free tier users

SLIDE 7: Financials Projection
- 2023: $2.3M ARR
- 2024: $8M ARR (250% growth)
- 2025: $25M ARR (200% growth)
- EBITDA positive by end of 2024

SLIDE 8: Funding Ask
- Raise: $10M Series A
- Use of funds: 50% sales/marketing, 30% product, 20% operations
```

### 5.2 Upload via API (cURL)
```bash
curl -X POST http://localhost:5000/api/musk/pitchdeck-upload \
  -F "file=@test-pitch.txt" \
  -F "userId=user-123"

# Expected response:
{
  "success": true,
  "analysis": {
    "overall_score": 82,
    "strengths": [
      "Clear market opportunity with large TAM",
      "Strong traction metrics",
      "Experienced founding team",
      ...
    ],
    "weaknesses": [
      "Competitive landscape analysis could be deeper",
      ...
    ],
    "investor_readiness": "High",
    "recommendations": [
      "Add customer testimonials",
      "Include unit economics",
      ...
    ]
  },
  "timestamp": "2025-03-01T..."
}
```

## Level 6: Error & Edge Case Tests ✅

### 6.1 Test: Ollama Down
```bash
# Stop Ollama service (stop the "ollama serve" terminal)

# Call health endpoint
curl http://localhost:5000/api/health/ollama

# Expected: "available": false, error message shown
```

### 6.2 Test: Timeout
Create a very long resume (10,000+ words) and upload. Verify it either:
- Completes within 90 seconds, OR
- Returns timeout error gracefully

### 6.3 Test: Invalid File
Try uploading a binary file that's not UTF-8:
- Should return error: "Failed to extract text"

### 6.4 Test: Empty File
Upload empty document:
- Should handle gracefully, return empty analysis or error

### 6.5 Test: Model Switching
```bash
# Change .env
OLLAMA_MODEL="mistral"

# Restart app
npm run dev

# Upload resume again
# Verify it uses mistral model (slightly different analysis)
```

## Level 7: Performance Testing ✅

### 7.1 Measure Response Time
```bash
# Simple timing test
time curl -X POST http://localhost:5000/api/musk/resume-upload \
  -F "file=@test-resume.txt" \
  -F "userId=user-123"

# Expected: 3-5 seconds for phi3
```

### 7.2 Load Test (Multiple Concurrent Requests)
```bash
# In parallel, upload same resume 5 times
for i in {1..5}; do
  curl -X POST http://localhost:5000/api/musk/resume-upload \
    -F "file=@test-resume.txt" \
    -F "userId=user-$i" &
done
wait

# Verify all complete (may take longer due to sequential processing)
```

### 7.3 Monitor Ollama Performance
```bash
# In Ollama terminal, watch stats
ollama stats

# In test terminal while uploading
# Memory usage should not exceed model size + 2GB buffer
```

## Level 8: Regression Testing ✅

### 8.1 Verify Chat Still Works
- Chat upload functionality unchanged
- Regular chat responses still work
- Only resume/pitch deck uses Ollama

### 8.2 Verify File Upload Middleware
- Upload still uses express-fileupload
- tmpDir still created and cleaned up
- No file leaks or permission errors

### 8.3 Verify Database Updates
- Analysis results stored in database
- User history maintained
- Scores properly persisted

## Test Results Checklist

- [ ] Service connects to Ollama on localhost:11434
- [ ] Health endpoint returns `available: true`
- [ ] Resume analysis returns valid JSON with scores
- [ ] Pitch deck analysis returns valid JSON
- [ ] Upload via frontend works end-to-end
- [ ] Error handling works when Ollama is down
- [ ] Timeout handling works for slow requests
- [ ] Model switching works (via .env)
- [ ] Response time acceptable (3-5 seconds)
- [ ] Concurrent requests handled properly
- [ ] Chat functionality unaffected
- [ ] Database updates work correctly
- [ ] UI displays results properly

## Debugging Commands

```bash
# Check Ollama is running
curl http://localhost:11434/api/health

# Check app health
curl http://localhost:5000/api/health/ollama

# View app logs
npm run dev  # Watch console output

# View Ollama logs
ollama serve  # Watch console output

# Test resume analysis directly
node -e "require('./dist/services/ollama-service').analyzeResumeWithOllama('test text')"

# Check model is loaded
curl http://localhost:11434/api/tags
```

## Performance Expectations

| Scenario | Time | Status |
|----------|------|--------|
| Health check | <100ms | ✅ |
| 1-page resume (phi3) | 3-5s | ✅ |
| 3-page resume (phi3) | 8-12s | ✅ |
| Cold start (first request) | +2-3s | ⚠️ (expected) |
| Model switch (mistral) | +2-3s more | ⚠️ (larger model) |
| Timeout (120+ chars) | <90s | ✅ |

## What to Do If Tests Fail

| Failure | Debug Steps |
|---------|------------|
| "Cannot reach Ollama" | 1. Check `ollama serve` is running<br/>2. Check localhost:11434 is accessible<br/>3. Verify .env OLLAMA_URL<br/>4. Check firewall |
| "Model not found" | 1. Run `ollama pull phi3`<br/>2. Verify with `ollama list`<br/>3. Check .env OLLAMA_MODEL |
| "Request timeout" | 1. Increase OLLAMA_TIMEOUT<br/>2. Try phi3 (smaller model)<br/>3. Check system resources<br/>4. Check app logs for errors |
| "JSON parse error" | 1. This is auto-handled with fallback<br/>2. Check Ollama logs<br/>3. Try different model |
| "File extraction failed" | 1. Check file format (PDF/Word/TXT)<br/>2. Verify file is readable<br/>3. Check file size not too large |

## Final Verification

After all tests pass, run:

```bash
npm run build  # Verify TypeScript compiles
npm run dev    # Run in dev mode
npm test       # If you have tests
```

Then deploy with confidence! 🚀
