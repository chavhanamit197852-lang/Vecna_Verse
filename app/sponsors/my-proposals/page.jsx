import { redirect } from "next/navigation";
import { auth } from "@/auth";
import SponsorProposalDashboard from "@/components/SponsorProposalDashboard";
export default async function MySponsorProposalsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  return <main className="min-h-screen bg-[#09090b] px-5 py-14 text-white"><div className="mx-auto max-w-4xl"><p className="text-xs font-bold uppercase tracking-[.2em] text-yellow-400">Sponsor workspace</p><h1 className="mt-2 text-4xl font-black">My proposals & contributions</h1><p className="mt-3 text-zinc-400">Track club responses and record demo contributions for accepted proposals.</p><SponsorProposalDashboard /></div></main>;
}

export const dynamic = "force-dynamic";
