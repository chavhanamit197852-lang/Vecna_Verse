import mongoose from "mongoose";

const TeamPostSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 120 },
  description: { type: String, required: true, maxlength: 3000 },
  skills: { type: [String], default: [] },
  hackathonName: { type: String, default: "", trim: true },
  teamSize: { type: Number, default: 4, min: 1, max: 20 },
  openPositions: { type: Number, default: 1, min: 0 },
  workMode: { type: String, enum: ["REMOTE", "HYBRID", "IN_PERSON"], default: "REMOTE" },
  location: {
    city: { type: String, default: "" },
    state: { type: String, default: "" },
    country: { type: String, default: "" },
  },
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  status: { type: String, enum: ["OPEN", "CLOSED"], default: "OPEN", index: true },
  deadline: { type: Date, default: null },
}, { timestamps: true });

TeamPostSchema.index({ status:  1, createdAt: -1 });
export default mongoose.models.TeamPost || mongoose.model("TeamPost", TeamPostSchema);
