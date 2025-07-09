import mongoose from "mongoose";
import moment from "moment";

const eventSchema = new mongoose.Schema({
    eventName: { type: String, required: true },
    eventDescription: { type: String, required: true },
    eventDate: { type: Date, required: true },
    time: { type: String, required: true },
    location: { type: String, required: true },
    faculty: { type: mongoose.Schema.Types.ObjectId, ref: "Faculty", required: true },
    },
    {
    timestamps: true,
    }
    );

// Middleware to modify the timestamp fields
eventSchema.set("toJSON",{
    virtuals: true,
    transform: (ret) => {
        ret.createdAt = moment(ret.createdAt).format("YYYY-MM-DD hh:mm A"); // Example format: 2025-04-06 02:30 PM
        ret.updatedAt = moment(ret.updatedAt).format("YYYY-MM-DD hh:mm A"); // Example format: 2025-04-06 02:30 PM
        return ret;
    }
});

export default mongoose.model("Events", eventSchema);