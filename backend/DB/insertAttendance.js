import mongoose from 'mongoose';
import moment from 'moment';
import Students from '../Models/Students.js';
import StudentGroup from '../Models/StudentGroups.js';
import Timetables from '../Models/Timetables.js';
import Attendance from '../Models/Attendance.js';

// Connect to MongoDB
mongoose.connect('mongodb+srv://myAtlasDBUser:batchbuddy123@batch-buddy.ei7he.mongodb.net/?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// Helper: Get the most recent past date for a given weekday (e.g., "Monday")
function getPreviousDateForWeekday(weekday) {
  const daysOfWeek = {
    "Sunday": 0,
    "Monday": 1,
    "Tuesday": 2,
    "Wednesday": 3,
    "Thursday": 4,
    "Friday": 5,
    "Saturday": 6,
  };
  const today = moment();
  const targetDay = daysOfWeek[weekday];
  let date = today.clone().day(targetDay);

  // If the calculated date is today or in the future for the current week, get the previous week's date
  if (date.isSameOrAfter(today, 'day')) {
    date.subtract(1, 'weeks');
  }
  return date.toDate();
}

async function insertAttendanceRecords() {
  try {
    // Get all students
    const students = await Students.find();
    console.log(`Found ${students.length} students.`);

    let attendanceRecords = [];

    for (const student of students) {
      // Find the group for this student
      const studentGroup = await StudentGroup.findOne({ studentId: student._id });
      console.log(`Student ${student.studentId}: Found StudentGroup: ${studentGroup ? studentGroup._id : 'None'}`);

      if (!studentGroup) continue;

      const groupNum = studentGroup.groupNum;
      if (!groupNum) {
          console.log(`Student ${student.studentId}: StudentGroup ${studentGroup._id} has no groupNum.`);
          continue;
      }

      // Find all timetables for this group
      console.log(`Student ${student.studentId}: Looking for timetables for Group ID: ${groupNum}`);
      const timetables = await Timetables.find({ group: groupNum });
      console.log(`Student ${student.studentId}: Found ${timetables.length} timetables for Group ID: ${groupNum}`);

      for (const timetable of timetables) {
        // Get the most recent past date for the timetable's day
        const date = getPreviousDateForWeekday(timetable.day);

        // Subtract a random number of weeks (0, 1, or 2) from the date for variation
        const randomWeeksToSubtract = Math.floor(Math.random() * 3);
        const finalDate = moment(date).subtract(randomWeeksToSubtract, 'weeks').toDate();

        // Randomly assign more 'Absent' than 'Present'
        // (e.g., 70% Absent, 30% Present)
        const status = Math.random() < 0.6 ? 'Absent' : 'Present';

        attendanceRecords.push({
          student: student._id,
          timetable: timetable._id,
          status,
          date: finalDate, // Use the modified date
        });
      }
    }

    console.log(`Total attendance records generated: ${attendanceRecords.length}`);

    if (attendanceRecords.length > 0) {
      await Attendance.insertMany(attendanceRecords);
      console.log(`Attendance records inserted: ${attendanceRecords.length}`);
    } else {
      console.log('No attendance records to insert.');
    }
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

insertAttendanceRecords();
