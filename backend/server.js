import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { connectDB } from './DB/connectDB.js';
import userLogRoutes from './Routes/UserLogRoutes.js';
import taskCornerRoutes from './Routes/TaskCornerRoutes.js';

import ongoingTaskRoutes from './Routes/OngoingTaskRoutes.js';

import simulateAdminRoutes from './Routes/SimulateAdminRoutes.js';
import timetableRoutes from './Routes/TimetableRoutes.js';
import timetableAssignmentRoutes from './Routes/timetableAssignmentRoutes.js';


dotenv.config();

const app = express();

// Connect to MongoDB
connectDB().catch(err => {
  console.error('Failed to connect to MongoDB:', err);
  process.exit(1);
});

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/user', userLogRoutes);
app.use('/api/tasks', taskCornerRoutes);

app.use('/api/ongoing-tasks', ongoingTaskRoutes);
app.use('/api/simulate', simulateAdminRoutes);
app.use('/api/timetable', timetableRoutes);
app.use('/api/timetable-assignments', timetableAssignmentRoutes);


// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 