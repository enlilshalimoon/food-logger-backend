import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import cors from "cors";

// Recreate __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Explicitly load .env
dotenv.config({ path: path.resolve(__dirname, ".env") });

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Vision routes (if still required)
import visionRoutes from "./routes/visionRoutes.js";
app.use("/api", visionRoutes);

// Define `/api/macros-from-text` route directly here
app.post("/api/macros-from-text", (req, res) => {
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

// Root route for testing server
app.get("/", (req, res) => {
    res.send("Food Logger Backend Running!");
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});