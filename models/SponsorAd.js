import mongoose from "mongoose";

const SponsorAdSchema = new mongoose.Schema({
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  title: { type: String, required: true, trim: true, maxlength: 80 },
  body: { type: String, required: true, maxlength: 400 },
  targetUrl: { type: String, required: true },
  imageUrl: { type: String, default: "" },
  tier: { type: String, enum: ["BASIC", "STANDARD", "PREMIUM"], required: true },
  amountInr: { type: Number, min: 0, default: 0 },
  amountPaise: { type: Number, min: 0, default: 0 },
  durationDays: { type: Number, required: true },
  paymentMode: { type: String, enum: ["DEMO", "LIVE"], default: "DEMO" },
  paymentVerifiedAt: { type: Date, default: null },
  demoPaymentId: { type: String, default: null },
  status: { type: String, enum: ["PENDING_PAYMENT", "PENDING_REVIEW", "PENDING", "ACTIVE", "EXPIRED", "REJECTED"], default: "PENDING_PAYMENT", index: true },
  startsAt: Date,
  endsAt: Date,
  impressions: { type: Number, default: 0 },
  clicks: { type: Number, default: 0 },
}, { timestamps: true });

SponsorAdSchema.index({ status: 1, startsAt: 1, endsAt: 1 });
export default mongoose.models.SponsorAd || mongoose.model("SponsorAd", SponsorAdSchema);
