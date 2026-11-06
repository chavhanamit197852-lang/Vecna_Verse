import Link from "next/link";
import { dbConnect } from "@/lib/db";
import Club from "@/models/Club";
import Sponsor from "@/models/Sponsor";

export const dynamic = "force-dynamic";
export default async function SponsorshipMarketplacePage() {
  await dbConnect();
  const clubs = await Club.find().select("name slug institution city").sort({ name: 1 }).lean();
  const totals = await Sponsor.aggregate([{ $match: { paymentStatus: "PAID" } }, { $group: { _id: "$clubId", amount: { $sum: "$amount" }, supporters: { $sum: 1 } } }]);
  const summary = new Map(totals.map((item) => [String(item._id), item]));
  return <main className="min-h-screen bg-[#09090b] px-5 py-14 text-white"><div className="mx-auto max-w-6xl">
    <p className="text-xs font-bold uppercase tracking-[.2em] text-yellow-400">EventVerse partnerships</p>
    <h1 className="mt-3 max-w-3xl text-4xl font-black tracking-tight md:text-6xl">Back the clubs building what comes next.</h1>
    <p className="mt-4 max-w-2xl text-zinc-400">Discover campus communities, send a sponsorship proposal, and record your contribution after the club accepts it. Demo funding is used here—no real payment is collected.</p>
    <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {clubs.map((club) => { const total = summary.get(String(club._id)); return <article key={String(club._id)} className="flex flex-col rounded-3xl border border-white/10 bg-[#121214] p-6">
        <div className="flex items-start justify-between gap-3"><span className="rounded-full bg-yellow-400/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-yellow-300">Campus club</span><span className="text-xs text-zinc-500">{club.city || "India"}</span></div>
        <h2 className="mt-5 text-2xl font-black">{club.name}</h2><p className="mt-2 text-sm text-zinc-400">{club.institution}</p>
        <div className="mt-6 grid grid-cols-2 gap-3 rounded-2xl bg-white/[0.04] p-4"><div><p className="text-xs text-zinc-500">Supporters</p><p className="mt-1 text-xl font-bold">{total?.supporters || 0}</p></div><div><p className="text-xs text-zinc-500">Recorded support</p><p className="mt-1 text-xl font-bold">₹{Number(total?.amount || 0).toLocaleString("en-IN")}</p></div></div>
        <Link href={`/sponsors/connect?club=${club._id}`} className="mt-6 rounded-xl bg-yellow-400 px-5 py-3 text-center text-sm font-black text-black hover:bg-yellow-300">Propose sponsorship</Link>
      </article>; })}
      {!clubs.length && <p className="text-zinc-400">No clubs have joined the marketplace yet.</p>}
    </div>
    <div className="mt-10 flex flex-wrap gap-4 text-sm"><Link className="text-yellow-300 hover:underline" href="/sponsors/my-proposals">Track my proposals →</Link><Link className="text-zinc-400 hover:text-white" href="/sponsors/connect">Submit a proposal →</Link></div>
  </div></main>;
}
