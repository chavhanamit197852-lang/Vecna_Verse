import { dbConnect } from "@/lib/db";
import { requireUser } from "@/lib/permissions";
import TeamPost from "@/models/TeamPost";
import { fail, ok, readJson } from "@/lib/http";

export async function GET() {
  await dbConnect();
  const posts = await TeamPost.find({ status: "OPEN" })
    .populate("authorId", "name image city college")
    .sort({ createdAt: -1 }).limit(100).lean();
  return ok({ posts: JSON.parse(JSON.stringify(posts)) });
}

export async function POST(req) {
  const { user, error } = await requireUser();
  if (error) return error;
  const body = await readJson(req);
  const title = String(body?.title || "").trim();
  const description = String(body?.description || "").trim();
  const skills = Array.isArray(body?.skills) ? body.skills : String(body?.skills || "").split(",");
  const cleanSkills = [...new Set(skills.map((s) => String(s).trim()).filter(Boolean))].slice(0, 15);
  const teamSize = Math.min(20, Math.max(2, Number(body?.teamSize) || 4));
  const workMode = ["REMOTE", "HYBRID", "IN_PERSON"].includes(body?.workMode) ? body.workMode : "REMOTE";
  if (title.length < 5 || title.length > 120 || description.length < 15 || description.length > 3000 || !cleanSkills.length) {
    return fail("Add a title, a useful description and at least one skill.");
  }
  await dbConnect();
  const post = await TeamPost.create({
    title, description, skills: cleanSkills,
    hackathonName: String(body?.hackathonName || "").trim().slice(0, 120),
    teamSize, openPositions: teamSize - 1, workMode,
    location: {
      city: String(body?.city || "").trim().slice(0, 80),
      state: String(body?.state || "").trim().slice(0, 80),
      country: String(body?.country || "").trim().slice(0, 80),
    },
    authorId: user.id,
  });
  return ok({ id: String(post._id) }, 201);
}
