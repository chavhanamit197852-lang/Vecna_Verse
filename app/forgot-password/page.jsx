import Link from "next/link";

export const metadata = { title: "Forgot your password? · EventVerse" };

export default function Page() {
  return (
    <main className="min-h-screen bg-[#09090b] px-5 py-14 text-white">
      <div className="mx-auto max-w-2xl">
        <Link href="/" className="text-sm text-zinc-400 hover:text-yellow-400">← Back to EventVerse</Link>
        <h1 className="mt-6 text-3xl font-black">Forgot your password?</h1>
        <p className="mt-4 text-sm leading-7 text-zinc-400">Self-service password reset by email is not enabled yet. Please contact your club admin or a platform administrator to have your password reset, or sign in with Google/GitHub if you linked one.</p>
        <Link href="/login" className="mt-6 inline-block rounded-xl bg-yellow-400 px-5 py-3 text-sm font-bold text-black">Back to sign in</Link>
      </div>
    </main>
  );
}
