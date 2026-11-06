import { dbConnect } from "@/lib/db";
import { requireUser } from "@/lib/permissions";
import LeetCodeProfile from "@/models/LeetCodeProfile";
import GitHubProfile from "@/models/GitHubProfile";
import User from "@/models/User";
import { fail, ok, readJson } from "@/lib/http";

export async function GET() {
  const { user, error } = await requireUser();
  if (error) return error;
  await dbConnect();
  const [leetcode, github, profile] = await Promise.all([
    LeetCodeProfile.findOne({ userId: user.id }).lean(),
    GitHubProfile.findOne({ userId: user.id }).lean(),
    User.findById(user.id).select("city state country college").lean(),
  ]);
  return ok({ leetcode, github, profile });
}

export async function POST(req) {
  const { user, error } = await requireUser();
  if (error) return error;
  const body = await readJson(req);
  const lcHandle = String(body?.leetcodeHandle || "").trim().replace(/^@/, "");
  const ghHandle = String(body?.githubUsername || "").trim().replace(/^@/, "");
  if (lcHandle && !/^[a-zA-Z0-9_-]{2,40}$/.test(lcHandle)) return fail("Enter a valid LeetCode username.");
  if (ghHandle && !/^[a-zA-Z0-9-]{1,39}$/.test(ghHandle)) return fail("Enter a valid GitHub username.");
  if (!lcHandle && !ghHandle) return fail("Add a LeetCode or GitHub username.");
  await dbConnect();
  const updates = {};
  const locationSet = {};
  for (const k of ["city", "state", "country"]) {
    if (typeof body?.[k] === "string" && body[k].trim()) locationSet[k] = body[k].trim().slice(0, 80);
  }
  if (Object.keys(locationSet).length) await User.updateOne({ _id: user.id }, { $set: locationSet });
  if (lcHandle) {
    const totalSolved = Math.max(0, Math.min(100000, Number(body.totalSolved) || 0));
    const easySolved = Math.max(0, Math.min(totalSolved, Number(body.easySolved) || 0));
    const mediumSolved = Math.max(0, Math.min(totalSolved - easySolved, Number(body.mediumSolved) || 0));
    const hardSolved = Math.max(0, totalSolved - easySolved - mediumSolved);
    updates.leetcode = await LeetCodeProfile.findOneAndUpdate(
      { userId: user.id },
      { $set: { handle: lcHandle, totalSolved, easySolved, mediumSolved, hardSolved, rating: Math.max(0, Number(body.rating) || 0), ranking: Math.max(0, Number(body.ranking) || 0), source: "USER_SUBMITTED", evidenceUrl: String(body?.leetcodeEvidenceUrl || "").slice(0, 1000), lastSyncedAt: new Date() } },
      { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
    ).lean();
  }
  if (ghHandle) {
    updates.github = await GitHubProfile.findOneAndUpdate(
      { userId: user.id },
      { $set: { username: ghHandle, profileUrl: `https://github.com/${ghHandle}`, publicRepos: Math.max(0, Number(body.publicRepos) || 0), followers: Math.max(0, Number(body.followers) || 0), contributions: Math.max(0, Number(body.contributions) || 0), source: "USER_SUBMITTED", evidenceUrl: String(body?.githubEvidenceUrl || "").slice(0, 1000) } },
      { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
    ).lean();
  }
  return ok({ saved: true, ...updates });
}
