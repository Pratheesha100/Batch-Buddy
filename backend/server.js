const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Create HTTP server at the top-level
const server = http.createServer(app);

// Set port dynamically or default to 5000
const PORT = process.env.PORT || 5000;

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
  family: 4,
}).then(() => {
  console.log('Connected to MongoDB');

  // --- SOCKET.IO SETUP ---
  const io = new Server(server, {
    cors: {
      origin: '*', // Adjust for your frontend
      methods: ['GET', 'POST']
    },
    pingTimeout: 60000,
  });

  global.io = io;

  // Emit reminder updates and notifications
  io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('disconnect', () => {
      console.log('A user disconnected:', socket.id);
    });

    socket.on('activeReminder', (reminder) => {
      console.log('Active reminder received:', reminder);
      // Broadcast the reminder to all connected clients
      io.emit('reminderDue', reminder);
    });
  });

  // --- BACKGROUND JOB FOR REMINDER DUE ---
  const Reminder = require('./models/Reminder');

  setInterval(async () => {
    try {
      const now = new Date();
      const reminders = await Reminder.find({ status: 'pending' });

      for (const reminder of reminders) {
        if (!reminder.date || !reminder.time) {
          console.log('Skipping reminder due to missing date or time:', reminder.title);
          continue;
        }

        const reminderDate = new Date(reminder.date);
        const [hours, minutes] = reminder.time.split(':');
        if (isNaN(hours) || isNaN(minutes)) {
          console.log('Skipping reminder due to invalid time format:', reminder.title);
          continue;
        }
        reminderDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

        // Compare time in milliseconds for more precise matching
        const timeDiff = Math.abs(reminderDate.getTime() - now.getTime());
        
        // If reminder is due (within 10 seconds of target time)
        if (timeDiff <= 10000 && reminder.status === 'pending') {
          console.log('Emitting reminder due:', reminder.title);
          
          // Update status first
          reminder.status = 'completed';
          await reminder.save();
          
          // Emit the event with all necessary data
          io.emit('reminderDue', {
            _id: reminder._id,
            title: reminder.title,
            description: reminder.description,
            time: reminder.time,
            date: reminder.date,
            category: reminder.category,
            priority: reminder.priority,
            status: 'completed',
            notificationTypes: reminder.notificationTypes
          });
        }
      }
    } catch (err) {
      console.error('Error in reminder due check:', err);
    }
  }, 5000); // Check every 5 seconds for more precise timing

}).catch((error) => {
  console.error('MongoDB connection error:', error);
});

// Routes
const reminderRoutes = require('./routes/reminders');
const notificationRoutes = require('./routes/notificationRoutes');
app.use('/api/reminders', reminderRoutes);
// Add notification routes
app.use('/api/notifications', notificationRoutes);

// Serve the HTML file (optional, you can serve a front-end here)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`Port ${PORT} is in use, trying another port...`);
    server.listen(0); // 0 means "choose an available port"
  } else {
    console.error('Server error:', err);
  }
});
