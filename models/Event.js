import mongoose from "mongoose";

const EventSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxLength: 120 },
  slug: { type: String, required: true, unique: true, index: true },
  description: { type: String, required: true },
  category: { type: String, default: "Other" },
  city: { type: String, default: "" },
  venue: { type: String, default: "" },
  coverImage: { type: String, default: "" },
  ticketPrice: { type: Number, default: 0, min: 0 },
  
  // ─── NEW: Exact coordinates for the map ───
  location: {
    lat: { type: Number },
    lng: { type: Number }
  },

  startsAt: { type: Date, required: true, index: true },
  endsAt: { type: Date, required: true },
  registrationDeadline: { type: Date, default: null },
  clubId: { type: mongoose.Schema.Types.ObjectId, ref: "Club", default: null, index: true },
  scope: { type: String, enum: ["CLUB", "PLATFORM"], default: "CLUB", index: true },
  registeredCount: { type: Number, default: 0, min: 0 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  capacity: { type: Number, default: 0, min: 0 },
  aicteCategory: { type: String, default: "" },
  aictePoints: { type: Number, default: 0, min: 0 },
  status: { type: String, enum: ["DRAFT", "PUBLISHED", "CANCELLED", "COMPLETED"], default: "DRAFT", index: true },
  isPublished: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.models.Event || mongoose.model("Event", EventSchema);