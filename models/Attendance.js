import mongoose from "mongoose";

const AttendanceSchema = new mongoose.Schema(
  {
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
    userId:  { type: mongoose.Schema.Types.ObjectId, ref: "User",  required: true },

    status: {
      type: String,
      enum: ["REGISTERED", "CHECKED_IN", "ABSENT"],
      default: "REGISTERED",
    },

    qrToken: { type: String, unique: true, required: true },
    checkedInAt: Date,
    aicteAwarded: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// One attendance per (event, user)
AttendanceSchema.index({ eventId: 1, userId: 1 }, { unique: true });
AttendanceSchema.index({ eventId: 1, status: 1 });
AttendanceSchema.index({ userId: 1 });
// AttendanceSchema.index({ qrToken: 1 }, { unique: true });

export default mongoose.models.Attendance || mongoose.model("Attendance", AttendanceSchema);