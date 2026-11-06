import Link from "next/link";

export const metadata = { title: "Terms of Service · EventVerse" };

export default function Page() {
  return (
    <main className="min-h-screen bg-[#09090b] px-5 py-14 text-white">
      <div className="mx-auto max-w-2xl">
        <Link href="/" className="text-sm text-zinc-400 hover:text-yellow-400">← Back to EventVerse</Link>
        <h1 className="mt-6 text-3xl font-black">Terms of Service</h1>
        <p className="mt-4 text-sm leading-7 text-zinc-400">EventVerse is a campus events and community platform. By using it you agree to provide accurate information, respect other students and organizers, and not misuse tickets, QR codes or team chats.</p>
        <p className="mt-3 text-sm leading-7 text-zinc-400">Payments shown in this build are demo payments only — no real money is collected. AICTE points are an activity tracker and not an official certification. Replace this placeholder with your institution&apos;s legal text before launch.</p>
      </div>
    </main>
  );
}
