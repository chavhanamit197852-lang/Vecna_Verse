import mongoose from "mongoose";
const TeamChatSchema = new mongoose.Schema({
  postId: { type: mongoose.Schema.Types.ObjectId, ref: "TeamPost", required: true, unique: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  lastMessageAt: { type: Date, default: Date.now },
}, { timestamps: true });
export default mongoose.models.TeamChat || mongoose.model("TeamChat", TeamChatSchema);
