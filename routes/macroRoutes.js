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
                Analyze the given food description and split it into individual food items.
                For each item, return its estimated calories and macronutrients.
                Always respond as a JSON array where each item has:
                {
                    "name": "food item name",
                    "calories": 0,
                    "macros": {
                        "protein": 0,
                        "carbs": 0,
                        "fats": 0
                    }
                }
            `,
        },
        {
            role: "user",
            content: `Food description: "${text}"`,
        },
    ],
    functions: [
      {
          name: "extractMacros",
          description: "Extract calories and macronutrient breakdown for each food item.",
          parameters: {
              type: "object",
              properties: {
                  items: {  // ✅ Return an OBJECT with an array inside
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
              required: ["items"],  // ✅ Ensures it returns the array inside an object
          },
      },
  ],
    function_call: { name: "extractMacros" },
};
        
        const gptResponse = await openai.chat.completions.create(data);
        console.log("🎯 OpenAI Response:", gptResponse);
        
        // Extract the structured function response
        const functionCallArguments = gptResponse.choices[0]?.message?.function_call?.arguments;

        let macroData;
        try {
            macroData = JSON.parse(functionCallArguments);
            if (!macroData.items || !Array.isArray(macroData.items)) {
                throw new Error("Expected 'items' array but got something else.");
            }
        } catch (error) {
            console.error("🔥 Error parsing OpenAI response:", error);
            return res.status(500).json({ error: "Failed to parse response." });
        }
        
        console.log("📦 Parsed response:", macroData.items);
        res.json(macroData.items);
        
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