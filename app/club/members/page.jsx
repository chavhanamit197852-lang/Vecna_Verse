"use client";

import { useEffect, useState } from "react";
import { UserPlus, Trash2, Shield, User, Crown, Users } from "lucide-react";

export default function ClubMembersPage() {
  const [members, setMembers] = useState([]);
  const [clubId, setClubId] = useState(null);
  const [myRole, setMyRole] = useState(null);
  const [email, setEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("MEMBER");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    async function initialize() {
      try {
        const response = await fetch("/api/clubs/mine");
        const clubs = await response.json();
        if (!active || !Array.isArray(clubs)) return;
        const savedId = localStorage.getItem("activeClubId");
        const manageableClubs = clubs.filter((club) => club.myRole === "ADMIN" || club.myRole === "COMMITTEE");
        const selected = manageableClubs.find((club) => club._id === savedId) || manageableClubs[0];
        if (!selected) { setError("No club management access found."); return; }
        setClubId(selected._id);
        setMyRole(selected.myRole);
        localStorage.setItem("activeClubId", selected._id);
        document.cookie = `activeClubId=${selected._id}; path=/; max-age=2592000; samesite=lax`;
        const memberResponse = await fetch(`/api/clubs/${selected._id}/members`);
        const data = await memberResponse.json();
        if (!active) return;
        if (memberResponse.ok && Array.isArray(data)) setMembers(data);
        else setError(data.error || "Failed to load members");
      } catch { if (active) setError("Could not load club members."); }
    }
    initialize();
    return () => { active = false; };
  }, []);

  const loadMembers = (id) =>
    fetch(`/api/clubs/${id}/members`).then(r => r.json()).then(setMembers);

  async function addMember(e) {
    e.preventDefault();
    setError("");
    const res = await fetch(`/api/clubs/${clubId}/members`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, role: inviteRole }),
    });
    const data = await res.json();
    if (!res.ok) return setError(data.error);
    setEmail("");
    loadMembers(clubId);
  }


  async function reviewMember(userId, action) {
    const res = await fetch(`/api/clubs/${clubId}/members`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, action }),
    });
    const data = await res.json();
    if (!res.ok) return setError(data.error || "Could not update request");
    loadMembers(clubId);
  }

  async function removeMember(userId) {
    if (!confirm("Remove this member from the club?")) return;
    const res = await fetch(`/api/clubs/${clubId}/members?userId=${userId}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      const data = await res.json();
      return alert(data.error);
    }
    loadMembers(clubId);
  }

  // Only ADMIN can invite COMMITTEE or ADMIN
  const canInviteCommittee = myRole === "ADMIN";
  const canInviteAdmin = false;

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-8">
       <header>
        <h1 className="text-3xl font-black text-white">Club Members</h1>
        <p className="mt-2 text-sm text-zinc-400">
          Manage members for this club. Your access level: <span className="font-bold text-yellow-400">{myRole}</span>
        </p>
      </header>

      <form onSubmit={addMember} className="flex flex-wrap gap-3 rounded-2xl border border-white/5 bg-[#121214] p-4">
        <input
          type="email" required value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="student@campus.edu"
          className="flex-1 min-w-[200px] rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white"
        />
        <select
          value={inviteRole}
          onChange={e => setInviteRole(e.target.value)}
          className="rounded-xl border border-white/10 bg-[#18181b] px-4 py-3 text-sm text-white"
        >
          <option value="MEMBER">Member</option>
          {canInviteCommittee && <option value="COMMITTEE">Committee</option>}
          {canInviteAdmin && <option value="ADMIN">Co-Admin</option>}
        </select>
        <button className="flex items-center gap-2 rounded-xl bg-yellow-400 px-6 py-3 text-sm font-bold text-black">
          <UserPlus size={16} /> Add
        </button>
      </form>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <div className="space-y-3">
        {members.map((m) => (
          <div key={m._id} className="flex items-center justify-between rounded-2xl border border-white/5 bg-[#121214] p-4">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-400/10 font-bold text-yellow-400">
                {m.userId?.name?.charAt(0) || "U"}
              </div>
              <div>
                <p className="font-bold text-white">{m.userId?.name}</p>
                <p className="text-xs text-zinc-500">{m.userId?.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {m.status === "PENDING" && m.paymentStatus !== "PENDING" && myRole === "ADMIN" && (
                <div className="flex gap-2">
                  <button onClick={() => reviewMember(m.userId._id, "APPROVE")} className="text-xs font-bold text-emerald-400">Approve</button>
                  <button onClick={() => reviewMember(m.userId._id, "REJECT")} className="text-xs font-bold text-red-400">Reject</button>
                </div>
              )}
              <span className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold uppercase ${
                m.role === "ADMIN" ? "bg-yellow-400/10 text-yellow-400"
                : m.role === "COMMITTEE" ? "bg-blue-500/10 text-blue-400"
                : "bg-white/5 text-zinc-400"
              }`}>
                {m.role === "ADMIN" && <Crown size={12} />}
                {m.role === "COMMITTEE" && <Shield size={12} />}
                {m.role === "MEMBER" && <User size={12} />}
                {m.role} · {m.status}
              </span>

              {/* Only show delete if user has permission */}
              {m.userId?._id !== m.addedBy && (
                (myRole === "ADMIN" && m.role !== "ADMIN") ||
                (myRole === "COMMITTEE" && m.role === "MEMBER") ||
                (myRole === "ADMIN" && m.role === "ADMIN")
              ) && (
                <button onClick={() => removeMember(m.userId._id)} className="text-red-400 hover:text-red-300">
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}