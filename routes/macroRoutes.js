/**
 * macroRoutes.js
 * 
 * A route that calculates macros using a specialized "gpt-4o-mini" model
 * via the default 'openai' export. This matches your local setup.
 */

import express from "express";
import OpenAI from "openai";

const router = express.Router();

/**
 * Initialize OpenAI with your API key.
 * Ensure your environment has OPENAI_API_KEY.
 */
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * POST /api/calculate-macros
 * Expects: { responses: [...] }
 * 
 * Calls the "gpt-4o-mini" model with an instruction to return macros in strict JSON.
 */
router.post("/calculate-macros", async (req, res) => {
  const { responses } = req.body;

  // Validate input
  if (!responses) {
    return res.status(400).json({ error: "Responses are required" });
  }

  // Create the structured prompt to guide GPT
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
    /**
     * Using the "gpt-4o-mini" model, along with the functions approach.
     * If your custom model or environment requires slightly different
     * parameters, adjust as needed.
     */
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
      // Example function definition to ensure GPT returns JSON in the shape you want
      functions: [
        {
          name: "calculateMacros",
          description: "Calculate calorie needs and macronutrients",
          parameters: {
            type: "object",
            properties: {
              calories: {
                type: "number",
                description: "The calculated daily calorie needs",
              },
              macros: {
                type: "object",
                properties: {
                  protein: {
                    type: "number",
                    description: "Grams of protein per day",
                  },
                  carbs: {
                    type: "number",
                    description: "Grams of carbs per day",
                  },
                  fats: {
                    type: "number",
                    description: "Grams of fats per day",
                  },
                },
                required: ["protein", "carbs", "fats"],
              },
            },
            required: ["calories", "macros"],
          },
        },
      ],
      // Tells GPT to call the "calculateMacros" function
      function_call: { name: "calculateMacros" },
    };

    router.post("/macros-from-text", async (req, res) => {
        const { text } = req.body;
    
        // Validate input
        if (!text) {
            return res.status(400).json({ error: "Text input is required" });
        }
    
        console.log("Received text for macros calculation:", text);
    
        try {
            // Create prompt for GPT
            const prompt = `
                Analyze the following meal description and calculate its calories and macronutrients (protein, carbs, fats):
                "${text}"
                
                Respond strictly in JSON format:
                {
                    "calories": "calculated calories",
                    "macros": {
                        "protein": "grams of protein",
                        "carbs": "grams of carbs",
                        "fats": "grams of fats"
                    }
                }
            `;
    
            console.log("Prompt sent to GPT:", prompt);
    
            // Call GPT using OpenAI API
            const data = {
                model: "gpt-4", // Replace with the correct model name (e.g., "gpt-4", "gpt-4o-mini")
                messages: [
                    { role: "system", content: "You are a nutrition assistant." },
                    { role: "user", content: prompt },
                ],
            };
    
            const gptResponse = await openai.chat.completions.create(data);
    
            console.log("GPT Response:", gptResponse);
    
            // Extract JSON from GPT's response
            const functionCallArguments = gptResponse.choices[0]?.message?.function_call?.arguments;
    
            if (!functionCallArguments) {
                console.error("GPT failed to return valid JSON.");
                return res.status(500).json({ error: "GPT failed to process the request." });
            }
    
            // Parse the JSON string into an object
            const macroData = JSON.parse(functionCallArguments);
    
            // Respond with the calculated macros
            res.json(macroData);
        } catch (error) {
            console.error("Error during GPT API call:", error.message || error);
    
            // Send error response to client
            res.status(500).json({ error: "Failed to process macros." });
        }
    });



    // Call your specialized GPT model
    const gptResponse = await openai.chat.completions.create(data);

    console.log("GPT-4o-mini Response:", gptResponse);

    /**
     * GPT should return an object with function_call arguments:
     * e.g. gptResponse.choices[0].message.function_call.arguments = '{"calories": 2200, "macros": {...}}'
     */
    const functionCallArguments = gptResponse.choices[0]?.message?.function_call?.arguments;

    if (!functionCallArguments) {
      throw new Error("No valid JSON response from GPT-4o-mini.");
    }

    // Parse the JSON string into an object
    const macroData = JSON.parse(functionCallArguments);

    // Send back the macros data
    res.json(macroData);
  } catch (error) {
    console.error("Error calculating macros:", error?.message || error.response?.data);
    res.status(500).json({ error: "Failed to calculate macros. Try again." });
  }
});

export default router;