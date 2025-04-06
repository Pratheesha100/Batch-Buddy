import mongoose from "mongoose";

const lecturerSchema = new mongoose.Schema({
  lecturerName: { type: String, required: true },
  lecturerEmail: { type: String, required: true, unique: true },
  lecturerCode: { type: String, required: true, unique: true },
  faculty: { type: mongoose.Schema.Types.ObjectId, ref: "Faculty" },
});

export default mongoose.model("Lecturers", lecturerSchema);