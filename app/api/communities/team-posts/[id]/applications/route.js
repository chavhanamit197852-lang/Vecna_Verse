import mongoose from "mongoose";
import { dbConnect } from "@/lib/db";
import { requireUser } from "@/lib/permissions";
import TeamPost from "@/models/TeamPost";
import TeamApplication from "@/models/TeamApplication";
import TeamChat from "@/models/TeamChat";
import { fail, ok, readJson } from "@/lib/http";

export async function GET(_req, { params }) {
  const { user, error } = await requireUser();
  if (error) return error;
  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) return fail("Invalid team", 400);
  await dbConnect();
  const post = await TeamPost.findById(id).lean();
  if (!post) return fail("Team not found", 404);
  if (String(post.authorId) !== user.id) return fail("Only the team creator can review applications.", 403);
  const applications = await TeamApplication.find({ postId: id })
    .populate("applicantId", "name image city state country college")
    .sort({ createdAt: -1 }).lean();
  return ok({ applications: JSON.parse(JSON.stringify(applications)) });
}

export async function PATCH(req, { params }) {
  const { user, error } = await requireUser();
  if (error) return error;
  const { id } = await params;
  const body = await readJson(req);
  const applicationId = body?.applicationId;
  const action = body?.action;
  if (!mongoose.isValidObjectId(id) || !mongoose.isValidObjectId(applicationId)) return fail("Invalid request", 400);
  if (!["ACCEPT", "REJECT"].includes(action)) return fail("Choose accept or reject.");
  await dbConnect();
  const post = await TeamPost.findById(id);
  if (!post) return fail("Team not found", 404);
  if (String(post.authorId) !== user.id) return fail("Only the team creator can review applications.", 403);

  const application = await TeamApplication.findOneAndUpdate(
    { _id: applicationId, postId: id, status: "PENDING" },
    { $set: { status: action === "ACCEPT" ? "ACCEPTED" : "REJECTED", reviewedAt: new Date() } },
    { new: true }
  );
  if (!application) return fail("This application has already been reviewed.", 409);

  if (action === "ACCEPT") {
    const updatedPost = await TeamPost.findOneAndUpdate(
      { _id: id, openPositions: { $gt: 0 } },
      { $inc: { openPositions: -1 } },
      { new: true }
    );
    if (!updatedPost) {
      await TeamApplication.updateOne({ _id: application._id }, { $set: { status: "PENDING", reviewedAt: null } });
      return fail("No open team positions remain.", 409);
    }
    if (updatedPost.openPositions === 0) {
      updatedPost.status = "CLOSED";
      await updatedPost.save();
    }
    await TeamChat.findOneAndUpdate(
      { postId: id },
      { $setOnInsert: { postId: id, createdBy: user.id }, $addToSet: { members: { $each: [user.id, application.applicantId] } } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    const chat = await TeamChat.findOne({ postId: id }).select("_id").lean();
    return ok({ status: "ACCEPTED", chatUrl: `/communities/teams/${id}/chat`, chatId: String(chat._id), openPositions: updatedPost.openPositions });
  }
  return ok({ status: "REJECTED" });
}
