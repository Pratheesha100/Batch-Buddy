import express from 'express';
import NewAttendance from '../Models/AttendanceModel.js';
import auth from '../Middleware/auth.js';

const router = express.Router();

// Submit attendance
router.post('/submit', auth, async (req, res) => {
  try {
    const { date, records } = req.body;
    const studentId = req.user._id;

    // Check if attendance already exists for this date
    const existingAttendance = await NewAttendance.findOne({
      studentId,
      date: new Date(date)
    });

    if (existingAttendance) {
      // Update existing attendance
      existingAttendance.records = records;
      await existingAttendance.save();
      return res.status(200).json({
        message: 'Attendance updated successfully',
        attendance: existingAttendance
      });
    }

    // Create new attendance record
    const attendance = new NewAttendance({
      studentId,
      date: new Date(date),
      records
    });

    await attendance.save();
    res.status(201).json({
      message: 'Attendance submitted successfully',
      attendance
    });
  } catch (error) {
    console.error('Error submitting attendance:', error);
    res.status(500).json({ message: 'Error submitting attendance', error: error.message });
  }
});

// Get attendance for a student
router.get('/student/:studentId', auth, async (req, res) => {
  try {
    const { studentId } = req.params;
    const { startDate, endDate } = req.query;

    const query = { studentId };
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const attendance = await NewAttendance.find(query)
      .sort({ date: -1 });

    res.status(200).json(attendance);
  } catch (error) {
    console.error('Error fetching attendance:', error);
    res.status(500).json({ message: 'Error fetching attendance', error: error.message });
  }
});

// Get attendance analytics for a student
router.get('/analytics/:studentId', auth, async (req, res) => {
  try {
    const { studentId } = req.params;
    const attendance = await NewAttendance.find({ studentId });

    // Calculate analytics
    let totalClasses = 0;
    let absentCount = 0;
    let presentCount = 0;
    let totalHours = 0;
    const subjectWise = {};
    const typeWise = {
      Lecture: { present: 0, absent: 0 },
      Lab: { present: 0, absent: 0 },
      Tutorial: { present: 0, absent: 0 }
    };

    attendance.forEach(record => {
      record.records.forEach(subject => {
        totalClasses++;
        if (!subjectWise[subject.subject]) {
          subjectWise[subject.subject] = { present: 0, absent: 0 };
        }
        subjectWise[subject.subject][subject.status]++;
        typeWise[subject.type][subject.status]++;
        if (subject.status === 'present') {
          presentCount++;
          // Calculate hours for present classes only
          if (subject.time) {
            // subject.time is in format "HH:mm - HH:mm" or "H:mm - H:mm"
            const [start, end] = subject.time.split(' - ');
            if (start && end) {
              const [startH, startM] = start.split(':').map(Number);
              const [endH, endM] = end.split(':').map(Number);
              let startMinutes = startH * 60 + startM;
              let endMinutes = endH * 60 + endM;
              // Handle overnight classes (end time < start time)
              if (endMinutes < startMinutes) endMinutes += 24 * 60;
              const duration = (endMinutes - startMinutes) / 60;
              if (!isNaN(duration) && duration > 0) {
                totalHours += duration;
              }
            }
          }
        }
        if (subject.status === 'absent') absentCount++;
      });
    });

    // Calculate attendance rate as per user request
    let attendanceRate = 0;
    if (totalClasses > 0) {
      attendanceRate = ((totalClasses - absentCount) / totalClasses) * 100;
      attendanceRate = Math.round(attendanceRate * 100) / 100; // round to 2 decimals
    }

    totalHours = Math.round(totalHours * 100) / 100; // round to 2 decimals

    res.status(200).json({
      totalClasses,
      presentCount,
      absentCount,
      attendanceRate,
      totalHours,
      subjectWise,
      typeWise
    });
  } catch (error) {
    console.error('Error fetching attendance analytics:', error);
    res.status(500).json({ message: 'Error fetching attendance analytics', error: error.message });
  }
});

// Route to get all attendance records for a student
router.get('/all/:studentId', async (req, res) => {
  try {
    const records = await NewAttendance.find({ studentId: req.params.studentId }).sort({ date: -1 });
    res.json(records);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch attendance records' });
  }
});

export default router; 