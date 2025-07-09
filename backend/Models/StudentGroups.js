import mongoose from "mongoose";
import moment from "moment";

const studentGroupSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
  groupNum: { type: mongoose.Schema.Types.ObjectId, ref: "Group", required: true },
},
{ timestamps: true }
);

// Enforce uniqueness on studentId and groupNum combination
studentGroupSchema.index({ studentId: 1, groupNum: 1 }, { unique: true });


// Middleware to modify the timestamp fields
studentGroupSchema.set("toJSON",{
  virtuals: true,
  transform: (ret) => {
    ret.createdAt = moment(ret.createdAt).format("YYYY-MM-DD hh:mm A"); // Example format: 2025-04-06 02:30 PM
    ret.updatedAt = moment(ret.updatedAt).format("YYYY-MM-DD hh:mm A"); // Example format: 2025-04-06 02:30 PM
    return ret;
  }
});

export default mongoose.model("StudentGroup", studentGroupSchema);
