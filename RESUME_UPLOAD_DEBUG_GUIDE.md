# Resume Upload Debug: Step-by-Step Isolation

## ✅ What's Working
- Ollama is running at localhost:11434
- llama3 model available
- File extraction pipeline works

## ❌ What's Broken  
- API server not responding
- This is **why resume upload fails**

---

## 🔧 Exact Steps to Debug (2 Minutes)

### Terminal 1: Start dev server
```powershell
npm run dev
```

Wait 15-20 seconds for server to fully start.  
Look for logs appearing.  
You'll know it's ready when you see messages about schedulers running.

---

### Terminal 2: Test upload (in new PowerShell)

**Create test resume:**
```powershell
$resume = @"
John Doe
Software Engineer
john@example.com

PROFESSIONAL SUMMARY
5+ years building web applications using React and Node.js.

SKILLS
- JavaScript, TypeScript, React, Node.js, PostgreSQL

EXPERIENCE
Senior Engineer at TechCorp (2022-2025)
- Led team of 3 developers
- Built customer dashboard

EDUCATION
BS Computer Science, State University (2020)
"@

$resume | Out-File -Path "$env:TEMP\test.txt" -Encoding UTF8
```

**Upload the test resume:**
```powershell
$form = @{
    file = Get-Item -Path "$env:TEMP\test.txt"
    userId = "1"
}

$response = Invoke-WebRequest `
    -Uri "http://localhost:3000/api/musk/resume-upload" `
    -Method POST `
    -Form $form `
    -ErrorAction Stop

$response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 2
```

---

## 📊 What You'll See

If successful, you'll see JSON like:
```json
{
  "id": "resume-analysis-17394...",
  "success": true,
  "message": "[formatted analysis text here]",
  "analysis": "[formatted analysis text here]",
  "score": {...},
  "timestamp": "2025-03-01T..."
}
```

---

## 🔍 How to Read Server Logs

### Terminal 1 (dev server) will show:

**Step 1 - File received:**
```
✅ File received: true
File mimetype: text/plain
```
← If you DON'T see this, file didn't reach backend

**Step 2 - Text extraction:**
```
Extracted text length: 450
First 200 chars: [preview of content...]
```
← If this is 0, extraction failed on PDF/DOCX parsing

**Step 3 - Ollama call:**
```
✅ Calling AI provider...
[Resume Analysis ATTEMPT 1] Calling analyzeResumeWithOllama...
✅ AI response received: true
```
← If you DON'T see "AI response received: true", Ollama timed out

**Step 4 - Response sent:**
```
✅ Resume analysis completed successfully
✅ [Resume Upload] SENDING RESPONSE TO CLIENT
Response: Keys being sent: [id, success, message, analysis, score, filename, timestamp]
```
← If this doesn't appear, response formatting failed

---

## 🚨 Most Likely Issues & Fixes

### Issue 1: "Ollama not running"
**Error message:** `⚠️ OLLAMA NOT RUNNING`  
**Fix:**
```powershell
ollama serve
# Wait 5 seconds for it to fully start
```

### Issue 2: "Timeout waiting for AI response"
**Error:** Logs show "ATTEMPT 1" then "ATTEMPT 2" then error  
**Fix:**
- Ollama might be overloaded
- Try simpler resume (shorter text)
- Or wait 10 seconds and retry

### Issue 3: "Text extraction length: 0"
**Error:** `Extracted text length: 0`  
**Fix:**
- Your file likely isn't a real PDF/text/doc
- Try a `.txt` file instead of PDF
- Verify file has actual text content

### Issue 4: Nothing appears in Musk Chat
**Even if logs show success:**  
**Check:**
1. Browser console: `F12 → Console tab`
2. Look for error messages
3. Verify response has both `message` AND `analysis` fields

---

## ⏱️ Expected Timeline

- Start dev server: **10-15 seconds**
- Upload resume: **2-5 seconds** (Ollama thinks)
- See response: **Immediate**

If any step takes > 15 seconds, it's likely hanging (Ollama timeout).

---

## 📝 Exact Log Traces

### TRACE 1: Working upload
```
✅ File received: true
Extracted text length: 450
✅ Calling AI provider...
✅ Ollama running: true
✅ AI response received: true
✅ Resume analysis completed successfully
[Resume Upload] SENDING RESPONSE TO CLIENT
```

### TRACE 2: File extraction fails
```
✅ File received: true
❌ [Resume Extract] ERROR - Details: {...}
TEXT_EXTRACTION_FAILED
```

### TRACE 3: Ollama timeout
```
✅ File received: true
✅ Extracted text length: 450
✅ Calling AI provider...
⚠️ Ollama running: false
❌ [Resume Analysis] Ollama attempt 1 failed: Network timeout
❌ [Resume Analysis] Ollama attempt 2 failed: Network timeout
RESUME_PROCESSING_ERROR
```

---

## 🎯 Answer These 4 Questions

After you run the test, answer:

**1️⃣ Does backend log show "File received: true"?**  
- YES → File upload working ✅
- NO → Frontend not sending file properly

**2️⃣ Does log show "Extracted text length: [number > 0]"?**  
- YES → Extraction working ✅
- NO → PDF/DOCX parsing failing

**3️⃣ Does log show "✅ AI response received: true"?**  
- YES → Ollama working ✅
- NO → Ollama timeout or unavailable

**4️⃣ Does Musk Chat show analysis?**  
- YES → Everything working ✅
- NO → Response format mismatch (check response for "message" key)

---

## 🚀 If Everything Works...

Then "resume upload not working" is actually **UI display issue**:
- Response is generated correctly
- Musk Chat isn't showing it

**Fix:** Verify frontend handler at line ~560 in `musk-chat-panel.tsx` is getting the response.

---

## 💡 Fastest Way to Test

```powershell
# Terminal 1
npm run dev

# Wait 10 seconds, then Terminal 2
node debug-resume-upload.js

# If Ollama check passes, upload test file
# Then watch Terminal 1 logs for the 4 steps above
```

**Total time: 2 minutes**

