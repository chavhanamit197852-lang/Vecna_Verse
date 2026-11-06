import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Club from "../models/Club.js";
import ClubMember from "../models/ClubMember.js";
import Community from "../models/Community.js";
import Event from "../models/Event.js";
import LeetCodeProfile from "../models/LeetCodeProfile.js";
import TeamPost from "../models/TeamPost.js";

dotenv.config({ path: ".env.local" });
dotenv.config(); // fall back to .env
if (!process.env.MONGODB_URI) throw new Error("Set MONGODB_URI in .env.local first");
await mongoose.connect(process.env.MONGODB_URI, { dbName: "eventverse" });

const hash = await bcrypt.hash("EventVerse@123", 12);
const upsertUser = (email, set) =>
  User.findOneAndUpdate({ email }, { $set: { passwordHash: hash, city: "Pune", ...set } }, { upsert: true, new: true, setDefaultsOnInsert: true });

const admin = await upsertUser("admin@eventverse.local", { name: "Demo Admin", role: "ADMIN" });
const clubAdmin = await upsertUser("clubadmin@eventverse.local", { name: "Demo Club Admin", role: "CLUB_ADMIN" });
const committee = await upsertUser("committee@eventverse.local", { name: "Demo Committee", role: "STUDENT" });
const student = await upsertUser("user@eventverse.local", { name: "Demo Student", role: "STUDENT" });
const sponsor = await upsertUser("sponsor@eventverse.local", { name: "Demo Sponsor", role: "SPONSOR" });

// Club needs institution + createdBy (both required by the schema).
const club = await Club.findOneAndUpdate(
  { slug: "technova" },
  { $setOnInsert: { name: "TechNova Club", slug: "technova", institution: "Demo Institute of Technology", city: "Pune", createdBy: clubAdmin._id, membershipFee: 0, membershipApprovalRequired: true, isPrivate: false } },
  { upsert: true, new: true }
);
await User.updateOne({ _id: clubAdmin._id }, { $set: { clubId: club._id } });

// Club roles live in ClubMember (this is what the permission checks actually read).
for (const [u, role] of [[clubAdmin, "ADMIN"], [committee, "COMMITTEE"]]) {
  await ClubMember.updateOne(
    { clubId: club._id, userId: u._id },
    { $setOnInsert: { clubId: club._id, userId: u._id, role, status: "ACTIVE", paymentStatus: "NOT_REQUIRED" } },
    { upsert: true }
  );
}

for (const c of [
  { name: "Hackathon Team Finder", slug: "hackathon", type: "HACKATHON_TEAM", description: "Find teammates for your next hackathon." },
  { name: "LeetCode Arena", slug: "leetcode", type: "LEETCODE", description: "Student coding leaderboard." },
  { name: "Sponsorship Marketplace", slug: "sponsorship", type: "SPONSORSHIP", description: "Paid promotion campaigns." },
]) await Community.updateOne({ slug: c.slug }, { $setOnInsert: c }, { upsert: true });

const now = Date.now();
const DAY = 86400000;
for (const [i, e] of [
  { title: "Pune React Meetup", slug: "pune-react-meetup", city: "Pune", ticketPrice: 0 },
  { title: "Campus AI Buildathon", slug: "campus-ai-buildathon", city: "Mumbai", ticketPrice: 199, category: "Hackathon" },
  { title: "Open Source Weekend", slug: "open-source-weekend", city: "Pune", ticketPrice: 0 },
].entries()) {
  await Event.updateOne(
    { slug: e.slug },
    { $setOnInsert: {
      category: "Technology", ...e,
      description: `Join ${e.title} and connect with builders.`,
      venue: "Campus Auditorium",
      location: { lat: 18.5204 + i * 0.01, lng: 73.8567 + i * 0.01 },
      startsAt: new Date(now + (i + 7) * DAY),
      endsAt: new Date(now + (i + 7) * DAY + 4 * 3600000),
      registrationDeadline: new Date(now + (i + 6) * DAY),
      scope: "CLUB", clubId: club._id, createdBy: clubAdmin._id,
      capacity: 200, aicteCategory: "Technical activity", aictePoints: 5,
      status: "PUBLISHED", isPublished: true,
    } },
    { upsert: true }
  );
}

for (const [i, handle] of ["aria", "vega", "orion", "nova", "lyra"].entries()) {
  const u = await User.findOneAndUpdate({ email: `${handle}@demo.local` }, { $setOnInsert: { name: handle, email: `${handle}@demo.local`, role: "STUDENT" } }, { upsert: true, new: true });
  await LeetCodeProfile.updateOne(
    { userId: u._id },
    { $setOnInsert: { userId: u._id, handle, totalSolved: 80 + i * 13, easySolved: 40 + i * 5, mediumSolved: 32 + i * 6, hardSolved: 8 + i * 2, rating: 1450 + i * 110, source: "DEMO" } },
    { upsert: true }
  );
}

await TeamPost.updateOne(
  { title: "Looking for a full-stack developer", authorId: student._id },
  { $setOnInsert: { title: "Looking for a full-stack developer", description: "We are building a campus hackathon project and need a full-stack developer.", skills: ["Next.js", "MongoDB", "JavaScript"], hackathonName: "Campus AI Buildathon", teamSize: 4, openPositions: 3, workMode: "HYBRID", location: { city: "Pune", state: "Maharashtra", country: "India" }, authorId: student._id } },
  { upsert: true }
);

console.log("Seed complete. Password for demo accounts: EventVerse@123");
console.log("admin@eventverse.local      | ADMIN");
console.log("clubadmin@eventverse.local  | CLUB_ADMIN (+ ClubMember ADMIN of TechNova)");
console.log("committee@eventverse.local  | STUDENT    (+ ClubMember COMMITTEE of TechNova)");
console.log("user@eventverse.local       | STUDENT");
console.log("sponsor@eventverse.local    | SPONSOR");
await mongoose.disconnect();
