import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import cors from "cors";
import visionRoutes from "./routes/visionRoutes.js";
import macroRoutes from "./routes/macroRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, ".env") });

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Mount vision routes
app.use("/api", visionRoutes);

// Mount macro routes
app.use("/api", macroRoutes);

app.get("/", (req, res) => {
    res.send("Food Logger Backend Running!");
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});