import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/db";
import ClubAd from "@/models/ClubAd";
import ClubAdReview from "@/components/ClubAdReview";
export const dynamic = "force-dynamic";
export default async function AdminClubAdsPage() {
  const session = await auth(); if (!session?.user) redirect("/login"); if (session.user.role !== "ADMIN") redirect("/dashboard");
  await dbConnect();
  const ads = await ClubAd.find({ status: "PENDING_REVIEW", paymentVerifiedAt: { $ne: null } }).populate("clubId", "name").populate("ownerId", "name email").sort({ createdAt: 1 }).lean();
  const safe = ads.map((ad) => ({ ...ad, _id: String(ad._id), clubId: ad.clubId ? { name: ad.clubId.name } : null, ownerId: ad.ownerId ? { name: ad.ownerId.name, email: ad.ownerId.email } : null }));
  return <main className="min-h-screen bg-[#09090b] px-5 py-12 text-white"><div className="mx-auto max-w-5xl"><p className="text-xs font-bold uppercase tracking-[.2em] text-yellow-400">Platform moderation</p><h1 className="mt-2 text-3xl font-black">Club advertisement review</h1><p className="mt-2 text-sm text-zinc-400">Review demo-paid club promotions before they appear publicly.</p><div className="mt-7 space-y-4">{safe.map((ad) => <ClubAdReview key={ad._id} ad={ad}/>)}{!safe.length && <p className="rounded-2xl border border-dashed border-white/10 p-10 text-center text-sm text-zinc-500">No club ads awaiting review.</p>}</div></div></main>;
}
