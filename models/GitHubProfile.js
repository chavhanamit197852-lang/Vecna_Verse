import mongoose from "mongoose";
const GitHubProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true, index: true },
  username: { type: String, required: true, trim: true, index: true },
  profileUrl: { type: String, required: true },
  publicRepos: { type: Number, default: 0, min: 0 },
  followers: { type: Number, default: 0, min: 0 },
  contributions: { type: Number, default: 0, min: 0 },
  source: { type: String, enum: ["USER_SUBMITTED", "VERIFIED_API"], default: "USER_SUBMITTED" },
  evidenceUrl: { type: String, default: "" },
}, { timestamps: true });
export default mongoose.models.GitHubProfile || mongoose.model("GitHubProfile", GitHubProfileSchema);
