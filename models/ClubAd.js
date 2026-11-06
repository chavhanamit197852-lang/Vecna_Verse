import mongoose from "mongoose";

const ClubAdSchema = new mongoose.Schema({
  clubId: { type: mongoose.Schema.Types.ObjectId, ref: "Club", required: true, index: true },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  title: { type: String, required: true, trim: true, maxlength: 90 },
  body: { type: String, required: true, trim: true, maxlength: 420 },
  targetUrl: { type: String, required: true },
  imageUrl: { type: String, default: "" },
  placement: { type: String, enum: ["HOMEPAGE", "EVENTS", "CLUB_DIRECTORY"], required: true, index: true },
  tier: { type: String, enum: ["BASIC", "STANDARD", "PREMIUM"], required: true },
  amountInr: { type: Number, required: true, min: 0 },
  durationDays: { type: Number, required: true, min: 1 },
  paymentMode: { type: String, enum: ["DEMO"], default: "DEMO" },
  paymentVerifiedAt: { type: Date, default: null },
  demoPaymentId: { type: String, default: null },
  status: { type: String, enum: ["PENDING_PAYMENT", "PENDING_REVIEW", "ACTIVE", "REJECTED", "EXPIRED"], default: "PENDING_PAYMENT", index: true },
  startsAt: { type: Date, default: null },
  endsAt: { type: Date, default: null },
  impressions: { type: Number, default: 0 },
  clicks: { type: Number, default: 0 },
}, { timestamps: true });

ClubAdSchema.index({ status: 1, placement: 1, startsAt: 1, endsAt: 1 });
export default mongoose.models.ClubAd || mongoose.model("ClubAd", ClubAdSchema);
