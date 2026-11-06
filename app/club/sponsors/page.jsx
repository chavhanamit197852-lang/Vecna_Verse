import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/db";
import ClubMember from "@/models/ClubMember";
import SponsorshipInquiry from "@/models/SponsorshipInquiry";
import SponsorshipInbox from "@/components/SponsorshipInbox";
import Sponsor from "@/models/Sponsor";
import SponsorContributions from "@/components/SponsorContributions";

export default async function ClubSponsorsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  await dbConnect();
  const isAdmin = session.user.role === "ADMIN";
  const memberships = isAdmin ? [] : await ClubMember.find({ userId: session.user.id, role: "ADMIN", status: "ACTIVE" }).populate("clubId", "name").lean();
  const clubIds = memberships.map((membership) => membership.clubId?._id).filter(Boolean);
  if (!isAdmin && !clubIds.length) redirect("/dashboard");
  const filter = isAdmin ? {} : { clubId: { $in: clubIds } };
  const [inquiries, contributions] = await Promise.all([
    SponsorshipInquiry.find(filter).populate("clubId", "name").populate("sponsorUserId", "name email").populate("eventId", "title").sort({ createdAt: -1 }).lean(),
    Sponsor.find(filter).populate("clubId", "name").populate("eventId", "title").sort({ createdAt: -1 }).lean(),
  ]);
  const safe = inquiries.map((item) => ({ ...item, _id: String(item._id), clubId: item.clubId ? { _id: String(item.clubId._id), name: item.clubId.name } : null, sponsorUserId: item.sponsorUserId ? { name: item.sponsorUserId.name, email: item.sponsorUserId.email } : null, eventId: item.eventId ? { title: item.eventId.title } : null }));
  const safeContributions = contributions.map((item) => ({ _id: String(item._id), sponsorName: item.sponsorName, amount: item.amount, paymentStatus: item.paymentStatus, clubName: item.clubId?.name || "Club", eventTitle: item.eventId?.title || "" }));
  return <main className="p-6 md:p-10"><div className="mx-auto max-w-6xl"><p className="text-xs font-bold uppercase tracking-[.2em] text-yellow-400">Partnerships</p><h1 className="mt-2 text-3xl font-black">Sponsor proposals</h1><p className="mt-2 text-sm text-zinc-400">Review companies interested in sponsoring your club.</p><SponsorshipInbox initialItems={safe} /><SponsorContributions contributions={safeContributions} /></div></main>;
}

export const dynamic = "force-dynamic";
