import mongoose from "mongoose";

const reportSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  type: {
    type: String,
    enum: ["Fire", "ICE", "Police", "Ambulance"],
    required: true,
  },
  location: {
    type: { type: String, enum: ["Point"], default: "Point" },
    coordinates: { type: [Number], required: true },
  },
  title: { type: String, required: true },
  description: { type: String },
  createdAt: { type: Date, default: Date.now },
});

reportSchema.index({ "location.coordinates": "2dsphere" });

export const Report = mongoose.model("Report", reportSchema);
