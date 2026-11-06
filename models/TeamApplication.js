import mongoose from "mongoose";
const TeamApplicationSchema = new mongoose.Schema({
  postId: { type: mongoose.Schema.Types.ObjectId, ref: "TeamPost", required: true, index: true },
  applicantId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  message: { type: String, required: true, maxlength: 1000 },
  status: { type: String, enum: ["PENDING", "ACCEPTED", "REJECTED"], default: "PENDING", index: true },
  reviewedAt: { type: Date, default: null },
}, { timestamps: true });
TeamApplicationSchema.index({ postId: 1, applicantId: 1 }, { unique: true });
export default mongoose.models.TeamApplication || mongoose.model("TeamApplication", TeamApplicationSchema);
