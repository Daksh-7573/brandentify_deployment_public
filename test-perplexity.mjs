// Test script for Perplexity API integration

// Check if API key is present
if (!process.env.PERPLEXITY_API_KEY) {
  console.error("Error: PERPLEXITY_API_KEY environment variable is not set.");
  console.error("Please set this environment variable to your Perplexity API key and try again.");
  process.exit(1);
}

async function testPerplexityAPI() {
  try {
    console.log("Attempting to connect to Perplexity API...");
    
    const response = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PERPLEXITY_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.1-sonar-small-128k-online",
        messages: [
          {
            role: "system",
            content: "Be precise and concise."
          },
          {
            role: "user",
            content: "What are the top 3 skills needed for a software developer in 2025?"
          }
        ],
        temperature: 0.2,
        top_p: 0.9,
        return_related_questions: false,
        search_recency_filter: "month",
        stream: false,
        presence_penalty: 0,
        frequency_penalty: 1
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API request failed with status ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    
    console.log("Success! Perplexity API is working.");
    console.log("\nAPI Response:");
    console.log("Model Used:", data.model);
    console.log("Response ID:", data.id);
    
    if (data.citations && data.citations.length > 0) {
      console.log("\nCitations:");
      data.citations.forEach(citation => console.log("- " + citation));
    }
    
    console.log("\nContent:");
    console.log(data.choices[0].message.content);
    
    console.log("\nToken Usage:");
    console.log("Prompt tokens:", data.usage.prompt_tokens);
    console.log("Completion tokens:", data.usage.completion_tokens);
    console.log("Total tokens:", data.usage.total_tokens);
    
  } catch (error) {
    console.error("Error connecting to Perplexity API:");
    console.error(error.message);
  }
}

// Run the test
testPerplexityAPI();