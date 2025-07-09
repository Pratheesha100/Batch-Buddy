import mongoose from 'mongoose';
import Student from '../Models/Students.js';
import StudentGroup from '../Models/StudentGroups.js';



await mongoose.connect('mongodb+srv://myAtlasDBUser:batchbuddy123@batch-buddy.ei7he.mongodb.net/?retryWrites=true&w=majority');

const groupIds = [
  "67f5455e5482b8effbe9287a", "67f5455e5482b8effbe9287b", "67f5455e5482b8effbe9287c",
  "67f5455e5482b8effbe9287d", "67f5455e5482b8effbe9287e", "67f5455e5482b8effbe9287f",
  "67f5455e5482b8effbe92880", "67f5455e5482b8effbe92881", "67f5455e5482b8effbe92882",
  "67f5455e5482b8effbe92883", "67f5455e5482b8effbe92884", "67f5455e5482b8effbe92885"
];

const students = await Student.find().select('_id');
const studentGroupDocs = students.map((student, index) => ({
  studentId: student._id,
  groupNum: groupIds[index % groupIds.length]
}));

await StudentGroup.insertMany(studentGroupDocs);

console.log('✅ Successfully inserted student-group records!');
await mongoose.disconnect();
