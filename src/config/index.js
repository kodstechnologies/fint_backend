// import dotenv from 'dotenv';
// dotenv.config();

// const {
//     MONGODB_URI,
//     DB_NAME,
//     PORT,
//     CORS_ORIGIN,
//     ACCESS_TOKEN_SECRET,
//     ACCESS_TOKEN_EXPIRY,
//     REFRESH_TOKEN_SECRET,
//     REFRESH_TOKEN_EXPIRY,
//     OPENAI_API_KEY
// } = process.env;

// export {
//     MONGODB_URI,
//     DB_NAME,
//     PORT,
//     CORS_ORIGIN,
//     ACCESS_TOKEN_SECRET,
//     ACCESS_TOKEN_EXPIRY,
//     REFRESH_TOKEN_SECRET,
//     REFRESH_TOKEN_EXPIRY,
//     OPENAI_API_KEY
// };

// config/config.js

// ==========
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Resolve __dirname (not available in ESM by default)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env file from project root
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

// Destructure env variables with defaults
const {
    MONGO_URI,
    DB_NAME,
    PORT = 5000,
    CORS_ORIGIN = "*",
    ACCESS_TOKEN_SECRET,
    ACCESS_TOKEN_EXPIRY = "1d",
    REFRESH_TOKEN_SECRET,
    REFRESH_TOKEN_EXPIRY = "7d",
    OPENAI_API_KEY,
    SENDER_ID,
    TEMPLATE_ID
} = process.env;

// Export as config object
export default {
    MONGO_URI,
    DB_NAME,
    PORT,
    CORS_ORIGIN,
    ACCESS_TOKEN_SECRET,
    ACCESS_TOKEN_EXPIRY,
    REFRESH_TOKEN_SECRET,
    REFRESH_TOKEN_EXPIRY,
    OPENAI_API_KEY,
    SENDER_ID,
    TEMPLATE_ID
};
