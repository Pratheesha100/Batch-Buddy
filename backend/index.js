import express from "express";
import { connectDB } from "./DB/connectDB.js"; // Import the connectDB function
import dotenv from "dotenv";
import cors from "cors";

dotenv.config(); // Load environment variables

const app = express();   
const PORT = 5000;

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// function calling for database connection
connectDB();

// Sample route
app.get("/", (req, res) => {
    res.send("Hello, Node.js is working!");
});

// Start the server
app.listen(PORT, () => {
    console.log("Server is running on http://localhost:${PORT}");
});