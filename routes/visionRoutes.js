import express from "express";
import { gpt4oVisionAPI } from "../visionAPI.js"; // Correct path to visionAPI.js

const router = express.Router();

router.post("/vision", async (req, res) => {
    try {
        const { foodDescription } = req.body;
        console.log("Received food description:", foodDescription);

        if (!foodDescription) {
            return res.status(400).json({ error: "Missing food description." });
        }

        const result = await gpt4oVisionAPI(foodDescription);
        console.log("GPT Analysis Result:", result);

        res.json({ analysis: result });
    } catch (error) {
        console.error("Error in Vision Route:", error.message);
        res.status(500).json({ error: "Failed to process the food description." });
    }
});

export default router;