const { Configuration, OpenAIApi } = require('openai');

// Initialize OpenAI API
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY, // Use your OpenAI API key
});
const openai = new OpenAIApi(configuration);

// Analyze food items using GPT-4
const analyzeFoodWithGPT = async (foodItems) => {
  try {
    const prompt = `Estimate the calories and provide insights for the following food items: ${foodItems.join(', ')}.`;

    const response = await openai.createChatCompletion({
      model: 'gpt-4-turbo',
      messages: [
        { role: 'system', content: 'You are an expert in food and nutrition analysis.' },
        { role: 'user', content: prompt },
      ],
      stream: false, // Disable streaming for simplicity
    });

    // Extract GPT-4 response
    const gptResponse = response.data.choices[0].message.content;
    return gptResponse;
  } catch (error) {
    console.error('Error in GPT API:', error.message);
    throw new Error('Failed to analyze food with GPT-4.');
  }
};

module.exports = { analyzeFoodWithGPT };
