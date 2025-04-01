import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Function to test if the API key works correctly with base64 binary data
async function testBinaryProcessing() {
  try {
    console.log("Testing OpenAI API with binary data simulation...");
    
    // Create a small sample "binary-like" content (not actual binary, but simulates it)
    const sampleBinaryData = Buffer.from("Sample PDF content with binary markers \x00\x01\x02%PDF", 'utf-8').toString('base64');
    
    console.log("Created sample binary data in base64 format");
    console.log("Testing if the OpenAI API can process this type of content...");
    
    // Use OpenAI API to process the binary data
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that analyzes document content."
        },
        {
          role: "user",
          content: `This is a binary document in base64 format. Extract any readable text: ${sampleBinaryData}`
        }
      ]
    });
    
    console.log("OpenAI API response:", response.choices[0].message.content);
    console.log("API call successful. Binary data processing seems to be working.");
  } catch (error) {
    console.error("Error testing binary processing:", error);
  }
}

// Execute the test
testBinaryProcessing();
