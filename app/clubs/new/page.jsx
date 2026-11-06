import { redirect } from "next/navigation";
import { auth } from "@/auth";
import NewClubForm from "@/components/NewClubForm";

export const dynamic = "force-dynamic";

export default async function NewClubPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  return (
    <main className="min-h-screen bg-[#09090b] px-5 py-12 text-white">
      <div className="mx-auto max-w-xl">
        <p className="text-xs font-bold uppercase tracking-[.2em] text-yellow-400">Clubs</p>
        <h1 className="mt-3 text-3xl font-black">Create a club</h1>
        <p className="mt-2 text-sm text-zinc-400">You become the Club Admin. You can add committee members and publish events afterwards.</p>
        <NewClubForm />
      </div>
    </main>
  );
}
