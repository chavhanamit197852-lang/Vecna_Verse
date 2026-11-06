import { z } from "zod";
import { dbConnect } from "@/lib/db";
import { requireClubAdmin } from "@/lib/permissions";
import Club from "@/models/Club";
import { fail, ok, readJson } from "@/lib/http";

export async function PATCH(req, { params }) {
  const { id } = await params;
  const access = await requireClubAdmin(id);
  if (access.error) return access.error;
  const parsed = z.object({ membershipFee: z.coerce.number().min(0).max(1000000), membershipApprovalRequired: z.boolean(), isPrivate: z.boolean().optional() }).safeParse(await readJson(req));
  if (!parsed.success) return fail("Invalid membership settings");
  await dbConnect();
  const club = await Club.findByIdAndUpdate(id, { $set: parsed.data }, { new: true, runValidators: true }).select("name membershipFee membershipApprovalRequired isPrivate").lean();
  if (!club) return fail("Club not found", 404);
  return ok({ club });
}
