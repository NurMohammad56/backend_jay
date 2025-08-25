import mongoose from "mongoose";

const alertSchema = new mongoose.Schema({
  report: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Report",
    required: true,
  },
  type: {
    type: String,
    enum: ["Fire", "ICE", "Police", "Ambulance"],
    required: true,
  },
  location: {
    type: { type: String, enum: ["Point"], default: "Point" },
    coordinates: { type: [Number], required: true },
  },
  createdAt: { type: Date, default: Date.now },
  isRead: { type: Boolean, default: false },
});

alertSchema.index({ "location.coordinates": "2dsphere" });

export const Alert = mongoose.model("Alert", alertSchema);
