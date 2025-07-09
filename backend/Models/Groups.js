import mongoose from "mongoose";
import moment from "moment";

const groupSchema = new mongoose.Schema({
  groupNum: { type: String, required: true }, 
  degree: { type: mongoose.Schema.Types.ObjectId, ref: "Degree", required: true },
  faculty: { type: mongoose.Schema.Types.ObjectId, ref: "Faculty", required: true },
  batch: { type: mongoose.Schema.Types.ObjectId, ref: "Batch", required: true },
  year: { type: Number, required: true },
  semester: { type: Number, required: true },
  studentsCount: { type: Number, default: 0 }
},
{ timestamps: true }
);


// Middleware to modify the timestamp fields
groupSchema.set("toJSON",{
  virtuals: true,
  transform: (ret) => {
    ret.createdAt = moment(ret.createdAt).format("YYYY-MM-DD hh:mm A"); // Example format: 2025-04-06 02:30 PM
    ret.updatedAt = moment(ret.updatedAt).format("YYYY-MM-DD hh:mm A"); // Example format: 2025-04-06 02:30 PM
    return ret;
  }
});

export default mongoose.model("Groups", groupSchema);
