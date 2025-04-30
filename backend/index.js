import express from "express";
import { connectDB } from "./DB/connectDB.js"; // Import the connectDB function
import dotenv from "dotenv";
import cors from "cors";
import userRoutes from "./Routes/UserLogRoutes.js";
import taskRoutes from "./Routes/TaskCornerRoutes.js";

dotenv.config(); // Load environment variables

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// function calling for database connection
connectDB();

// Routes
app.use("/api/user", userRoutes);
app.use("/api/tasks", taskRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});