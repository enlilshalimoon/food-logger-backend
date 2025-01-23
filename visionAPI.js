import OpenAI from "openai";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const gpt4oVisionAPI = async (foodDescription) => {
    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: "You are an expert in food and nutrition analysis." },
                { role: "user", content: `Analyze this meal: ${foodDescription}` },
            ],
            temperature: 0.7,
        });
        return response.choices[0].message.content;
    } catch (error) {
        console.error("Error in GPT-4o Vision API:", error.message);
        throw new Error("Failed to process the request.");
    }
};

export { gpt4oVisionAPI };