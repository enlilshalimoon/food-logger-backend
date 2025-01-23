import OpenAI from "openai";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const gpt4oVisionAPI = async (base64Image) => {
    try {
        // GPT-4o expects image input as a structured message
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "user",
                    content: [
                        { type: "text", text: "What's in this image?" },
                        {
                            type: "image_url",
                            image_url: { url: `data:image/jpeg;base64,${base64Image}`, detail: "low" },
                        },
                    ],
                },
            ],
            max_tokens: 300, // Limit tokens for predictable cost
        });

        return response.choices[0].message.content;
    } catch (error) {
        console.error("Error in GPT-4o Vision API:", error.message);
        throw new Error("Failed to process the request.");
    }
};


export { gpt4oVisionAPI };