# Resume Upload Pipeline - Structured Debug Logging

**Status: LOGGING INSTRUMENTATION COMPLETE ✅**

---

## What Was Added

### 1. **Resume Handler (routes-musk.ts) - STAGE-BASED LOGS**

Pipeline now logs at these exact points:

```
STAGE 1: File received?
  ✓ Log: "File name:", "File type:", "File size:"
  ✗ If no file: "STAGE 1 FAILED: No files"

STAGE 2: Starting text extraction...
  ✓ Logging file extension, buffer size
  
STAGE 3: Text extraction complete
  ✓ Log: "Extracted length: X characters"
  ✓ Log: "Preview: [first 150 chars]"
  ✗ If < 20 chars: "STAGE 3 FAILED: Extraction validation"

STAGE 4: Checking AI provider health...
  ✓ Log: "Ollama available: true/false"
  ⚠ If offline: "WARNING: Ollama offline"

STAGE 5: Calling AI provider...
  ✓ Log: "[Attempt 1/2] Sending resume to AI"
  ✗ If fails: "STAGE 5 FAILED: Ollama error after Xms"

STAGE 6: AI response received
  ✓ Log: "Response received: true"
  ✓ Log: "Response keys: [list]"

FINAL:
  ✓ "Resume analysis completed successfully"
  ✓ "SENDING RESPONSE TO CLIENT"
```

---

## What Error Banner Looks Like

When pipeline fails, you'll see:

```
════════════════════════════════════════════════════════════════════
❌ RESUME UPLOAD PIPELINE FAILED
════════════════════════════════════════════════════════════════════
Error message: [EXACT ERROR TEXT]
Stack trace:
  1. [File:line]
  2. [File:line]
  3. [File:line]
```

---

### 2. **LocalAIService (local-ai-service.ts) - PROVIDER CHAIN LOGS**

If resume reaches AI layer, you'll see:

```
[Local AI] ════════════════════════════════════════════════
[Local AI] AI STAGE A: Checking Ollama health...
[Local AI] Task type: [quiz-generation|resume-analysis|etc]
[Local AI] Provider: LOCAL OLLAMA at http://localhost:11434
[Local AI] Model: phi3

[Local AI] AI STAGE B: Sending prompt to Ollama...

  (on success)
  [Local AI] AI STAGE C: Ollama succeeded ✅

  (on failure)
  [Local AI] AI STAGE B FAILED: Ollama error after 15023ms
  [Local AI] Error: [EXACT ERROR MESSAGE]
  [Local AI] AI STAGE D: Attempting OpenAI fallback...
  
    (if OpenAI succeeds)
    [Local AI] AI STAGE D: OpenAI succeeded ✅
    
    (if OpenAI fails)
    [Local AI] AI STAGE D FAILED:  OpenAI error
    [Local AI] Error: [ERROR MESSAGE]
    [Local AI] [OpenAI quota message if applicable]

[Local AI] AI STAGE E: Falling back to deterministic generator...
```

---

## How to Test Right Now

### **The Quick Test** (2 minutes)

1. **Start server:**
   ```powershell
   npm run dev
   ```

2. **In another terminal, upload a test resume:**
   ```powershell
   $resumeContent = "John Doe`nSenior Engineer`nSkills: JavaScript, React"
   $resumeContent | Out-File "$env:TEMP\test.txt" -Encoding UTF8
   
   curl -X POST `
     -F "file=@$env:TEMP\test.txt" `
     -F "userId=1" `
     http://localhost:3000/api/musk/resume-upload
   ```

3. **Watch the backend logs:**
   - If you see `STAGE 1`, `STAGE 2`, etc. → file made it to backend
   - If you see `AI STAGE A`, `AI STAGE B`, etc. → file made it to AI call
   - If you see error → you know EXACTLY which stage failed

---

## The 4 Most Likely Failure Points

### **Failure 1: STAGE 3 FAILED** 
- **Means:** PDF/DOCX extraction is failing
- **Action:** Verify PDF library is installed, try TXT format instead

### **Failure 2: STAGE 5 FAILED + AI STAGE B FAILED**
- **Means:** Ollama is not running or unreachable
- **Action:** Run `ollama serve` in separate terminal

### **Failure 3: AI STAGE D FAILED + OpenAI quota**
- **Means:** Ollama failed AND OpenAI has no quota
- **Action:** Unset OPENAI_API_KEY and try again (will use deterministic fallback)

### **Failure 4: Response never appears in Musk Chat**
- **Means:** Response format mismatch
- **Action:** Check backend returned `{ message: "..." }` not `{ analysis: "..." }`

---

## Code References

**Resume handler:** [server/routes-musk.ts](server/routes-musk.ts#L676) (`handleResumeUpload`)
- Line 726: STAGE 1 logs (file received)
- Line 820: STAGE 2 logs (extraction start)
- Line 950: STAGE 3 logs (extraction done)
- Line 954: STAGE 4 logs (AI health check)
- Line 960: STAGE 5 logs (AI call)
- Line 967: STAGE 6 logs (AI response)

**AI Service:** [server/services/local-ai-service.ts](server/services/local-ai-service.ts#L293) (`_generateCompletion`)
- Line 293: AI STAGE A-E logging

---

## Next: Run the Test

When you run:
```powershell
npm run dev
```

Then in another terminal upload a resume, you'll see EXACTLY which stage fails.

**Copy the error message here, and we'll have the precise fix.**

---

**Build Status**: ✅ Compiled successfully (dist/index.js 2.8MB)  
**Logging Status**: ✅ All 12 debug stages instrumented
