import mongoose from "mongoose";

const locationSchema = new mongoose.Schema({
  locationName: { type: String, required: true, },
  locationCode: { type: String, required: true, unique: true },
  faculty: { type: mongoose.Schema.Types.ObjectId, ref: "Faculty", required: true },
  locationType: {
    type: String, required: true,  set: (value) => {
        const formatted = value.toLowerCase();
        if (formatted === "lecture hall") return "Lecture Hall";
        if (formatted === "laboratory") return "Laboratory";
        if (formatted === "auditorium") return "Auditorium";
        throw new Error("Invalid location type");
    },
    enum: ["Lecture Hall", "Laboratory", "Auditorium"],
  },
});
export default mongoose.model("Location", locationSchema);