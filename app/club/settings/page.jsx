import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/db";
import Club from "@/models/Club";
import ClubMember from "@/models/ClubMember";
import ClubMembershipSettings from "@/components/ClubMembershipSettings";

export default async function ClubSettingsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  await dbConnect();
  const cookieStore = await cookies();
  const selectedId = cookieStore.get("activeClubId")?.value;
  const membership = await ClubMember.findOne({ userId: session.user.id, role: "ADMIN", status: "ACTIVE", ...(selectedId ? { clubId: selectedId } : {}) }).select("clubId").lean();
  if (!membership && session.user.role !== "ADMIN") redirect("/dashboard");
  const targetClubId = membership?.clubId || (session.user.role === "ADMIN" ? selectedId : null);
  const club = targetClubId ? await Club.findById(targetClubId).select("name membershipFee membershipApprovalRequired isPrivate").lean() : null;
  if (!club) redirect(session.user.role === "ADMIN" ? "/admin/events" : "/club");
  return <main className="p-6 md:p-10"><div className="mx-auto max-w-3xl"><p className="text-xs font-bold uppercase tracking-[.2em] text-yellow-400">Club configuration</p><h1 className="mt-2 text-3xl font-black">Membership settings</h1><p className="mt-2 text-sm text-zinc-400">Configure whether students join for free, pay a demo membership fee, or wait for approval.</p><ClubMembershipSettings club={{ id: String(club._id), name: club.name, membershipFee: club.membershipFee || 0, membershipApprovalRequired: club.membershipApprovalRequired !== false, isPrivate: Boolean(club.isPrivate) }} /></div></main>;
}

export const dynamic = "force-dynamic";
