// Test PDF handling with GPT-4o Vision API
import { OpenAI } from 'openai';
import fs from 'fs';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// This function simulates sending a base64-encoded PDF to the vision API
async function testVisionPDF() {
  try {
    console.log("Starting PDF vision test...");
    
    // Sample short base64 data to simulate a PDF - not a real PDF
    // In real usage, this would be loaded from a file or form upload
    const mockPDFData = "JVBERi0xLjMNCiXi48/TDQoNCjEgMCBvYmoNCjw8DQovVHlwZSAvQ2F0YWxvZw0KL091dGxpbmVzIDIgMCBSDQovUGFnZXMgMyAwIFINCj4+DQplbmRvYmoNCg0KMiAw";
    
    console.log("Preparing to call OpenAI API with multimodal format...");
    
    // Call the vision API with the PDF data
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { 
          role: "system", 
          content: "You are an expert resume analyzer looking at a resume file. Extract professional information in a structured format." 
        },
        { 
          role: "user", 
          content: [
            {
              type: "text", 
              text: "Please analyze this file and extract any text content you can see. This is a test of your ability to read document contents."
            },
            {
              type: "image_url", 
              image_url: {
                url: `data:application/pdf;base64,${mockPDFData}`
              }
            }
          ]
        }
      ],
      temperature: 0.1,
    });
    
    console.log("OpenAI API response received successfully");
    console.log("Response:", response.choices[0].message.content);
    
    return {
      success: true,
      response: response.choices[0].message.content
    };
  } catch (error) {
    console.error("Error in vision PDF test:", error);
    console.error("Error details:", error.message);
    
    // Check for specific error types
    if (error.response) {
      console.error("API response status:", error.response.status);
      console.error("API response data:", error.response.data);
    }
    
    return {
      success: false,
      error: error.message || "Unknown error"
    };
  }
}

// Run the test
(async () => {
  console.log("=== PDF Vision API Test ===");
  const result = await testVisionPDF();
  
  if (result.success) {
    console.log("✅ Test completed successfully!");
  } else {
    console.log("❌ Test failed:", result.error);
  }
  
  console.log("=== End of Test ===");
})();