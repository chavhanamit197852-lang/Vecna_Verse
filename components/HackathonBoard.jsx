"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { MapPin, Users, Code2, Globe2, MessageCircle, ClipboardList, Search } from "lucide-react";

const emptyForm = { title: "", description: "", skills: "", hackathonName: "", teamSize: "4", workMode: "REMOTE", city: "", state: "", country: "" };

export default function HackathonBoard({ posts = [], chatTeamIds = [], signedIn = false }) {
  const [form, setForm] = useState(emptyForm);
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [search, setSearch] = useState("");
  const [mode, setMode] = useState("ALL");
  const [country, setCountry] = useState("ALL");
  const [stateFilter, setStateFilter] = useState("ALL");
  const [myApplications, setMyApplications] = useState([]);
  const [showApplications, setShowApplications] = useState(false);
  const [reviewing, setReviewing] = useState({});
  const [applications, setApplications] = useState({});
  const [reviewBusy, setReviewBusy] = useState("");

  const countries = useMemo(() => [...new Set(posts.map(p => p.location?.country).filter(Boolean))].sort(), [posts]);
  const states = useMemo(() => [...new Set(posts.filter(p => country === "ALL" || p.location?.country === country).map(p => p.location?.state).filter(Boolean))].sort(), [posts, country]);
  const filtered = posts.filter(p => {
    const haystack = [p.title, p.description, p.hackathonName, ...(p.skills || []), p.authorId?.name, p.location?.city, p.location?.state, p.location?.country].join(" ").toLowerCase();
    return haystack.includes(search.toLowerCase()) && (mode === "ALL" || p.workMode === mode) && (country === "ALL" || p.location?.country === country) && (stateFilter === "ALL" || p.location?.state === stateFilter);
  });

  async function createPost(e) {
    e.preventDefault(); setBusy(true); setNotice("");
    try {
      const response = await fetch("/api/communities/team-posts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, skills: form.skills.split(",").map(s => s.trim()).filter(Boolean), teamSize: Number(form.teamSize) }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not publish team request");
      window.location.reload();
    } catch (error) { setNotice(error.message); }
    finally { setBusy(false); }
  }

  async function loadApplications(postId) {
    if (reviewing[postId]) { setReviewing(v => ({ ...v, [postId]: false })); return; }
    setReviewing(v => ({ ...v, [postId]: true }));
    const response = await fetch(`/api/communities/team-posts/${postId}/applications`);
    const data = await response.json();
    if (response.ok) setApplications(v => ({ ...v, [postId]: data.applications || [] }));
    else setNotice(data.error || "Could not load applications");
  }

  async function review(postId, applicationId, action) {
    setReviewBusy(applicationId); setNotice("");
    try {
      const response = await fetch(`/api/communities/team-posts/${postId}/applications`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ applicationId, action }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not update application");
      setApplications(v => ({ ...v, [postId]: v[postId].map(a => String(a._id) === applicationId ? { ...a, status: data.status } : a) }));
      if (data.chatUrl) window.location.reload();
    } catch (error) { setNotice(error.message); }
    finally { setReviewBusy(""); }
  }

  async function loadMyApplications() {
    setShowApplications(v => !v);
    if (myApplications.length) return;
    const response = await fetch("/api/communities/team-posts/my-applications");
    const data = await response.json();
    if (response.ok) setMyApplications(data.applications || []);
  }

  return <section className="mt-8 space-y-7">
    <div className="grid gap-5 lg:grid-cols-[1.05fr_.95fr]">
      <form onSubmit={createPost} className="rounded-3xl border border-white/10 bg-[#121214] p-6">
        <div className="flex items-center gap-2 text-yellow-400"><Users size={18}/><p className="text-xs font-bold uppercase tracking-[.2em]">Create a team</p></div>
        <h2 className="mt-2 text-2xl font-black">Find your next teammate.</h2>
        <p className="mt-2 text-sm text-zinc-400">Post your project and invite students from any state or country.</p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <input required minLength={5} maxLength={120} className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none focus:border-yellow-400 sm:col-span-2" placeholder="Team request title" value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/>
          <input className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none focus:border-yellow-400 sm:col-span-2" placeholder="Hackathon name (optional)" value={form.hackathonName} onChange={e=>setForm({...form,hackathonName:e.target.value})}/>
          <input required className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none focus:border-yellow-400 sm:col-span-2" placeholder="Skills needed: React, Python, UI/UX…" value={form.skills} onChange={e=>setForm({...form,skills:e.target.value})}/>
          <select className="rounded-xl border border-white/10 bg-[#1b1b1f] px-4 py-3 text-sm" value={form.teamSize} onChange={e=>setForm({...form,teamSize:e.target.value})}>{[2,3,4,5,6,7,8,10].map(n=><option key={n} value={n}>{n} members total</option>)}</select>
          <select className="rounded-xl border border-white/10 bg-[#1b1b1f] px-4 py-3 text-sm" value={form.workMode} onChange={e=>setForm({...form,workMode:e.target.value})}><option value="REMOTE">Remote / worldwide</option><option value="HYBRID">Hybrid</option><option value="IN_PERSON">In person</option></select>
          <input className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm" placeholder="City (optional)" value={form.city} onChange={e=>setForm({...form,city:e.target.value})}/>
          <input className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm" placeholder="State / Province" value={form.state} onChange={e=>setForm({...form,state:e.target.value})}/>
          <input className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm sm:col-span-2" placeholder="Country (e.g. India, USA)" value={form.country} onChange={e=>setForm({...form,country:e.target.value})}/>
          <textarea required minLength={15} rows={3} className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none focus:border-yellow-400 sm:col-span-2" placeholder="Describe the idea, current team and the people you need…" value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/>
          <button disabled={!signedIn || busy} className="rounded-xl bg-yellow-400 px-5 py-3 text-sm font-black text-black disabled:opacity-50 sm:col-span-2">{busy ? "Publishing…" : "Publish team request"}</button>
          {!signedIn && <p className="text-xs text-zinc-500 sm:col-span-2">Sign in is required to create a team or apply.</p>}
          {notice && <p className="text-sm text-yellow-300 sm:col-span-2">{notice}</p>}
        </div>
      </form>
      <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#19191c] to-[#101012] p-6">
        <p className="text-xs font-bold uppercase tracking-[.2em] text-yellow-400">Team workflow</p><h2 className="mt-3 text-2xl font-black">From request to private team room.</h2>
        <ol className="mt-6 space-y-5">{[["01","Publish your team request","Set skills, team size and remote or in-person preference."],["02","Review applications","The creator accepts or rejects incoming requests."],["03","Team chat unlocks","Accepting an applicant creates a private group chat for accepted members."]].map(([n,t,d])=><li key={n} className="flex gap-4"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-yellow-400/10 text-xs font-black text-yellow-400">{n}</span><div><h3 className="font-bold">{t}</h3><p className="mt-1 text-sm leading-6 text-zinc-400">{d}</p></div></li>)}</ol>
      </div>
    </div>

    <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[.2em] text-yellow-400">Open opportunities</p><h2 className="mt-2 text-3xl font-black">Find your team</h2></div><button disabled={!signedIn} onClick={loadMyApplications} className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm font-bold hover:border-yellow-400"><ClipboardList size={16}/> My applications</button></div>
    {showApplications && <div className="rounded-2xl border border-white/10 bg-[#121214] p-5"><h3 className="font-bold">Your applications</h3>{myApplications.length ? myApplications.map(a=><div key={a._id} className="flex flex-wrap items-center justify-between gap-3 border-b border-white/5 py-3 text-sm"><div><p className="font-semibold">{a.postId?.title || "Team request"}</p><p className="text-xs text-zinc-500">{a.status}</p></div>{a.status === "ACCEPTED" && <Link className="text-yellow-400" href={`/communities/teams/${a.postId?._id}/chat`}>Open team chat →</Link>}</div>) : <p className="mt-2 text-sm text-zinc-500">No applications yet. Apply to a team to see updates here.</p>}</div>}

    <div className="grid gap-3 md:grid-cols-[1fr_180px_180px_180px]"><div className="relative"><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={17}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search skills, hackathons, locations…" className="w-full rounded-xl border border-white/10 bg-[#121214] py-3 pl-11 pr-4 text-sm outline-none focus:border-yellow-400"/></div><select value={mode} onChange={e=>setMode(e.target.value)} className="rounded-xl border border-white/10 bg-[#121214] px-3 py-3 text-sm"><option value="ALL">All work modes</option><option value="REMOTE">Remote</option><option value="HYBRID">Hybrid</option><option value="IN_PERSON">In person</option></select><select value={country} onChange={e=>{setCountry(e.target.value);setStateFilter("ALL")}} className="rounded-xl border border-white/10 bg-[#121214] px-3 py-3 text-sm"><option value="ALL">All countries</option>{countries.map(c=><option key={c}>{c}</option>)}</select><select value={stateFilter} onChange={e=>setStateFilter(e.target.value)} className="rounded-xl border border-white/10 bg-[#121214] px-3 py-3 text-sm"><option value="ALL">All states</option>{states.map(s=><option key={s}>{s}</option>)}</select></div>

    <div className="grid gap-4 lg:grid-cols-2">{filtered.map(post=>{const isOwner = post.isOwner; const hasChat = chatTeamIds.includes(String(post._id)); return <article key={post._id} className="rounded-3xl border border-white/10 bg-[#121214] p-6"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-wider text-yellow-400">{post.hackathonName || "Open team"}</p><h3 className="mt-2 text-xl font-black">{post.title}</h3><p className="mt-1 text-xs text-zinc-500">By {post.authorId?.name || "Student"} · {[post.authorId?.city,post.authorId?.state,post.authorId?.country].filter(Boolean).join(", ") || post.authorId?.college || "Student builder"}</p></div><span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-bold text-emerald-300">{post.openPositions} spots</span></div><p className="mt-4 text-sm leading-6 text-zinc-400">{post.description}</p><div className="mt-4 flex flex-wrap gap-2">{(post.skills || []).map(s=><span key={s} className="rounded-full bg-white/5 px-3 py-1 text-xs text-zinc-300">{s}</span>)}</div><div className="mt-5 flex flex-wrap gap-4 border-t border-white/5 pt-4 text-xs text-zinc-400"><span className="inline-flex items-center gap-1"><Globe2 size={14}/>{post.workMode || "REMOTE"}</span><span className="inline-flex items-center gap-1"><MapPin size={14}/>{[post.location?.city,post.location?.state,post.location?.country].filter(Boolean).join(", ") || "Location flexible"}</span><span className="inline-flex items-center gap-1"><Users size={14}/>{post.teamSize} total</span></div>
      {hasChat && <Link href={`/communities/teams/${post._id}/chat`} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-yellow-400 px-4 py-2.5 text-sm font-black text-black"><MessageCircle size={16}/> Open team chat</Link>}
      {isOwner ? <div className="mt-4"><button onClick={()=>loadApplications(post._id)} className="rounded-xl border border-white/10 px-4 py-2.5 text-sm font-bold hover:border-yellow-400">Review applications</button>{reviewing[post._id] && <div className="mt-3 space-y-3 rounded-2xl bg-black/20 p-4">{(applications[post._id] || []).length ? applications[post._id].map(a=><div key={a._id} className="flex flex-wrap items-start justify-between gap-3 border-b border-white/5 pb-3"><div className="min-w-0 flex-1"><p className="font-bold">{a.applicantId?.name || "Student"} <span className="ml-2 text-xs font-normal text-zinc-500">{a.status}</span></p><p className="mt-1 text-xs text-zinc-400">{[a.applicantId?.city,a.applicantId?.state,a.applicantId?.country,a.applicantId?.college].filter(Boolean).join(" · ")}</p><p className="mt-2 text-sm text-zinc-300">{a.message}</p></div>{a.status === "PENDING" && <div className="flex gap-2"><button disabled={reviewBusy===a._id} onClick={()=>review(post._id,a._id,"ACCEPT")} className="rounded-lg bg-emerald-400 px-3 py-2 text-xs font-bold text-black">Accept</button><button disabled={reviewBusy===a._id} onClick={()=>review(post._id,a._id,"REJECT")} className="rounded-lg bg-white/10 px-3 py-2 text-xs font-bold">Reject</button></div>}</div>) : <p className="text-sm text-zinc-500">No applications yet.</p>}</div>}</div> : signedIn && <ApplyButton postId={post._id}/>}
    </article>})}</div>
    {!filtered.length && <div className="rounded-3xl border border-dashed border-white/10 py-16 text-center text-sm text-zinc-500">No open teams match these filters yet.</div>}
  </section>;
}

function ApplyButton({ postId }) {
  const [message, setMessage] = useState(""); const [open, setOpen] = useState(false); const [state, setState] = useState(""); const [busy, setBusy] = useState(false);
  async function submit(e) { e.preventDefault(); setBusy(true); setState(""); try { const response = await fetch(`/api/communities/team-posts/${postId}/apply`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message }) }); const data = await response.json(); if (!response.ok) throw new Error(data.error || "Could not apply"); setState("Application sent"); setOpen(false); } catch (error) { setState(error.message); } finally { setBusy(false); } }
  return <div className="mt-4">{!open ? <button onClick={()=>setOpen(true)} className="rounded-xl border border-yellow-400/30 px-4 py-2.5 text-sm font-bold text-yellow-300 hover:bg-yellow-400 hover:text-black">Apply to join</button> : <form onSubmit={submit} className="space-y-2"><textarea required minLength={10} maxLength={1000} value={message} onChange={e=>setMessage(e.target.value)} placeholder="Introduce yourself, your skills and why you want to join…" className="w-full rounded-xl border border-white/10 bg-black/30 p-3 text-sm"/><div className="flex gap-2"><button disabled={busy} className="rounded-lg bg-yellow-400 px-4 py-2 text-xs font-black text-black">{busy ? "Sending…" : "Send application"}</button><button type="button" onClick={()=>setOpen(false)} className="rounded-lg bg-white/10 px-4 py-2 text-xs">Cancel</button></div></form>}{state && <p className="mt-2 text-xs text-zinc-400">{state}</p>}</div>;
}
