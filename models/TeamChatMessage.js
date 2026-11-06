import mongoose from "mongoose";
const TeamChatMessageSchema = new mongoose.Schema({
  chatId: { type: mongoose.Schema.Types.ObjectId, ref: "TeamChat", required: true, index: true },
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  body: { type: String, required: true, trim: true, maxlength: 3000 },
}, { timestamps: true });
TeamChatMessageSchema.index({ chatId: 1, createdAt: 1 });
export default mongoose.models.TeamChatMessage || mongoose.model("TeamChatMessage", TeamChatMessageSchema);
