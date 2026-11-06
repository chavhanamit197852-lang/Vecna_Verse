import Link from "next/link";

export const metadata = { title: "Privacy Policy · EventVerse" };

export default function Page() {
  return (
    <main className="min-h-screen bg-[#09090b] px-5 py-14 text-white">
      <div className="mx-auto max-w-2xl">
        <Link href="/" className="text-sm text-zinc-400 hover:text-yellow-400">← Back to EventVerse</Link>
        <h1 className="mt-6 text-3xl font-black">Privacy Policy</h1>
        <p className="mt-4 text-sm leading-7 text-zinc-400">We store your name, email, college, city, skills and coding-profile links to run your account, event tickets, clubs and hackathon teams. Passwords are hashed. Team chats are visible only to accepted team members.</p>
        <p className="mt-3 text-sm leading-7 text-zinc-400">Replace this placeholder with your institution&apos;s privacy policy, data-retention and deletion process before launch.</p>
      </div>
    </main>
  );
}
