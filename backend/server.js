import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from 'cookie-parser';
import { createServer } from 'http';
import { Server } from 'socket.io';
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
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:5174'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }
});

// Make io available globally
global.io = io;

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

// Import models for scheduled tasks
import Reminder from './Models/reminderModel.js';

// Socket.io connection setup
io.on('connection', (socket) => {
  console.log('🔵 Client connected:', socket.id);
  
  // Handle user ID from query params (if available)
  if (socket.handshake.query && socket.handshake.query.userId) {
    const userId = socket.handshake.query.userId;
    socket.join(`user-${userId}`);
    socket.userId = userId; // Store on socket object for later use
    console.log(`🔷 Auto-joined socket ${socket.id} to room: user-${userId} (from query params)`);
  }
  
  socket.on('disconnect', () => {
    console.log('🔴 Client disconnected:', socket.id, socket.userId ? `(user: ${socket.userId})` : '');
  });
  
  // Allow client to join a user-specific room
  socket.on('join-user-room', (userId) => {
    if (userId) {
      // Leave any previous user rooms first (to prevent duplicates)
      if (socket.userId && socket.userId !== userId) {
        socket.leave(`user-${socket.userId}`);
        console.log(`🔶 Socket ${socket.id} left room: user-${socket.userId}`);
      }
      
      socket.join(`user-${userId}`);
      socket.userId = userId; // Store on socket object for later use
      console.log(`🟢 Socket ${socket.id} joined room: user-${userId}`);
      
      // Send a test notification to confirm connection
      socket.emit('socket-connected', { 
        message: 'Connected to reminder notification service',
        userId: userId
      });
    }
  });
  
  // Debug endpoint to list all rooms
  socket.on('list-rooms', () => {
    const rooms = io.sockets.adapter.rooms;
    const roomList = [];
    
    for (const [key, value] of rooms.entries()) {
      // Only include user rooms, not socket ID rooms
      if (key.startsWith('user-')) {
        roomList.push({
          room: key,
          clients: Array.from(value).length
        });
      }
    }
    
    console.log('Room list:', roomList);
    socket.emit('room-list', roomList);
  });
  
  // Debug endpoint to send a test notification
  socket.on('test-notification', (data) => {
    if (socket.userId) {
      console.log(`🔔 Sending test notification to user-${socket.userId}`);
      io.to(`user-${socket.userId}`).emit('reminder-due', {
        id: 'test-reminder-' + Date.now(),
        title: 'Test Reminder',
        description: 'This is a test reminder notification',
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString(),
        priority: 'medium'
      });
    } else {
      console.log('❌ Cannot send test notification - no userId associated with socket');
      socket.emit('error', { message: 'No user ID associated with your connection' });
    }
  });
});

// Scheduled task to check for due reminders
const checkDueReminders = async () => {
  try {
    console.log('Checking for due reminders...');
    const now = new Date();
    // For debugging, show current time
    console.log(`Current time: ${now.toLocaleString()}`);

    // For simpler date comparison, use timestamp approach
    const currentTimestamp = now.getTime();
    
    // Find all unnotified/uncompleted reminders
    const pendingReminders = await Reminder.find({
      notified: false,
      completed: false
    });
    
    console.log(`Found ${pendingReminders.length} pending reminders total`);
    
    // Client-side processing of reminders
    const dueReminders = [];
    
    for (const reminder of pendingReminders) {
      try {
        // Get reminder date and convert to Date object
        const reminderDate = new Date(reminder.date);
        
        // If reminder has time property, set the hours and minutes
        if (reminder.time) {
          const [hours, minutes] = reminder.time.split(':').map(Number);
          reminderDate.setHours(hours, minutes, 0, 0);
        }
        
        const reminderTimestamp = reminderDate.getTime();
        
        // For debugging, log the comparison
        console.log(`Reminder: ${reminder.title}, Due: ${reminderDate.toLocaleString()}, Current: ${now.toLocaleString()}`);
        console.log(`Comparing timestamps: ${reminderTimestamp} <= ${currentTimestamp}`);
        
        // Check if reminder is due or past due
        if (reminderTimestamp <= currentTimestamp) {
          console.log(`Reminder due: ${reminder.title}`);
          dueReminders.push(reminder);
        }
      } catch (err) {
        console.error(`Error processing reminder ${reminder._id}:`, err);
      }
    }
    

    // Process due reminders
    if (dueReminders.length > 0) {
      console.log(`Found ${dueReminders.length} due reminders, sending notifications...`);
      
      for (const reminder of dueReminders) {
        // Format date and time for display
        const date = new Date(reminder.date);
        const formattedDate = date.toLocaleDateString();
        const formattedTime = reminder.time || 'No specific time';

        // Create notification payload
        const notificationPayload = {
          id: reminder._id,
          title: reminder.title,
          description: reminder.description || '',
          date: formattedDate,
          time: formattedTime,
          priority: reminder.priority,
          actions: [
            { action: 'complete', title: 'Complete' },
            { action: 'snooze', title: 'Snooze 15 min' }
          ]
        };

        // Emit to the user's room
        io.to(`user-${reminder.user}`).emit('reminder-due', notificationPayload);
        console.log(`Emitted reminder-due event to user-${reminder.user} for reminder: ${reminder.title}`);
        
        // Mark as notified AND completed
        reminder.notified = true;
        reminder.completed = true; // Auto-complete when due time is reached
        await reminder.save();
        console.log(`Marked reminder ${reminder._id} as notified and completed`);
      }
    } else {
      console.log('No due reminders found');
    }
  } catch (error) {
    console.error('Error checking due reminders:', error);
  }
};

// Run the check immediately
checkDueReminders();

// Schedule periodic check (every 30 seconds)
setInterval(checkDueReminders, 30000);

// Start the server with WebSocket support
httpServer.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
