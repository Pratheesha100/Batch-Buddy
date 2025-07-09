import mongoose from "mongoose";

const batchSchema = new mongoose.Schema({
  batchType: {
    type: String,
    required: true,
    set: (value) => {
      const formatted = value.toLowerCase();
      if (formatted === "weekday") return "Weekday";
      if (formatted === "weekend") return "Weekend";
      throw new Error("Invalid batch type");
    },
    enum: ["Weekday", "Weekend"],
  },
  studentCount: { type: Number, required: true },
});

export default mongoose.model("Batches", batchSchema);
