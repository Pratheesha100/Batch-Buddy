import mongoose from "mongoose";
import moment from "moment";

const studentModuleSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student" },
  moduleCode: { type: mongoose.Schema.Types.ObjectId, ref: "Module" },
},
{
    timestamps: true,
});

// Enforce uniqueness on studentId and moduleCode combination
studentModuleSchema.index({ studentId: 1, moduleCode: 1 }, { unique: true });

// Middleware to modify the timestamp fields
studentModuleSchema.set("toJSON",{
  virtuals: true,
  transform: (ret) => {
    ret.createdAt = moment(ret.createdAt).format("YYYY-MM-DD hh:mm A"); // Example format: 2025-04-06 02:30 PM
    ret.updatedAt = moment(ret.updatedAt).format("YYYY-MM-DD hh:mm A"); // Example format: 2025-04-06 02:30 PM
    return ret;
  }
});
export default mongoose.model("StudentModule", studentModuleSchema);