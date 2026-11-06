import mongoose from "mongoose";
const SponsorshipInquirySchema = new mongoose.Schema({
  clubId: { type: mongoose.Schema.Types.ObjectId, ref: "Club", required: true, index: true },
  sponsorUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  sponsorName: { type: String, required: true, trim: true, maxlength: 120 },
  contactEmail: { type: String, required: true, lowercase: true, trim: true },
  message: { type: String, required: true, maxlength: 2000 },
  budgetInr: { type: Number, min: 0, default: 0 },
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event", default: null },
  status: { type: String, enum: ["PENDING", "CONTACTED", "ACCEPTED", "REJECTED", "CLOSED"], default: "PENDING", index: true },
  responseNote: { type: String, default: "", maxlength: 1000 },
  respondedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  respondedAt: { type: Date, default: null },
}, { timestamps: true });
SponsorshipInquirySchema.index({ clubId: 1, createdAt: -1 });
export default mongoose.models.SponsorshipInquiry || mongoose.model("SponsorshipInquiry", SponsorshipInquirySchema);
