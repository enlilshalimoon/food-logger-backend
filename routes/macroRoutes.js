/**
 * macroRoutes.js
 *
 * Routes to calculate macros using GPT models.
 */

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
 * Calculates daily calorie needs and macronutrients based on user responses.
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
    };

    // Call GPT
    const gptResponse = await openai.chat.completions.create(data);

    console.log("GPT-4o-mini Response:", gptResponse);

    const functionCallArguments = gptResponse.choices[0]?.message?.function_call?.arguments;

    if (!functionCallArguments) {
      throw new Error("No valid JSON response from GPT-4o-mini.");
    }

    const macroData = JSON.parse(functionCallArguments);

    // Send the calculated macros back
    res.json(macroData);
  } catch (error) {
    console.error("Error calculating macros:", error.message || error.response?.data);
    res.status(500).json({ error: "Failed to calculate macros. Try again." });
  }
});

/**
 * POST /api/macros-from-text
 * Expects: { text: "I had a sandwich with cheese" }
 * Calculates macros for a specific meal described in natural language.
 */
router.post("/macros-from-text", async (req, res) => {
  const { text } = req.body;

  // Validate input
  if (!text) {
    return res.status(400).json({ error: "Text input is required" });
  }

  console.log("Received text for macros calculation:", text);

  try {
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

    const data = {
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a nutrition assistant." },
        { role: "user", content: prompt },
      ],
    };

    // Call GPT
    const gptResponse = await openai.chat.completions.create(data);

    console.log("GPT Response:", gptResponse);

    const functionCallArguments = gptResponse.choices[0]?.message?.function_call?.arguments;

    if (!functionCallArguments) {
      throw new Error("GPT failed to return valid JSON.");
    }

    const macroData = JSON.parse(functionCallArguments);

    // Send the calculated macros back
    res.json(macroData);
  } catch (error) {
    console.error("Error processing macros:", error.message || error);
    res.status(500).json({ error: "Failed to process macros." });
  }
});

export default router;