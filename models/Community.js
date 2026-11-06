import mongoose from "mongoose";

const CommunitySchema = new mongoose.Schema(
  {
    type: { 
      type: String, 
      enum: ["HACKATHON_TEAM", "LEETCODE", "SPONSORSHIP", "GENERAL"], 
      required: true 
    },
    name: { type: String, required: true },
    slug: { type: String, unique: true, required: true },
    city: String, 
    description: String,
  },
  { timestamps: true }
);

CommunitySchema.index({ type: 1, city: 1 });

export default mongoose.models.Community || mongoose.model("Community", CommunitySchema);