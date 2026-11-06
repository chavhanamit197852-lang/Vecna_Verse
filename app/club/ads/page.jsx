import { redirect } from "next/navigation";
import mongoose from "mongoose";
import { cookies } from "next/headers";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/db";
import Club from "@/models/Club";
import ClubMember from "@/models/ClubMember";
import ClubAd from "@/models/ClubAd";
import ClubAdPurchaseForm from "@/components/ClubAdPurchaseForm";

export const dynamic = "force-dynamic";
export default async function ClubAdsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  await dbConnect();
  const cookieStore = await cookies();
  const rawSelectedId = cookieStore.get("activeClubId")?.value;
  const selectedId = rawSelectedId && mongoose.isValidObjectId(rawSelectedId) ? rawSelectedId : null;
  let club = null;
  if (session.user.role === "ADMIN") {
    club = selectedId ? await Club.findById(selectedId).select("_id name").lean() : await Club.findOne().select("_id name").lean();
  } else {
    const membership = await ClubMember.findOne({ userId: session.user.id, role: "ADMIN", status: "ACTIVE", ...(selectedId ? { clubId: selectedId } : {}) }).populate("clubId", "_id name").lean();
    club = membership?.clubId || null;
  }
  if (!club) redirect(session.user.role === "ADMIN" ? "/clubs" : "/dashboard");
  const initialAds = await ClubAd.find({ clubId: club._id }).sort({ createdAt: -1 }).lean();
  const safeAds = initialAds.map((ad) => ({ _id: String(ad._id), title: ad.title, body: ad.body, placement: ad.placement, tier: ad.tier, amountInr: ad.amountInr, status: ad.status, impressions: ad.impressions || 0, clicks: ad.clicks || 0, startsAt: ad.startsAt?.toISOString?.() || null, endsAt: ad.endsAt?.toISOString?.() || null }));
  return <main className="min-h-screen p-6 text-white md:p-10"><div className="mx-auto max-w-5xl"><p className="text-xs font-bold uppercase tracking-[.2em] text-yellow-400">Club promotion</p><h1 className="mt-2 text-3xl font-black">Advertise {club.name}</h1><p className="mt-2 max-w-2xl text-sm text-zinc-400">Buy promotional placements for your club or events. Club advertisements are billed separately from sponsors who fund your activities.</p><ClubAdPurchaseForm clubId={String(club._id)} initialAds={safeAds}/></div></main>;
}
