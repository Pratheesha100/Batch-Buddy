import mongoose from "mongoose";
import moment from "moment";

const attendanceSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: "Students", required: true },
  timetable: { type: mongoose.Schema.Types.ObjectId, ref: "Timetables", required: true },
  status: { type: String, set: (value) => {
    const formatted = value.toLowerCase();
    if (formatted === "present") return "Present";
    if (formatted === "absent") return "Absent";
    throw new Error("Invalid attendance status");
  },
  enum: ["Present", "Absent"], required: true },
  date: { type: Date, required: true },
}, { timestamps: true }); 
// Optional: Format timestamps for output
attendanceSchema.set("toJSON", {
  virtuals: true,
  transform: (doc, ret) => {
    ret.createdAt = moment(ret.createdAt).format("YYYY-MM-DD hh:mm A");
    ret.updatedAt = moment(ret.updatedAt).format("YYYY-MM-DD hh:mm A");
    return ret;
  }
});

export default mongoose.model("Attendance", attendanceSchema);
