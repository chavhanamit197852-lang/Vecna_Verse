import mongoose from "mongoose";
import { dbConnect } from "@/lib/db";
import { requireUser } from "@/lib/permissions";
import Community from "@/models/Community";
import CommunityMember from "@/models/CommunityMember";
import { fail, ok } from "@/lib/http";
export async function POST(_req, { params }) {
  const { user, error } = await requireUser();
  if (error) return error;
  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) return fail("Invalid community", 400);
  await dbConnect();
  if (!(await Community.exists({ _id: id }))) return fail("Community not found", 404);
  const membership = await CommunityMember.findOneAndUpdate(
    { communityId: id, userId: user.id },
    { $set: { status: "ACTIVE" }, $setOnInsert: { communityId: id, userId: user.id } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  return ok({ joined: membership.status === "ACTIVE" });
}
export async function DELETE(_req, { params }) {
  const { user, error } = await requireUser();
  if (error) return error;
  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) return fail("Invalid community", 400);
  await dbConnect();
  await CommunityMember.updateOne({ communityId: id, userId: user.id }, { $set: { status: "LEFT" } });
  return ok({ joined: false });
}
