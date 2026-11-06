import mongoose from "mongoose";
import { dbConnect } from "@/lib/db";
import { requireUser } from "@/lib/permissions";
import TeamChat from "@/models/TeamChat";
import TeamChatMessage from "@/models/TeamChatMessage";
import { fail, ok, readJson } from "@/lib/http";

export async function GET(_req, { params }) {
  const { user, error } = await requireUser();
  if (error) return error;
  const { postId } = await params;
  if (!mongoose.isValidObjectId(postId)) return fail("Invalid team", 400);
  await dbConnect();
  const chat = await TeamChat.findOne({ postId, members: user.id }).populate("members", "name image city").lean();
  if (!chat) return fail("Team chat is available only after your application is accepted.", 403);
  const messages = await TeamChatMessage.find({ chatId: chat._id })
    .populate("senderId", "name image").sort({ createdAt: -1 }).limit(200).lean();
  messages.reverse();
  return ok({ chat: JSON.parse(JSON.stringify(chat)), messages: JSON.parse(JSON.stringify(messages)) });
}

export async function POST(req, { params }) {
  const { user, error } = await requireUser();
  if (error) return error;
  const { postId } = await params;
  const body = await readJson(req);
  const message = String(body?.message || "").trim();
  if (!mongoose.isValidObjectId(postId)) return fail("Invalid team", 400);
  if (!message || message.length > 3000) return fail("Message must be between 1 and 3000 characters.");
  await dbConnect();
  const chat = await TeamChat.findOne({ postId, members: user.id });
  if (!chat) return fail("You are not a member of this team chat.", 403);
  const created = await TeamChatMessage.create({ chatId: chat._id, senderId: user.id, body: message });
  chat.lastMessageAt = created.createdAt;
  await chat.save();
  await created.populate("senderId", "name image");
  return ok({ message: JSON.parse(JSON.stringify(created.toObject())) }, 201);
}
