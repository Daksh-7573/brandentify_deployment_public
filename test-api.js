import OpenAI from 'openai';

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

async function testOpenAI() {
  try {
    console.log("Testing OpenAI API...");
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant.",
        },
        {
          role: "user",
          content: "Say hello world",
        },
      ],
      max_tokens: 10,
    });

    console.log("API Response:");
    console.log(completion.choices[0].message.content);
    console.log("API call successful!");
  } catch (error) {
    console.error("Error testing OpenAI API:", error);
  }
}

testOpenAI();
