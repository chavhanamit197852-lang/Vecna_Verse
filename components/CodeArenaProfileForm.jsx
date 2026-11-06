"use client";
import { useState } from "react";
import { GitBranch as Github, Code2, Save, Globe2 } from "lucide-react";

export default function CodeArenaProfileForm({ initialLeetCode = null, initialGitHub = null, initialProfile = null, signedIn = false }) {
  const [form, setForm] = useState({
    leetcodeHandle: initialLeetCode?.handle || "", totalSolved: initialLeetCode?.totalSolved || 0,
    easySolved: initialLeetCode?.easySolved || 0, mediumSolved: initialLeetCode?.mediumSolved || 0,
    rating: initialLeetCode?.rating || 0, ranking: initialLeetCode?.ranking || 0,
    githubUsername: initialGitHub?.username || "", publicRepos: initialGitHub?.publicRepos || 0,
    followers: initialGitHub?.followers || 0, contributions: initialGitHub?.contributions || 0,
    city: initialProfile?.city || "", state: initialProfile?.state || "", country: initialProfile?.country || "",
  });
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [leetcodeEvidence, setLeetcodeEvidence] = useState(null);
  const [githubEvidence, setGithubEvidence] = useState(null);
  const input = "w-full rounded-xl border border-white/10 bg-black/25 px-3 py-3 text-sm text-white outline-none focus:border-yellow-400";
  function set(key, value) { setForm(old => ({ ...old, [key]: value })); }

  async function uploadEvidence(file) {
    if (!file) return "";
    const payload = new FormData();
    payload.append("file", file);
    payload.append("folder", "profiles");
    const response = await fetch("/api/upload", { method: "POST", body: payload });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Evidence upload failed");
    return data.url;
  }

  async function submit(e) {
    e.preventDefault(); setBusy(true); setNotice("");
    try {
      const [leetcodeEvidenceUrl, githubEvidenceUrl] = await Promise.all([
        uploadEvidence(leetcodeEvidence), uploadEvidence(githubEvidence),
      ]);
      const response = await fetch("/api/code-arena/profile", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, leetcodeEvidenceUrl, githubEvidenceUrl }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not save profile");
      setNotice("Your coding profile has been saved.");
    } catch (error) { setNotice(error.message); }
    finally { setBusy(false); }
  }

  return (
    <form onSubmit={submit} className="rounded-3xl border border-white/10 bg-[#121214] p-6">
      <div className="flex items-center justify-between gap-3">
        <div><p className="text-xs font-bold uppercase tracking-[.2em] text-yellow-400">Your coding identity</p><h2 className="mt-2 text-2xl font-black">Connect your profiles</h2></div>
        <Save className="text-yellow-400" />
      </div>
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <section>
          <div className="mb-4 flex items-center gap-2"><Code2 className="text-yellow-400" /><h3 className="font-bold">LeetCode</h3></div>
          <div className="grid gap-3">
            <input className={input} placeholder="LeetCode username" value={form.leetcodeHandle} onChange={e => set("leetcodeHandle", e.target.value)} />
            <div className="grid grid-cols-2 gap-2">
              <input type="number" min="0" className={input} placeholder="Total solved" value={form.totalSolved} onChange={e => set("totalSolved", e.target.value)} />
              <input type="number" min="0" className={input} placeholder="Contest rating" value={form.rating} onChange={e => set("rating", e.target.value)} />
              <input type="number" min="0" className={input} placeholder="Global rank" value={form.ranking} onChange={e => set("ranking", e.target.value)} />
              <input type="number" min="0" className={input} placeholder="Easy solved" value={form.easySolved} onChange={e => set("easySolved", e.target.value)} />
              <input type="number" min="0" className={input} placeholder="Medium solved" value={form.mediumSolved} onChange={e => set("mediumSolved", e.target.value)} />
            </div>
            <label className="mt-2 block text-xs text-zinc-400">Upload LeetCode rank screenshot / PDF (optional)
              <input type="file" accept="image/png,image/jpeg,image/webp,application/pdf" onChange={e => setLeetcodeEvidence(e.target.files?.[0] || null)} className="mt-2 block w-full text-xs" />
            </label>
            {initialLeetCode?.evidenceUrl && <a className="text-xs text-yellow-300" href={initialLeetCode.evidenceUrl} target="_blank" rel="noreferrer">View submitted evidence ↗</a>}
          </div>
        </section>
        <section>
          <div className="mb-4 flex items-center gap-2"><Github className="text-yellow-400" /><h3 className="font-bold">GitHub</h3></div>
          <div className="grid gap-3">
            <input className={input} placeholder="GitHub username" value={form.githubUsername} onChange={e => set("githubUsername", e.target.value)} />
            <input type="number" min="0" className={input} placeholder="Public repositories" value={form.publicRepos} onChange={e => set("publicRepos", e.target.value)} />
            <input type="number" min="0" className={input} placeholder="Followers" value={form.followers} onChange={e => set("followers", e.target.value)} />
            <input type="number" min="0" className={input} placeholder="Contributions (optional)" value={form.contributions} onChange={e => set("contributions", e.target.value)} />
            <label className="mt-2 block text-xs text-zinc-400">Upload GitHub profile / stats screenshot (optional)
              <input type="file" accept="image/png,image/jpeg,image/webp,application/pdf" onChange={e => setGithubEvidence(e.target.files?.[0] || null)} className="mt-2 block w-full text-xs" />
            </label>
            {initialGitHub?.evidenceUrl && <a className="text-xs text-yellow-300" href={initialGitHub.evidenceUrl} target="_blank" rel="noreferrer">View submitted evidence ↗</a>}
          </div>
        </section>
        <section className="md:col-span-2">
          <div className="mb-3 flex items-center gap-2"><Globe2 className="text-yellow-400" /><h3 className="font-bold">Your location</h3></div>
          <div className="grid gap-3 sm:grid-cols-3">
            <input className={input} placeholder="City" value={form.city} onChange={e => set("city", e.target.value)} />
            <input className={input} placeholder="State / Province" value={form.state} onChange={e => set("state", e.target.value)} />
            <input className={input} placeholder="Country" value={form.country} onChange={e => set("country", e.target.value)} />
          </div>
        </section>
      </div>
      <p className="mt-5 text-xs leading-5 text-amber-200/70">Statistics are marked self-reported until reviewed. Optional screenshots/PDFs are stored in your profile as supporting evidence; they do not automatically verify a rank. Do not enter private tokens or passwords.</p>
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button disabled={!signedIn || busy} className="rounded-xl bg-yellow-400 px-5 py-3 text-sm font-black text-black disabled:opacity-50">{busy ? "Saving…" : "Save coding profile"}</button>
        {notice && <span className="text-sm text-zinc-300">{notice}</span>}
        {!signedIn && <span className="text-xs text-zinc-500">Sign in to submit your profiles.</span>}
      </div>
    </form>
  );
}
