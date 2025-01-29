import express from "express";
import multer from "multer";
import { Storage } from "@google-cloud/storage";
import { gpt4oVisionAPI } from "../visionAPI.js";

const router = express.Router();
const upload = multer();

// GCP Storage setup
const storage = new Storage();
const bucketName = "food-logger-storage";

// Vision Route for processing photos
router.post("/vision", upload.single("photo"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No photo uploaded." });
        }

        console.log("Received file:", req.file);

        // Generate unique filename for the upload
        const fileName = `uploads/${Date.now()}-${req.file.originalname}`;

        // Upload the file to GCP
        const bucket = storage.bucket(bucketName);
        const file = bucket.file(fileName);

        await file.save(req.file.buffer, {
            contentType: req.file.mimetype,
            public: true, // Make the file publicly accessible
        });

        // Construct the public URL for the uploaded file
        const imageUrl = `https://storage.googleapis.com/${bucketName}/${fileName}`;
        console.log("File uploaded to GCP:", imageUrl);

        // Call OpenAI Vision API with the GCP image URL
        const result = await gpt4oVisionAPI(imageUrl);
        console.log("OpenAI Vision API result:", result);

        // Respond with the result from the OpenAI Vision API
        res.json(result);
    } catch (error) {
        console.error("Error in Vision Route:", error.message);
        res.status(500).json({ error: "Failed to process the photo." });
    }
});

// Macros-from-text Route
router.post("/macros-from-text", (req, res) => {
    const { text } = req.body;

    if (!text) {
        return res.status(400).json({ error: "Text input is required" });
    }

    console.log("Received text for macros calculation:", text);

    // Example response
    res.json({
        name: "Example Food",
        calories: 300,
        macros: {
            protein: 20,
            carbs: 40,
            fats: 10,
        },
    });
});

export default router;