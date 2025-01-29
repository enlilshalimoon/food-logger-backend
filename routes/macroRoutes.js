import express from "express";
import OpenAI from "openai";

const router = express.Router();

// Initialize OpenAI with your API key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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
    const { text } = req.body;
  
    // Validate input
    if (!text) {
      return res.status(400).json({ error: "Text input is required" });
    }
  
    console.log("Received text for macros calculation:", text);
  
    // Prompt to send to GPT
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
  
    try {
      const data = {
        model: "gpt-4", // Replace with "gpt-4o-mini" if needed
        messages: [
          { role: "system", content: "You are a nutrition assistant." },
          { role: "user", content: prompt },
        ],
        functions: [
          {
            name: "calculateMacros",
            description: "Calculate meal macros from a description",
            parameters: {
              type: "object",
              properties: {
                calories: { type: "number", description: "Calories for the meal" },
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
        function_call: { name: "calculateMacros" }, // Enforce the function call
      };
  
      console.log("Sending to OpenAI:", JSON.stringify(data, null, 2));
  
      // Call OpenAI API
      const gptResponse = await openai.chat.completions.create(data);
  
      console.log("GPT Response:", JSON.stringify(gptResponse, null, 2));
  
      // Extract function call arguments
      const functionCallArguments = gptResponse.choices[0]?.message?.function_call?.arguments;
  
      if (!functionCallArguments) {
        console.error("No valid JSON returned by GPT.");
        return res.status(500).json({ error: "GPT failed to process the request." });
      }
  
      const macroData = JSON.parse(functionCallArguments);
  
      console.log("Parsed macro data:", macroData);
  
      res.json(macroData);
    } catch (error) {
      console.error("Error in macros-from-text:", error.message || error);
      res.status(500).json({ error: "Failed to process macros from text." });
    }
  });

export default router;