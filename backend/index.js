import express from "express";
import { connectDB } from "./DB/connectDB.js"; 
import dotenv from "dotenv";
import cors from "cors";
import adminRouter from "./Routes/AdminRoutes.js"; 
import analysisRouter from "./Routes/AnalyticsRoutes.js"; 

dotenv.config(); // Load environment variables

const app = express();   
const PORT = 5000;

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// function calling for database connection
connectDB();

// Mounting routes
app.use("/api/admin", adminRouter); // Keep existing admin routes (prefix adjusted)
app.use("/api/analysis", analysisRouter); // Mount analysis routes

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});