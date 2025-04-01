import OpenAI from 'openai';

// Check if OpenAI API key is working
async function testOpenAIAPIKey() {
  console.log("Testing OpenAI API key...");
  
  // Get the API key from environment
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    console.error("ERROR: No OPENAI_API_KEY found in environment variables");
    process.exit(1);
  }
  
  console.log(`API key found. First 4 chars: ${apiKey.substring(0, 4)}...`);
  
  // Create OpenAI instance
  const openai = new OpenAI({ apiKey });
  
  try {
    // Make a simple request
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: "Hello, are you working?" }
      ],
      max_tokens: 10
    });
    
    console.log("SUCCESS: API key is valid and working!");
    console.log("Response:", completion.choices[0].message.content);
    process.exit(0);
  } catch (error) {
    console.error("ERROR with OpenAI API:", error.message);
    
    // Check for specific error types
    if (error.message.includes("API key")) {
      console.error("This appears to be an API key issue. Please verify your OpenAI API key.");
    } else if (error.message.includes("rate limit")) {
      console.error("You've hit a rate limit. Try again later.");
    }
    
    process.exit(1);
  }
}

// Run the test
testOpenAIAPIKey();