import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from 'cookie-parser';
import { connectDB } from './DB/connectDB.js';
import userLogRoutes from './Routes/UserLogRoutes.js';
import taskCornerRoutes from './Routes/TaskCornerRoutes.js';
import ongoingTaskRoutes from './Routes/OngoingTaskRoutes.js';
import simulateAdminRoutes from './Routes/SimulateAdminRoutes.js';
import timetableRoutes from './Routes/TimetableRoutes.js';
import timetableAssignmentRoutes from './Routes/timetableAssignmentRoutes.js';
import attendanceRoutes from './Routes/AttendanceRoutes.js';
import reminderRoutes from './Routes/reminderRoutes.js';
import adminRouter from "./Routes/AdminRoutes.js";
import analysisRouter from "./Routes/AnalyticsRoutes.js"; 

dotenv.config(); // Load environment variables

const app = express();   
const PORT = 5000;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(cookieParser()); // Parse cookies

// function calling for database connection
connectDB();

// Mounting routes
app.use("/api/admin", adminRouter); // Keep existing admin routes (prefix adjusted)
app.use("/api/analysis", analysisRouter); // Mount analysis routes

app.use('/api/user', userLogRoutes);
app.use('/api/tasks', taskCornerRoutes);

app.use('/api/ongoing-tasks', ongoingTaskRoutes);
app.use('/api/simulate', simulateAdminRoutes);
app.use('/api/timetable', timetableRoutes);
app.use('/api/timetable-assignments', timetableAssignmentRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/reminders', reminderRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
  });

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
