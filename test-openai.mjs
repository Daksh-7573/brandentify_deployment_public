import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function main() {
  try {
    console.log("Attempting to connect to OpenAI...");
    const result = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: "Say hello!" }
      ],
    });
    
    console.log("Success! API is working.");
    console.log("Response:", result.choices[0].message.content);
  } catch (error) {
    console.error("Error connecting to OpenAI API:");
    console.error(error.message);
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Data:", error.response.data);
    }
  }
}

main();
