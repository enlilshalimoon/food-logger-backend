import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import cors from "cors";
import visionRoutes from "./routes/visionRoutes.js";

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

// Use vision routes for all `/api` endpoints
app.use("/api", visionRoutes);

// Root route for testing server
app.get("/", (req, res) => {
    res.send("Food Logger Backend Running!");
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});