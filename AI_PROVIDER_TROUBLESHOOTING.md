# AI Provider Troubleshooting Guide

## 🚨 Quick Fixes

### Issue: "Quests won't generate" or "Quest generation times out"

**Diagnosis**:
1. Check if Ollama is running: `ollama serve`
2. Check logs for "TIMEOUT" or "ECONNREFUSED"

**Fix**:
```bash
# Start Ollama if not running
ollama serve

# Verify it's working
curl http://localhost:11434/api/tags

# If still failing, try restarting server
npm run dev
```

---

### Issue: "Deterministic quests showing as fallback" (Rule-based, not AI)

**Diagnosis**: See "Using deterministic fallback" in logs

**Why**: 
- Ollama timed out after 15 seconds
- Ollama not running
- Ollama port 11434 blocked

**Fix**:
```bash
# Option 1: Start Ollama
ollama serve

# Option 2: Check port conflict
netstat -ano | findstr :11434

# Option 3: Restart and wait for Ollama to load
ollama serve
npm run dev  # After seeing "Listening on http://localhost:11434"
```

---

### Issue: "OpenAI quota exceeded" appears in logs but generation continues

**Diagnosis**: System detected 429 error from OpenAI

**Why**: 
- OpenAI API key has hit rate limit
- OpenAI account has $0 balance
- Too many requests in short time

**Fix**:
```bash
# Unset OpenAI key temporarily (system uses fallback instead)
$env:OPENAI_API_KEY = ""  # Windows PowerShell
npm run dev

# OR upgrade OpenAI account and restart
# (OpenAI re-enabled automatically on server restart)
```

---

### Issue: Quests generating but look generic/low quality

**Diagnosis**: Using deterministic fallback generator

**Why**: 
- Ollama quality varies by model
- Model may be incorrect
- Network issues with Ollama

**Fix**:
```bash
# Check Ollama model
ollama list

# Change model if needed
ollama pull mistral  # Better quality than phi3
$env:OLLAMA_MODEL = "mistral"
npm run dev

# Verify Ollama working well
ollama run mistral "Generate a professional development quest"
```

---

## 📊 Provider Health Check

### View Provider Chain Status

```bash
# Check Ollama running
curl http://localhost:11434/api/tags
# Expected: JSON list of models, HTTP 200

# Check logs for provider messages
npm run dev > logs.txt 2>&1
# Search for: "Provider: LOCAL OLLAMA" or "TIMEOUT" or "Deterministic fallback"
```

### Test Each Provider

**Test 1: Ollama Only**
```bash
ollama serve
npm run dev
# Try: Upload resume, generate quest
# Success: Completes in 3-5 seconds
```

**Test 2: Ollama Down, OpenAI Available**
```bash
# Kill Ollama process
$env:OPENAI_API_KEY = "sk-..."
npm run dev
# Try: Upload resume
# Success: Takes longer (2-3s for OpenAI), completes
```

**Test 3: All Down, Use Fallback**
```bash
# Kill Ollama
$env:OPENAI_API_KEY = ""  # Unset
npm run dev
# Try: Upload resume
# Success: Instant, uses rule-based generation
```

---

## 🔍 Debugging: Read the Logs

### Log Patterns Explained

**Success (Ollama)**:
```
[Ollama] ✅ Generation complete, response length: 1245 chars
```
→ Ollama worked, all good ✅

**Fallback (Timeout)**:
```
[Ollama] ⏱️ TIMEOUT after 15.023 seconds
[Local AI] 📋 Using deterministic fallback
```
→ Ollama too slow, using rule-based instead ⚠️

**Fallback (Connection)**:
```
[Ollama] ❌ Connection refused: ECONNREFUSED
[Local AI] 📋 Using deterministic fallback
```
→ Ollama not running, using rule-based instead ⚠️

**OpenAI Fallback**:
```
[OpenAI] ✅ Completion received: 987 chars
```
→ OpenAI succeeded (Ollama must have failed first) ℹ️

**OpenAI Quota Error**:
```
[OpenAI] 🚨 QUOTA EXCEEDED (429). Disabling OpenAI for this session.
[Local AI] 📋 Using deterministic fallback
```
→ OpenAI rate limited, using rule-based ⚠️

---

## 📋 System State Checklist

### Before Deployment

- [ ] Ollama installed: `ollama --version`
- [ ] Model available: `ollama list | grep phi3`
- [ ] Port 11434 open: `curl http://localhost:11434/api/tags`
- [ ] .env has no AI_PROVIDER env var
- [ ] .env has no AI_BASE_URL env var
- [ ] .env has no AI_FALLBACK_OPENAI env var
- [ ] OPENAI_API_KEY is optional (remove if not needed)

### After Server Starts

- [ ] Logs show "Provider: LOCAL OLLAMA at http://localhost:11434"
- [ ] Logs show model name (phi3, mistral, etc)
- [ ] No "TIMEOUT" errors in first 10 seconds
- [ ] No "All AI providers failed" in logs

### During Operation

- [ ] Quests generate (either AI or rule-based)
- [ ] No crashes on AI failure
- [ ] Scheduler continues even if Ollama restarts
- [ ] Logs show provider chain working

---

## ⚡ Common Errors & Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| `ECONNREFUSED` at :11434 | Ollama not running | `ollama serve` |
| `TIMEOUT after 15s` | Ollama too slow | Restart Ollama or change model |
| `429 - rate_limit` | OpenAI quota hit | Unset OPENAI_API_KEY or wait |
| `401 - unauthorized` | Bad OpenAI key | Fix API key or unset |
| `deterministic fallback` | All providers failed | Start Ollama |
| Quest generation hangs | Timeout not working | Update timeout to 15000ms |
| Server won't start | Import error | Run `npm install` and build |

---

## 🔧 Advanced Troubleshooting

### Check Network Between App and Ollama

```bash
# Test if Ollama is accessible from Node.js
curl -X POST http://localhost:11434/api/generate \
  -H "Content-Type: application/json" \
  -d '{"model": "phi3", "prompt": "Hi", "stream": false}'

# Expected: JSON response with generated text
# If fails: Ollama port blocked or not listening
```

### Check Ollama Model Performance

```bash
# Measure Ollama response time
Measure-Command {
  curl -X POST http://localhost:11434/api/generate `
    -H "Content-Type: application/json" `
    -d '{"model": "phi3", "prompt": "Write a 50-word quest description", "stream": false}' 
}

# Good: < 5 seconds
# OK: 5-15 seconds
# Bad: > 15 seconds (triggers fallback/timeout)
```

### Check Ollama Available Models

```bash
ollama list
# Output:
# NAME            ID              SIZE      MODIFIED
# phi3:latest     xxxxxxxxxx      7.3GB     2 hours ago
# mistral:latest  xxxxxxxxxx      4.1GB     5 days ago
```

### Switch Ollama Model

```powershell
# PowerShell
$env:OLLAMA_MODEL = "mistral"
npm run dev

# Bash
export OLLAMA_MODEL=mistral
npm run dev
```

---

## 🧪 Test Scripts

### Test 1: Verify Ollama Health

```bash
# File: test-ollama.ps1
$response = curl -s http://localhost:11434/api/tags
if ($response) {
  Write-Host "✅ Ollama is running"
  $models = $response | ConvertFrom-Json
  Write-Host "Available models: $($models.models.Count)"
} else {
  Write-Host "❌ Ollama is NOT running"
  Write-Host "Start it: ollama serve"
}
```

### Test 2: Time Each Provider

```bash
# Test Ollama response time
$start = Get-Date
$response = curl -s -X POST http://localhost:11434/api/generate `
  -H "Content-Type: application/json" `
  -d '{"model": "phi3", "prompt": "Hello", "stream": false}'
$end = Get-Date
$elapsed = ($end - $start).TotalSeconds
Write-Host "Ollama took: ${elapsed}s"

# If > 15s, fallback would trigger
# If < 5s, optimal
```

### Test 3: Simulate Timeout

```bash
# Kill Ollama to trigger timeout/fallback
taskkill /IM ollama.exe /F

# Try to generate a quest - should use fallback
npm run dev

# Restart Ollama
ollama serve
```

---

## 📞 When to Worry

### 🟢 OK (Don't worry)
- Seeing "Using deterministic fallback" occasionally
- Seeing "Attempting OpenAI fallback"  
- Quests take different times (3s vs instant)
- Seeing provider chain in logs

### 🟡 INVESTIGATE
- Deterministic fallback ALWAYS (every quest)
- Timeouts every time (> 15s consistently)
- OpenAI quota errors with valid key

### 🔴 CRITICAL
- "All AI providers failed" error (shouldn't happen)
- Scheduler stopping
- Quests not generating at all
- Server crashes on quest generation

---

## 📞 If All Else Fails

1. **Restart Ollama**:
   ```bash
   taskkill /IM ollama.exe /F
   ollama serve
   ```

2. **Restart Server**:
   ```bash
   # Ctrl+C in terminal
   npm run dev
   ```

3. **Check Logs**:
   ```bash
   npm run dev > debug.log 2>&1
   # Read debug.log and search for errors
   ```

4. **Reset to Defaults**:
   ```bash
   # Remove all custom AI env vars
   # Keep only: OLLAMA_MODEL=phi3
   npm run dev
   ```

5. **Verify Architecture**:
   - [ ] Check `server/services/local-ai-service.ts` line with `baseUrl = 'http://localhost:11434'`
   - [ ] Check `deterministic-fallback-generator.ts` exists
   - [ ] Check build has no errors: `npm run build`

---

## 📚 Related Docs

- **[AI_PROVIDER_ARCHITECTURE_FIX.md](AI_PROVIDER_ARCHITECTURE_FIX.md)** - Full architectural explanation
- **[OLLAMA_SETUP_GUIDE.md](OLLAMA_SETUP_GUIDE.md)** - Ollama installation & setup
- **[LOCAL_AI_SETUP.md](LOCAL_AI_SETUP.md)** - Local AI configuration

---

**Last Updated**: 2025  
**System Status**: ✅ Resilient (never crashes due to AI failure)
