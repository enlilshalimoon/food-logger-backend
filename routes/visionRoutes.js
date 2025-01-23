import express from "express";
import multer from "multer";
import { gpt4oVisionAPI } from "../visionAPI.js";

const upload = multer();
const router = express.Router();

router.post("/vision", upload.single("photo"), async (req, res) => {
    try {
        const file = req.file;

        if (!file) {
            return res.status(400).json({ error: "No photo uploaded." });
        }

        // Convert image buffer to Base64
        const base64Image = file.buffer.toString("base64");

        // Send Base64 image to GPT-4o Vision API
        const analysis = await gpt4oVisionAPI(base64Image);
        res.json({ analysis });
    } catch (error) {
        console.error("Error in Vision Route:", error.message);
        res.status(500).json({ error: "Failed to process the image." });
    }
});

export default router;