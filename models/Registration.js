import mongoose from "mongoose";

const RegistrationSchema = new mongoose.Schema({
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  qrToken: { type: String, required: true, unique: true, select: false },
  status: {
    type: String,
    enum: ["PAYMENT_PENDING", "REGISTERED", "CHECKED_IN", "CANCELLED"],
    default: "REGISTERED",
    index: true,
  },
  payment: {
    mode: { type: String, enum: ["FREE", "DEMO"], default: "FREE" },
    status: { type: String, enum: ["NOT_REQUIRED", "PENDING", "PAID"], default: "NOT_REQUIRED" },
    amount: { type: Number, min: 0, default: 0 },
    demoPaymentId: { type: String, default: null },
    paidAt: { type: Date, default: null },
  },
  checkedInAt: { type: Date, default: null },
  checkedInBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  aicteAwarded: { type: Number, default: 0, min: 0 },
  registrationCode: { type: String, default: "" },
}, { timestamps: true });

RegistrationSchema.index({ eventId: 1, userId: 1 }, { unique: true });
RegistrationSchema.index({ eventId: 1, status: 1 });

export default mongoose.models.Registration || mongoose.model("Registration", RegistrationSchema);
