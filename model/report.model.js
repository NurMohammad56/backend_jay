import mongoose from "mongoose";

const reportSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  category: {
    type: String,
    enum: ["Fire", "ICE", "Police", "Ambulance"],
    required: true,
  },
  location: {
    address: { type: String },
    coordinates: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], required: true },
    },
  },
  description: { type: String },
  createdAt: { type: Date, default: Date.now },
});

reportSchema.index({ "location.coordinates": "2dsphere" });

export const Report = mongoose.model("Report", reportSchema);
