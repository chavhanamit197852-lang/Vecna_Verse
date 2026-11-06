import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/db";
import Club from "@/models/Club";
import ClubMember from "@/models/ClubMember";
import ClubScannerView from "@/components/ClubScannerView";
import { ScanLine } from "lucide-react";

export default async function ClubScannerPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  await dbConnect();
  const cookieStore = await cookies();
  const activeClubId = cookieStore.get("activeClubId")?.value;
  if (!activeClubId && session.user.role !== "ADMIN") redirect("/clubs");
  const club = activeClubId ? await Club.findById(activeClubId).lean() : null;
  if (activeClubId && !club) redirect("/clubs");
  if (club && session.user.role !== "ADMIN") {
    const membership = await ClubMember.findOne({ clubId: club._id, userId: session.user.id, status: "ACTIVE" }).lean();
    if (!membership) redirect("/dashboard");
  }
  return <div className="p-6 md:p-10"><div className="mx-auto max-w-4xl space-y-8"><header className="text-center"><div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-yellow-400 text-black"><ScanLine size={32}/></div><h1 className="text-3xl font-black">Event Scanner</h1><p className="mt-2 text-sm text-zinc-400">{club?.name || "Platform event scanner"} · Scan QR tickets to verify attendance.</p></header><ClubScannerView clubName={club?.name || "Platform"}/></div></div>;
}

export const dynamic = "force-dynamic";
