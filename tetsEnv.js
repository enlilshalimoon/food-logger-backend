import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Recreate __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env
console.log("Loading .env from:", path.resolve(__dirname, ".env"));
dotenv.config({ path: path.resolve(__dirname, ".env") });

// Print API Key
console.log("Loaded API Key:", process.env.OPENAI_API_KEY);