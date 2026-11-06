import { dbConnect } from "@/lib/db";
import { requireUser } from "@/lib/permissions";
import TeamApplication from "@/models/TeamApplication";
import { ok } from "@/lib/http";
export async function GET() {
  const { user, error } = await requireUser();
  if (error) return error;
  await dbConnect();
  const applications = await TeamApplication.find({ applicantId: user.id })
    .populate({ path: "postId", select: "title hackathonName status" })
    .sort({ createdAt: -1 }).limit(100).lean();
  return ok({ applications: JSON.parse(JSON.stringify(applications)) });
}
