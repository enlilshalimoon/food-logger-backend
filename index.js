import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Recreate __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Explicitly load .env
dotenv.config({ path: path.resolve(__dirname, ".env") });

// Log environment variables after loading .env

import express from "express";
import cors from "cors";
import visionRoutes from "./routes/visionRoutes.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Add the vision route
app.use("/api", visionRoutes);

app.get("/", (req, res) => {
    res.send("Food Logger Backend Running!");
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});