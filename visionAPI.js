import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const gpt4oVisionAPI = async (imageUrl) => {
    try {
        const data = {
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: `
                        You are an expert food identification assistant. 
                        Analyze food images and identify the specific food item visible in the image.
                        Provide details such as the exact name of the food, its approximate calories, and macros.
                        If unsure, provide your best guess and include "uncertain" in the JSON response.
                    `,
                },
                {
                    role: "user",
                    content: [
                        {
                            type: "text",
                            text: `
                                Analyze this food image and respond strictly in JSON format with the following structure:
                                {
                                  "name": "specific food name",
                                  "calories": "approximate number of calories",
                                  "macros": {
                                    "carbs": "grams",
                                    "protein": "grams",
                                    "fats": "grams"
                                  }
                                }
                                Only describe the visible food and avoid guessing unrelated food combinations.
                            `,
                        },
                        {
                            type: "image_url",
                            image_url: {
                                url: imageUrl,
                                detail: "high", // Specify detail level: "low", "high", or "auto"
                            },
                        },
                    ],
                },
            ],
            functions: [
                {
                    name: "analyzeFoodImage",
                    description: "Analyze a food image and provide nutritional data",
                    parameters: {
                        type: "object",
                        properties: {
                            name: {
                                type: "string",
                                description: "The name of the food item"
                            },
                            calories: {
                                type: "number",
                                description: "The approximate calorie count"
                            },
                            macros: {
                                type: "object",
                                properties: {
                                    carbs: {
                                        type: "number",
                                        description: "Carbohydrates in grams"
                                    },
                                    protein: {
                                        type: "number",
                                        description: "Protein in grams"
                                    },
                                    fats: {
                                        type: "number",
                                        description: "Fats in grams"
                                    }
                                },
                                required: ["carbs", "protein", "fats"]
                            }
                        },
                        required: ["name", "calories", "macros"]
                    }
                }
            ],
            function_call: { name: "analyzeFoodImage" }
        };

        const startTime = Date.now();
        const response = await openai.chat.completions.create(data);
        const endTime = Date.now();

        console.log(`OpenAI API call took ${endTime - startTime}ms`);
        console.log("Function call arguments:", response.choices[0]?.message?.function_call?.arguments);

        console.log("Raw GPT-4o-mini response:", response);
        console.log("Full response message:", JSON.stringify(response.choices[0].message, null, 2));

        const functionCallArguments = response.choices[0]?.message?.function_call?.arguments;
        if (!functionCallArguments) {
            throw new Error("No function call arguments found in response.");
        }

        const parsedData = JSON.parse(functionCallArguments);
        console.log("Parsed nutritional data:", parsedData);

        return parsedData;
    } catch (error) {
        console.error("Error in GPT-4o Vision API:", error.message || error.response?.data);
        throw new Error("Failed to process the request.");
    }
};

export { gpt4oVisionAPI };