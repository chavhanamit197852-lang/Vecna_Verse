import { dbConnect } from "@/lib/db";
import { auth } from "@/auth";
import Link from "next/link";
import Club from "@/models/Club";
import SponsorConnectForm from "@/components/SponsorConnectForm";

export default async function SponsorConnectPage({ searchParams }) {
  const params = await searchParams;
  const initialClubId = params?.club || "";
  await dbConnect();
  const [clubs, session] = await Promise.all([
    Club.find().select("name slug institution city").sort({ name: 1 }).lean(),
    auth(),
  ]);
  return <main className="min-h-screen bg-[#09090b] px-5 py-14 text-white"><div className="mx-auto max-w-4xl"><p className="text-xs font-bold uppercase tracking-[.2em] text-yellow-400">Partnerships</p><h1 className="mt-3 text-4xl font-black">Connect with campus clubs</h1><p className="mt-3 max-w-2xl text-zinc-400">Send a sponsorship proposal directly to a club. The club's authorized admin can review and respond.</p>{session?.user ? <SponsorConnectForm clubs={JSON.parse(JSON.stringify(clubs.map((club) => ({ ...club, _id: String(club._id) }))))} initialClubId={initialClubId} /> : <div className="mt-8 rounded-2xl border border-white/10 bg-[#121214] p-6"><p className="text-zinc-300">Sign in to send a sponsorship proposal to a campus club.</p><Link href="/login" className="mt-4 inline-block rounded-xl bg-yellow-400 px-5 py-3 text-sm font-bold text-black">Sign in to continue</Link></div>}</div></main>;
}

export const dynamic = "force-dynamic";
