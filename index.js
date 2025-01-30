import dotenv from "dotenv";
dotenv.config();

console.log("DEBUG Key from index.js:", process.env.OPENAI_API_KEY);

// ...rest of the code

import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import cors from "cors";
import macroRoutes from "./routes/macroRoutes.js";
import visionRoutes from "./routes/visionRoutes.js";

console.log(">>> Index.js is starting <<<");
console.log("DEBUG Key from index.js:", process.env.OPENAI_API_KEY); // Should print the key

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use("/api", visionRoutes);
app.use("/api", macroRoutes);

app.get("/", (req, res) => {
    res.send("Food Logger Backend Running!");
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
