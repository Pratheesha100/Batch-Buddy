import mongoose from "mongoose";

const moduleScema = new mongoose.Schema({
  moduleCode: { type: String, required: true, unique: true },
  moduleName: { type: String, required: true },
  degree: { type: mongoose.Schema.Types.ObjectId, ref: "Degrees", required: true },
  year: { type: Number, required: true },
  credits: { type: Number, required: true },
  faculty: { type: mongoose.Schema.Types.ObjectId, ref: "Faculty", required: true },
  lecturerInCharge: { type: mongoose.Schema.Types.ObjectId, ref: "Lecturers", required: true },
});

export default mongoose.model("Modules", moduleScema);
