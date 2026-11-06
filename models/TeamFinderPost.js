import mongoose from "mongoose";

const TeamFinderPostSchema = new mongoose.Schema(
  {
    communityId: { type: mongoose.Schema.Types.ObjectId, ref: "Community", required: true },
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    skills: { type: String, required: true },
    hackathonName: String, 
    contactUrl: String,
    status: { type: String, default: "OPEN" },
  },
  { timestamps: true }
);

TeamFinderPostSchema.index({ communityId: 1, status: 1 });

export default mongoose.models.TeamFinderPost || mongoose.model("TeamFinderPost", TeamFinderPostSchema);