import mongoose from "mongoose";
import { dbConnect } from "@/lib/db";
import { requireUser } from "@/lib/permissions";
import TeamApplication from "@/models/TeamApplication";
import TeamPost from "@/models/TeamPost";
import { fail, ok, readJson } from "@/lib/http";

export async function POST(req, { params }) {
  const { user, error } = await requireUser();
  if (error) return error;
  const { id } = await params;
  const body = await readJson(req);
  const message = String(body?.message || "").trim();
  if (!mongoose.isValidObjectId(id)) return fail("Invalid team request", 400);
  if (message.length < 10 || message.length > 1000) return fail("Write an introduction of at least 10 characters.");
  await dbConnect();
  const post = await TeamPost.findById(id);
  if (!post || post.status !== "OPEN" || post.openPositions < 1) return fail("This team is no longer accepting applications.", 404);
  if (String(post.authorId) === user.id) return fail("You cannot apply to your own team.");
  try {
    const application = await TeamApplication.create({ postId: id, applicantId: user.id, message });
    return ok({ id: String(application._id), status: application.status }, 201);
  } catch (e) {
    if (e.code === 11000) return fail("You have already applied to this team.", 409);
    throw e;
  }
}
