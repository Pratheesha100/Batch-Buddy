import mongoose from "mongoose";
import moment from "moment"; // Import Moment.js to format the date

const lecturerModuleSchema = new mongoose.Schema(
  {
    lecturerCode: { type: mongoose.Schema.Types.ObjectId, ref: 'Lecturers', required: true },
    moduleCode: { type: mongoose.Schema.Types.ObjectId, ref: 'Modules', required: true },
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt fields
  }
);

// Enforce uniqueness on lecturerCode and moduleCode combination
lecturerModuleSchema.index({ lecturerCode: 1, moduleCode: 1 }, { unique: true });

// Middleware to modify the timestamp fields
lecturerModuleSchema.set("toJSON",{
  virtuals: true,
  transform: (ret) => {
    ret.createdAt = moment(ret.createdAt).format("YYYY-MM-DD hh:mm A"); // Example format: 2025-04-06 02:30 PM
    ret.updatedAt = moment(ret.updatedAt).format("YYYY-MM-DD hh:mm A"); // Example format: 2025-04-06 02:30 PM
    return ret;
  }
});

export default mongoose.model("LecturerModule", lecturerModuleSchema);
