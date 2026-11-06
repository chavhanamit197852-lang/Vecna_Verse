import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    email: { type: String, unique: true, required: true, lowercase: true, trim: true },
    name: String,
    image: String,
    emailVerified: Date,
    passwordHash: String,

    // CHANGED — USER → STUDENT
    role: {
      type: String,
      enum: ["STUDENT", "SPONSOR", "CLUB_ADMIN", "ADMIN"],
      default: "STUDENT",
    },

    clubId: { type: mongoose.Schema.Types.ObjectId, ref: "Club", default: null },
    city: String,
    state: String,
    country: String,
    college: String,
    leetcodeHandle: String,

    location: {
      lat:        { type: Number },
      lng:        { type: Number },
      accuracy:   { type: Number },
      capturedAt: { type: Date },
    },

    aicteTotal: { type: Number, default: 0 },
    lastLoginAt: { type: Date, default: null },
  },
  { timestamps: true, strict: false }
);

UserSchema.index({ "location.lat": 1, "location.lng": 1 });
UserSchema.index({ lastLoginAt: -1 });
UserSchema.index({ role: 1 });

export default mongoose.models.User || mongoose.model("User", UserSchema);