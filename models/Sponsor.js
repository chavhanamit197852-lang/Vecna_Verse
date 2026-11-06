import mongoose from "mongoose";

const SponsorSchema = new mongoose.Schema({
  clubId: { type: mongoose.Schema.Types.ObjectId, ref: "Club", required: true, index: true },
  sponsorUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null, index: true },
  sponsorName: { type: String, required: true, trim: true },
  amount: { type: Number, required: true, min: 0 },
  paymentStatus: { type: String, enum: ["PENDING", "PAID"], default: "PENDING", index: true },
  paymentMode: { type: String, enum: ["DEMO", "MANUAL"], default: "MANUAL" },
  demoPaymentId: { type: String, default: null },
  paidAt: { type: Date, default: null },
  tier: { type: String, enum: ["BRONZE", "SILVER", "GOLD", "TITLE"], default: "SILVER" },
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event", default: null },
  inquiryId: { type: mongoose.Schema.Types.ObjectId, ref: "SponsorshipInquiry", default: null },
}, { timestamps: true });

SponsorSchema.index({ inquiryId:  1 }, { unique: true, sparse: true });
export default mongoose.models.Sponsor || mongoose.model("Sponsor", SponsorSchema);
