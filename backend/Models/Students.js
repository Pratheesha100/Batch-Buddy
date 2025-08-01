import mongoose from "mongoose";
import moment from "moment";

const studentSchema = new mongoose.Schema(
{
  studentName: {type: String, required: true},
  studentId: { type: String, required: true, unique: true },
  contactNumber: { type: String, required: true, },
  address: { type: String, required: true },
  birthday: { type: Date, required: true },
  email: { type: String, required: true, unique: true },
  degree: { type: mongoose.Schema.Types.ObjectId, ref: "Degrees", required: true },
  faculty: { type: mongoose.Schema.Types.ObjectId, ref: "Faculty", required: true },
  batch: { type: mongoose.Schema.Types.ObjectId, ref: "Batches", required: true },
}
, { timestamps: true }
);

// Middleware to modify the timestamp fields
studentSchema.set("toJSON",{
  virtuals: true,
  transform: (doc, ret) => {
    ret.createdAt = moment(ret.createdAt).format("YYYY-MM-DD hh:mm A"); // Example format: 2025-04-06 02:30 PM
    ret.updatedAt = moment(ret.updatedAt).format("YYYY-MM-DD hh:mm A"); // Example format: 2025-04-06 02:30 PM
    return ret;
  }
});

export default mongoose.model("Students", studentSchema);
