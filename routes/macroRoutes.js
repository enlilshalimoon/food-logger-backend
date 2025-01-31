import dotenv from "dotenv";
dotenv.config();
console.log("DEBUG: OpenAI API Key in macroRoutes.js:", process.env.OPENAI_API_KEY);

import express from "express";
import OpenAI from "openai";

const router = express.Router();

// Initialize OpenAI with your API key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

console.log("Using OpenAI API Key:", process.env.OPENAI_API_KEY);

/**
 * POST /api/calculate-macros
 * Expects: { responses: [...] }
 * 
 * This logic remains untouched.
 */
router.post("/calculate-macros", async (req, res) => {
  const { responses } = req.body;

  if (!responses) {
    return res.status(400).json({ error: "Responses are required" });
  }

  const prompt = `
    Based on the following user inputs, calculate the daily calorie needs and macronutrients (protein, carbs, fats):
    ${JSON.stringify(responses, null, 2)}

    Respond strictly in JSON format:
    {
      "calories": "calculated daily calorie needs",
      "macros": {
        "protein": "grams of protein",
        "carbs": "grams of carbs",
        "fats": "grams of fats"
      }
    }
  `;

  try {
    const data = {
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
            You are a fitness and health assistant. 
            Analyze user data to calculate calorie needs and macronutrients. 
            Always respond in valid JSON format with the exact structure specified.
          `,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      functions: [
        {
          name: "calculateMacros",
          description: "Calculate calorie needs and macronutrients",
          parameters: {
            type: "object",
            properties: {
              calories: { type: "number", description: "Daily calorie needs" },
              macros: {
                type: "object",
                properties: {
                  protein: { type: "number", description: "Protein in grams" },
                  carbs: { type: "number", description: "Carbs in grams" },
                  fats: { type: "number", description: "Fats in grams" },
                },
                required: ["protein", "carbs", "fats"],
              },
            },
            required: ["calories", "macros"],
          },
        },
      ],
      function_call: { name: "calculateMacros" },
    };

    const gptResponse = await openai.chat.completions.create(data);
    const functionCallArguments = gptResponse.choices[0]?.message?.function_call?.arguments;

    if (!functionCallArguments) {
      throw new Error("GPT failed to return valid JSON.");
    }

    const macroData = JSON.parse(functionCallArguments);
    res.json(macroData);
  } catch (error) {
    console.error("Error calculating macros:", error.message || error);
    res.status(500).json({ error: "Failed to calculate macros. Try again." });
  }
});

/**
 * POST /api/macros-from-text
 * Expects: { text: "I had a turkey sandwich with lettuce and cheese." }
 * 
 * ONLY this route has been added/adjusted.
 */
router.post("/macros-from-text", async (req, res) => {
    console.log("🔥 API HIT: /macros-from-text");
    console.log("Received Request Body:", req.body);

    const { text } = req.body;

    if (!text) {
        console.log("❌ Error: Missing text input");
        return res.status(400).json({ error: "Text input is required" });
    }

    console.log("✅ Received text for macros calculation:", text);

    try {
        console.log("🚀 Sending request to OpenAI...");

        const data = {
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: `
                        You are a nutrition assistant.
                        Extract the individual food items from the given meal description, along with their respective calorie and macronutrient breakdowns.
                        Always return a **JSON array** where each item is a separate food with its name, calories, protein, carbs, and fats.
                    `,
                },
                {
                    role: "user",
                    content: `Meal description: "${text}"`,
                },
            ],
            functions: [
                {
                    name: "extractMacros",
                    description: "Extract individual food items with their macronutrient breakdown.",
                    parameters: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                name: { type: "string", description: "The name of the food item" },
                                calories: { type: "number", description: "Total calorie count" },
                                macros: {
                                    type: "object",
                                    properties: {
                                        protein: { type: "number", description: "Protein in grams" },
                                        carbs: { type: "number", description: "Carbs in grams" },
                                        fats: { type: "number", description: "Fats in grams" },
                                    },
                                    required: ["protein", "carbs", "fats"],
                                },
                            },
                            required: ["name", "calories", "macros"],
                        },
                    },
                },
            ],
            function_call: { name: "extractMacros" }, // Ensures GPT returns an array
        };
        
        const gptResponse = await openai.chat.completions.create(data);
        console.log("🎯 OpenAI Response:", gptResponse);
        
        // Extract the structured function response
        const functionCallArguments = gptResponse.choices[0]?.message?.function_call?.arguments;
        
        if (!functionCallArguments) {
            console.log("❌ OpenAI returned no valid JSON.");
            return res.status(500).json({ error: "OpenAI failed to return structured data." });
        }
        
        const macroData = JSON.parse(functionCallArguments);
        console.log("📦 Parsed response:", macroData);
        res.json(macroData);
        
    } catch (error) {
        console.error("🔥 Error in OpenAI API call:", error.message || error);
        res.status(500).json({ error: "Failed to process macros." });
    }
});


router.get("/test-route", (req, res) => {
  console.log("🔥 HIT /test-route in macroRoutes.js");
  res.json({ test: "OK" });
});


export default router;