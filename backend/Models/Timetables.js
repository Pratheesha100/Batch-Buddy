import mongoose from "mongoose";
import moment from "moment";

const timetableSchema = new mongoose.Schema({

  module: {type:mongoose.Schema.Types.ObjectId, ref: "Modules", required: true,},
  day: {type: String, required: true, set: (value) => {
    const formatted = value.toLowerCase();
    if (formatted === "monday") return "Monday";
    if (formatted === "tuesday") return "Tuesday";
    if (formatted === "wednesday") return "Wednesday";
    if (formatted === "thursday") return "Thursday";
    if (formatted === "friday") return "Friday";
    if (formatted === "saturday") return "Saturday";
    if (formatted === "sunday") return "Sunday";
    throw new Error("Invalid batch type");
},enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]},
  startTime: {type: String, required: true,},
  endTime: {type: String, required: true,},
  location: {type: mongoose.Schema.Types.ObjectId, ref: "Locations", required: true,},
  lecturer: {type: mongoose.Schema.Types.ObjectId, ref: "Lecturers", required: true,},
  group: { type: mongoose.Schema.Types.ObjectId, ref: "Group" },
  faculty: { type: mongoose.Schema.Types.ObjectId, ref: "Faculty" }, 
  type: {
    type: String,
    set: (value) => {
      const formatted = value.toLowerCase();
      if (formatted === "lecture") return "Lecture";
      if (formatted === "practical") return "Practical";
      if (formatted === "tutorial") return "Tutorial";
      if (formatted === "presentation") return "Presentation";
      if (formatted === "viva") return "Viva";
      throw new Error("Invalid batch type");
  },
    enum: ["Lecture", "Practical", "Tutorial", "Presentation", "Viva"], required: true,
  },
},
{
  timestamps: true,
}
);

// Middleware to modify the timestamp fields
timetableSchema.set("toJSON",{
  virtuals: true,
  transform: (ret) => {
    ret.createdAt = moment(ret.createdAt).format("YYYY-MM-DD hh:mm A"); // Example format: 2025-04-06 02:30 PM
    ret.updatedAt = moment(ret.updatedAt).format("YYYY-MM-DD hh:mm A"); // Example format: 2025-04-06 02:30 PM
    return ret;
  }
});

export default mongoose.model("Timetables", timetableSchema);
