import mongoose from "mongoose";

const degreeSchema = new mongoose.Schema({
  degreeName: { type: String, required: true },
  degreeCode: { type: String, required: true, unique: true },
  faculty: { type: mongoose.Schema.Types.ObjectId, ref: "Faculty" , required: true},
  duration: { type: Number, default: 4},
});

export default mongoose.model("Degrees", degreeSchema);
