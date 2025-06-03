# Local AI Setup Guide - Replace OpenAI with Free Models

This guide will help you replace OpenAI with free, local AI models to save costs on your AI-powered career development platform.

## Why Use Local AI Models?

- **Cost Savings**: Eliminate OpenAI API costs (can save $100-1000+ per month)
- **Privacy**: All AI processing happens on your infrastructure
- **Control**: Full control over model performance and availability
- **Scalability**: No API rate limits or token costs

## Recommended Setup Options

### Option 1: Ollama (Recommended - Easiest Setup)

Ollama makes it simple to run large language models locally.

#### Installation Steps:

1. **Install Ollama**:
   ```bash
   # On Linux/macOS
   curl -fsSL https://ollama.ai/install.sh | sh
   
   # On Windows
   # Download from https://ollama.ai/download
   ```

2. **Download Models**:
   ```bash
   # Lightweight model (3B parameters) - Good for basic tasks
   ollama pull llama3.2:3b
   
   # Medium model (7B parameters) - Better quality responses
   ollama pull llama3.1:7b
   
   # Large model (70B parameters) - Best quality (requires 40GB+ RAM)
   ollama pull llama3.1:70b
   ```

3. **Set Environment Variables**:
   ```bash
   # Add to your .env file
   AI_PROVIDER=ollama
   AI_BASE_URL=http://localhost:11434
   AI_MODEL=llama3.2:3b
   AI_MAX_TOKENS=2000
   AI_TEMPERATURE=0.7
   AI_FALLBACK_OPENAI=true  # Optional: fallback to OpenAI if local model fails
   ```

4. **Start Ollama Service**:
   ```bash
   ollama serve
   ```

### Option 2: LM Studio (GUI-based)

LM Studio provides a user-friendly interface for running local models.

1. **Download LM Studio**: https://lmstudio.ai/
2. **Download a Model** through the LM Studio interface
3. **Start Local Server** in LM Studio
4. **Configure Environment**:
   ```bash
   AI_PROVIDER=lmstudio
   AI_BASE_URL=http://localhost:1234
   AI_MODEL=your-model-name
   ```

### Option 3: Hugging Face Inference API (Cloud-based Free Tier)

Use Hugging Face's free inference API for small workloads.

1. **Get API Key**: Sign up at https://huggingface.co/
2. **Configure Environment**:
   ```bash
   AI_PROVIDER=huggingface
   AI_MODEL=meta-llama/Llama-2-7b-chat-hf
   AI_API_KEY=your_huggingface_token
   ```

## Model Recommendations by Use Case

### For Basic Career Advice (Low Cost):
- **Llama 3.2 3B**: Fast, efficient, good for simple responses
- **Mistral 7B**: Excellent instruction following

### For High-Quality Resume Analysis:
- **Llama 3.1 7B**: Better reasoning and analysis capabilities
- **CodeLlama 7B**: Good for technical resume analysis

### For Enterprise/Production:
- **Llama 3.1 70B**: Best quality responses (requires powerful hardware)
- **GPT4All**: Commercial-friendly licensing

## Hardware Requirements

| Model Size | RAM Required | GPU Memory | Performance |
|------------|-------------|------------|-------------|
| 3B         | 8GB         | 4GB        | Fast       |
| 7B         | 16GB        | 8GB        | Good       |
| 13B        | 32GB        | 16GB       | Better     |
| 70B        | 64GB        | 40GB       | Best       |

## Configuration Options

Add these to your `.env` file:

```bash
# Primary AI Configuration
AI_PROVIDER=ollama                    # ollama, lmstudio, huggingface, openai
AI_BASE_URL=http://localhost:11434    # Local server URL
AI_MODEL=llama3.2:3b                  # Model name
AI_MAX_TOKENS=2000                    # Max response length
AI_TEMPERATURE=0.7                    # Response creativity (0.0-1.0)

# Fallback Configuration
AI_FALLBACK_OPENAI=true               # Use OpenAI if local models fail
OPENAI_API_KEY=your_openai_key        # Optional: for fallback only

# Performance Tuning
AI_TIMEOUT=30000                      # Request timeout in milliseconds
AI_RETRY_ATTEMPTS=3                   # Number of retry attempts
```

## Integration Steps

1. **Update Environment Variables**: Add the AI configuration to your `.env` file
2. **Restart Application**: The local AI service will automatically initialize
3. **Test AI Features**: Try career advice, resume analysis, and hashtag suggestions
4. **Monitor Performance**: Check logs for response times and error rates

## Testing Your Setup

Test if your local AI is working:

```bash
# Test Ollama directly
curl http://localhost:11434/api/generate -d '{
  "model": "llama3.2:3b",
  "prompt": "Give me career advice for a software developer",
  "stream": false
}'
```

## Cost Comparison

| Usage Level | OpenAI Cost/Month | Local AI Cost | Savings |
|-------------|------------------|---------------|---------|
| Light       | $50-100          | $0            | 100%    |
| Medium      | $200-500         | $0            | 100%    |
| Heavy       | $1000+           | $0            | 100%    |

*Local AI only costs are electricity and hardware (one-time investment)*

## Performance Optimization Tips

1. **Use GPU Acceleration**: Install CUDA drivers for faster inference
2. **Optimize Model Size**: Balance quality vs. speed based on your needs
3. **Cache Responses**: Implement caching for common queries
4. **Load Balancing**: Run multiple model instances for high traffic

## Troubleshooting

### Common Issues:

1. **"Model not found"**: Make sure you've downloaded the model with `ollama pull`
2. **"Connection refused"**: Ensure Ollama service is running with `ollama serve`
3. **Out of memory**: Try a smaller model or increase system RAM
4. **Slow responses**: Consider using a smaller model or GPU acceleration

### Fallback Strategy:

The system automatically falls back to OpenAI if local models fail, ensuring your application stays operational.

## Security Considerations

- **Data Privacy**: All data stays on your infrastructure
- **Network Security**: Local models don't send data to external APIs
- **Access Control**: Secure your local AI endpoints appropriately

## Next Steps

1. Choose your preferred setup option (Ollama recommended)
2. Install and configure the local AI service
3. Update your environment variables
4. Test the integration
5. Monitor performance and adjust model size as needed

Your application will now use free, local AI models instead of expensive OpenAI API calls while maintaining the same functionality!