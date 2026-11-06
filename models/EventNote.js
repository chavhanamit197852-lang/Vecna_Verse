import mongoose from "mongoose";

// One note per (user, event). NOTE: older deployments had a unique index on `userId` alone.
// Drop it once:  db.eventnotes.dropIndex("userId_1")
const EventNoteSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
  summary: { type: String, required: true, maxLength: 5000 },
  contactName: { type: String, default: "", maxLength: 120 },
  contactEmail: { type: String, default: "", maxLength: 200 },
  contactPhone: { type: String, default: "", maxLength: 40 },
}, { timestamps: true });
EventNoteSchema.index({ userId: 1, eventId: 1 }, { unique: true });
export default mongoose.models.EventNote || mongoose.model("EventNote", EventNoteSchema);
