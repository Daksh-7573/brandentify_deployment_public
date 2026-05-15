# Resume Upload Debug Test
# This script uploads a test resume and captures the exact failure point

Write-Host "════════════════════════════════════════════════════════════════"
Write-Host "RESUME UPLOAD DEBUG TEST"
Write-Host "════════════════════════════════════════════════════════════════"
Write-Host ""

# Create a test resume file
$resumeContent = @"
John Doe
Senior Software Engineer
john@example.com | LinkedIn: linkedin.com/in/johndoe

PROFESSIONAL SUMMARY
Experienced full-stack engineer with 8+ years building enterprise applications.
Expert in React, Node.js, TypeScript, and cloud infrastructure.

TECHNICAL SKILLS
Languages: JavaScript, TypeScript, Python, SQL
Frameworks: React, Node.js, Express, Next.js
Databases: PostgreSQL, MongoDB, Redis
Cloud: AWS, Google Cloud, Azure
DevOps: Docker, Kubernetes, CI/CD

PROFESSIONAL EXPERIENCE

Senior Software Engineer | TechCorp Inc. (2022 - Present)
- Led team of 5 engineers building customer analytics dashboard
- Designed microservices architecture reducing latency by 40%
- Mentored junior developers and code review lead

Full Stack Engineer | StartupXYZ (2019 - 2022)
- Built scalable web platform serving 100K+ users
- Implemented real-time notifications system using WebSockets
- Reduced API response time from 500ms to 50ms

Software Engineer | WebDev LLC (2016 - 2019)
- Developed responsive web applications for enterprise clients
- Established CI/CD pipeline reducing deployment time by 60%

EDUCATION
Bachelor of Science in Computer Science
University of Technology (2016)
GPA: 3.8/4.0

CERTIFICATIONS
- AWS Solutions Architect (2023)
- Kubernetes Certified Application Developer (2022)

PROJECTS
- Real-time Chat Application (React, Node.js, WebSockets)
- Machine Learning Pipeline (Python, TensorFlow)
- High-Performance Database Indexing System
"@

$resumePath = "$env:TEMP\test-resume.txt"
$resumeContent | Out-File -FilePath $resumePath -Encoding UTF8

Write-Host "✅ Test resume created: $resumePath"
Write-Host "📄 File size: $((Get-Item $resumePath).Length) bytes"
Write-Host ""

# Test with curl
Write-Host "════════════════════════════════════════════════════════════════"
Write-Host "TEST 1: UPLOADING RESUME WITH CURL"
Write-Host "════════════════════════════════════════════════════════════════"
Write-Host ""
Write-Host "Upload endpoint: POST http://localhost:3000/api/musk/resume-upload"
Write-Host "Request payload:"
Write-Host "  - file: test-resume.txt"
Write-Host "  - userId: 1"
Write-Host ""
Write-Host "Sending request..."
Write-Host ""

# Upload resume
$response = curl -X POST `
  -F "file=@$resumePath" `
  -F "userId=1" `
  http://localhost:3000/api/musk/resume-upload `
  -s -w "`n[HTTP Status: %{http_code}]"

Write-Host $response
Write-Host ""

Write-Host "════════════════════════════════════════════════════════════════"
Write-Host "NEXT STEPS"
Write-Host "════════════════════════════════════════════════════════════════"
Write-Host ""
Write-Host "1️⃣  Check backend logs for:"
Write-Host "   - STAGE 1: File received? (should be 'true')"
Write-Host "   - STAGE 2: Extracting resume text"
Write-Host "   - STAGE 3: Extraction complete (check length)"
Write-Host "   - STAGE 4: Checking AI provider health"
Write-Host "   - STAGE 5: Calling AI provider"
Write-Host "   - STAGE 6: AI response received"
Write-Host ""
Write-Host "2️⃣  Or..."
Write-Host "   Check for AI STAGE A/B/C/D/E logs in LocalAIService:"
Write-Host "   - AI STAGE A: Checking Ollama health"
Write-Host "   - AI STAGE B: Sending to Ollama"
Write-Host "   - AI STAGE B FAILED: (if Ollama timeout)"
Write-Host "   - AI STAGE E: Falling back to deterministic"
Write-Host ""
Write-Host "3️⃣  Watch for the exact failure message"
Write-Host ""

Write-Host "🔍 Cleanup"
Remove-Item $resumePath -Force
Write-Host "✅ Test file cleaned up"
