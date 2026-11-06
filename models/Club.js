import mongoose from "mongoose";

const ClubSchema = new mongoose.Schema(
  {
    name: { type: String, unique: true, required: true },
    slug: { type: String, unique: true, required: true },
    institution: { type: String, required: true }, // e.g. "IIT Bombay"
    city: String,
    membershipFee: { type: Number, min: 0, default: 0 },
    membershipApprovalRequired: { type: Boolean, default: true },
    isPrivate: { type: Boolean, default: false }, // private clubs are hidden from non-members and always need approval
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export default mongoose.models.Club || mongoose.model("Club", ClubSchema);