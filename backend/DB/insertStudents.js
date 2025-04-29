import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://myAtlasDBUser:batchbuddy123@batch-buddy.ei7he.mongodb.net/?retryWrites=true&w=majority';

const studentSchema = new mongoose.Schema({
  studentName: { type: String, required: true },
  studentId: { type: String, required: true, unique: true },
  contactNumber: { type: String, required: true },
  address: { type: String, required: true },
  birthday: { type: Date, required: true },
  email: { type: String, required: true, unique: true },
  degree: { type: mongoose.Schema.Types.ObjectId, ref: 'Degree', required: true },
  faculty: { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty', required: true },
  batch: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch', required: true },
}, { timestamps: true });

const Student = mongoose.model('Student', studentSchema);

// Constants from your inputs
const facultyId = "660f0c8fa8f6b624c2ab1234";
const degreeId = "67f53a3e5502be9c36d4d0bb";
const batchId = "67f535a610409250e6e3f2d0";

// Sample realistic name pools
const firstNames = ["Samantha", "Kavindu", "Dilani", "Tharindu", "Nadeesha", "Isuru", "Sachini", "Pasindu", "Janani", "Lakshan", "Madushi", "Ravindu", "Imashi", "Shakya", "Pratheesha", "Haritha", "Tharushi", "Nimasha", "Sashini", "Dhanushka", "Chathura", "Dilshan", "Hiruni", "Kasun", "Nishantha", "Pavithra", "Rukmal", "Shanika", "Thilina", "Udaya", "Vimukthi"];
const lastNames = ["Perera", "Fernando", "Silva", "Jayasinghe", "Gunawardena", "Bandara", "Herath", "Wickramasinghe", "Wijesinghe", "Kariyawasam", "Deerasinghe", "Rajapaksha", "Kumarasinghe", "Dissanayake", "Samarasinghe", "Abeysinghe", "Jayawardena", "Liyanage", "Mendis"];

// Helper functions
const getRandomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

const getRandomBirthday = () => {
  const year = Math.floor(Math.random() * (2005 - 1998 + 1)) + 1998;
  const month = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
  const day = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getRandomPhone = () => {
  const prefixes = ["077", "071", "075", "076"];
  return `${getRandomItem(prefixes)}${Math.floor(1000000 + Math.random() * 9000000)}`;
};

// Generate 100 NEW student records
const students = Array.from({ length: 100 }, (_, i) => {
  const firstName = getRandomItem(firstNames);
  const lastName = getRandomItem(lastNames);
  const fullName = `${firstName} ${lastName}`;
  const index = 100 + i; // Start from IT22100100
  const studentId = `IT22${index.toString().padStart(6, '0')}`;
  const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${index}@university.lk`;

  return {
    studentName: fullName,
    studentId,
    contactNumber: getRandomPhone(),
    address: `No. ${i + 101}, ${getRandomItem(["Lake Road", "Temple Lane", "University Ave", "Main Street"])}, ${getRandomItem(["Kandy", "Colombo", "Galle", "Jaffna", "Matara"])}`,
    birthday: getRandomBirthday(),
    email,
    degree: degreeId,
    faculty: facultyId,
    batch: batchId,
  };
});

// Connect and insert
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log("✅ Connected to MongoDB");

    try {
      await Student.insertMany(students);
      console.log("🎉 Successfully inserted 100 additional unique student records!");
    } catch (error) {
      console.error("❌ Error inserting students:", error);
    } finally {
      mongoose.disconnect();
    }
  })
  .catch(err => console.error("❌ MongoDB connection error:", err));
