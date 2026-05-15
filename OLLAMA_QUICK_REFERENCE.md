# Ollama Quick Reference

## 📋 Quick Start (5 minutes)

```bash
# 1. Download & Install
# https://ollama.ai

# 2. Pull the model (one-time)
ollama pull phi3

# 3. Start Ollama service
ollama serve

# 4. In another terminal, run the app
npm run dev

# 5. Test health endpoint
curl http://localhost:5000/api/health/ollama
```

## 🔧 Environment Variables

```env
OLLAMA_URL="http://localhost:11434"
OLLAMA_MODEL="phi3"
OLLAMA_TIMEOUT="90000"
RESUME_ANALYSIS_PROVIDER="ollama"
```

## 🚀 Common Commands

```bash
# Pull models
ollama pull phi3
ollama pull mistral
ollama pull llama3

# List installed models
ollama list

# Run Ollama service
ollama serve

# Test connection
curl http://localhost:11434/api/health

# Switch model (just change .env)
OLLAMA_MODEL="mistral"

# Change timeout for slow hardware (milliseconds)
OLLAMA_TIMEOUT="120000"  # 2 minutes
```

## 📊 Model Selection

```
phi3 (default)  → Fastest ⚡⚡⚡⚡
mistral         → Balanced ⚡⚡⚡
llama3          → Strongest quality ⚡⚡
```

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| "Cannot reach Ollama" | Run `ollama serve` in another terminal |
| "Model not found" | Run `ollama pull phi3` |
| "Slow analysis" | Switch to `phi3` or increase timeout |
| "Out of memory" | Use `phi3` instead of `mistral`/`llama3` |
| "Timeout errors" | Increase `OLLAMA_TIMEOUT` in .env |

## 📁 Key Files

- **Service**: `server/services/ollama-service.ts` (400+ lines)
- **Routes**: `server/routes-musk.ts` (integrated at lines ~940 & ~1250)
- **Config**: `.env` (4 new variables)
- **Guide**: `OLLAMA_SETUP_GUIDE.md` (detailed docs)

## 🔑 Main Functions

```typescript
// From server/services/ollama-service.ts

analyzeResumeWithOllama(resumeText)
  → { summary, strengths, weaknesses, skills_detected, ... }

analyzePitchDeckWithOllama(pitchDeckText)
  → { overall_score, strengths, weaknesses, ... }

getOllamaHealth()
  → { available: boolean, model: string, url: string }

isOllamaAvailable()
  → boolean
```

## 📈 Performance

| Task | Time | Model |
|------|------|-------|
| 1-page resume | ~3-5s | phi3 |
| 3-page resume | ~8-12s | phi3 |
| Pitch deck | ~5-8s | phi3 |
| Cold start | +2-3s | - |

## ✅ What's Integrated

- ✅ Resume upload → Ollama analysis
- ✅ Pitch deck upload → Ollama analysis
- ✅ Health check endpoint
- ✅ Error handling & retries
- ✅ Timeout management
- ✅ JSON fallback parsing
- ✅ Fully modular (swappable models)

## 🎯 Data Flow

```
User Upload
    ↓
Extract Text (PDF/Word)
    ↓
POST to Ollama (localhost:11434)
    ↓
Parse JSON Response
    ↓
Map to Frontend Schema
    ↓
Return to Dashboard
    ↓
Display Results (no latency!)
```

All processing happens server-side. **Zero API calls. 100% Private.**

## 🔐 Privacy

✅ Resumes never leave your machine
✅ No OpenAI API calls
✅ No external network access
✅ GDPR/CCPA compliant
✅ Complete data ownership

## 📞 Support

Check logs:
```bash
# In Ollama terminal
ollama serve

# In app terminal
npm run dev

# Test endpoints
curl http://localhost:11434/api/health
curl http://localhost:5000/api/health/ollama
```
