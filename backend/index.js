import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './DB/connectDB.js';
import userRoutes from './Routes/UserLogRoutes.js';
import taskRoutes from './Routes/TaskCornerRoutes.js';

dotenv.config();

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/user', userRoutes);
app.use('/api/tasks', taskRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});