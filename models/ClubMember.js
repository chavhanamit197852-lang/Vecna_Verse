// models/ClubMember.js
import mongoose from "mongoose";

const ClubMemberSchema = new mongoose.Schema(
  {
    clubId: { type: mongoose.Schema.Types.ObjectId, ref: "Club", required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    role: {
      type: String,
      enum: ["ADMIN", "COMMITTEE", "MEMBER"],
      default: "MEMBER",
    },
    status: {
      type: String,
      enum: ["PENDING", "ACTIVE", "REJECTED", "SUSPENDED"],
      default: "PENDING",
    },
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    membershipType: { type: String, enum: ["FREE", "PAID"], default: "FREE" },
    membershipFee: { type: Number, min: 0, default: 0 },
    paymentStatus: { type: String, enum: ["NOT_REQUIRED", "PENDING", "PAID", "FAILED"], default: "NOT_REQUIRED" },
    paymentMode: { type: String, enum: ["FREE", "DEMO"], default: "FREE" },
    paidAt: { type: Date, default: null },
    demoPaymentId: { type: String, default: null },
    joinCode: { type: String, unique: true, sparse: true },
  },
  { timestamps: true }
);

ClubMemberSchema.index({ clubId: 1, userId: 1 }, { unique: true });
ClubMemberSchema.index({ userId: 1 });
ClubMemberSchema.index({ clubId: 1, status: 1 }); // For pending requests lookup

export default mongoose.models.ClubMember ||
  mongoose.model("ClubMember", ClubMemberSchema);