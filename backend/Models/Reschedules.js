import mongoose from "mongoose";
import moment from "moment";

const rescheduleSchema = new mongoose.Schema({
    module: { type: mongoose.Schema.Types.ObjectId, ref: "Modules", required: true },
    oldDate: { type: Date, required: true },
    newDate: { type: Date, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    location: { type: mongoose.Schema.Types.ObjectId, ref: "Location", required: true },
    lecturer: { type: mongoose.Schema.Types.ObjectId, ref: "Lecturers", required: true },
    group: { type: mongoose.Schema.Types.ObjectId, ref: "Groups" },
    year: { type: String, required: true },
    faculty: { type: mongoose.Schema.Types.ObjectId, ref: "Faculty" }, 
    batch: { type: mongoose.Schema.Types.ObjectId, ref: "Batches" },
    type: {
        type: String,
        set: (value) => {
        const formatted = value.toLowerCase();
        if (formatted === "lecture") return "Lecture";
        if (formatted === "practical") return "Practical";
        if (formatted === "tutorial") return "Tutorial";
        if (formatted === "presentation") return "Presentation";
        if (formatted === "viva") return "Viva";
        throw new Error("Invalid reschedule type");
    },
        enum: ["Lecture", "Practical", "Tutorial", "Presentation", "Viva"], required: true,
    },
    },
    {
    timestamps: true,
    }
    );

// Middleware to modify the timestamp fields
rescheduleSchema.set("toJSON",{
    virtuals: true,
    transform: (ret) => {
        ret.createdAt = moment(ret.createdAt).format("YYYY-MM-DD hh:mm A"); // Example format: 2025-04-06 02:30 PM
        ret.updatedAt = moment(ret.updatedAt).format("YYYY-MM-DD hh:mm A"); // Example format: 2025-04-06 02:30 PM
        return ret;
    }
});
export default mongoose.model("Reschedules", rescheduleSchema);