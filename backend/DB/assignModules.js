import mongoose from 'mongoose';
import dotenv from 'dotenv';
import StudentModule from '../Models/StudentModules.js'; // Assuming the model is exported like this
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://myAtlasDBUser:batchbuddy123@batch-buddy.ei7he.mongodb.net/?retryWrites=true&w=majority';

// Module IDs
const moduleIds = [
  "67f55d3dfe863ae84c4a21fc", 
  "67f55d3dfe863ae84c4a21fd", 
  "67f55d3dfe863ae84c4a21fe", 
  "67f55d3dfe863ae84c4a21ff", 
  "67f55d3dfe863ae84c4a2200", 
  "67f55d3dfe863ae84c4a2201", 
  "67f55d3dfe863ae84c4a2202", 
  "67f55d3dfe863ae84c4a2203"
];

// Helper function to get 4 random modules from the moduleIds array
const getRandomModules = () => {
  const shuffled = [...moduleIds].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 4);
};

// Helper function to insert data
const assignModulesToStudents = async () => {
  try {
    await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log("✅ Connected to MongoDB");

    // Loop through all 200 students and assign 4 random modules
    const students = await mongoose.model("Students").find(); // Fetch all students
    const studentModules = [];

    students.forEach(student => {
      const assignedModules = getRandomModules(); // Get 4 random modules for the student
      assignedModules.forEach(moduleId => {
        studentModules.push({
          studentId: student._id,
          moduleCode: moduleId,
        });
      });
    });

    // Insert the student-module assignments into the database
    await StudentModule.insertMany(studentModules);
    console.log("🎉 Successfully assigned modules to students!");

  } catch (error) {
    console.error("❌ Error assigning modules:", error);
  } finally {
    mongoose.disconnect();
  }
};

assignModulesToStudents();
