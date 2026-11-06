"use client";

import { useEffect, useState } from "react";
import { ChevronsUpDown, Check } from "lucide-react";

export default function ClubSwitcher() {
  const [clubs, setClubs] = useState([]);
  const [activeClub, setActiveClub] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    fetch("/api/clubs/mine")
      .then((r) => r.json())
      .then((data) => {
        setClubs(data);
        if (data.length > 0) {
          const savedId = localStorage.getItem("activeClubId");
          const selected = data.find((club) => club._id === savedId) || data[0];
          setActiveClub(selected);
          localStorage.setItem("activeClubId", selected._id);
          document.cookie = `activeClubId=${selected._id}; path=/; max-age=2592000; samesite=lax`;
        }
      });
  }, []);

  function selectClub(club) {
    setActiveClub(club);
    localStorage.setItem("activeClubId", club._id);
    document.cookie = `activeClubId=${club._id}; path=/; max-age=2592000; samesite=lax`;
    setIsOpen(false);
    // Refresh the page so server components fetch new club data
    window.location.reload(); 
  }

  if (!activeClub) return null;

  return (
    <div className="relative px-4 pb-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-[#121214] p-3 text-left transition-colors hover:bg-white/5"
      >
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-yellow-400">
            {activeClub.myRole} ACCESS
          </p>
          <p className="mt-0.5 text-sm font-bold text-white line-clamp-1">
            {activeClub.name}
          </p>
        </div>
        <ChevronsUpDown size={16} className="text-zinc-500" />
      </button>

      {isOpen && clubs.length > 1 && (
        <div className="absolute left-4 right-4 top-full z-50 mt-1 overflow-hidden rounded-xl border border-white/10 bg-[#121214] shadow-2xl">
          {clubs.map((c) => (
            <button
              key={c._id}
              onClick={() => selectClub(c)}
              className="flex w-full items-center justify-between px-4 py-3 text-left text-sm text-zinc-300 hover:bg-white/5 hover:text-white"
            >
              <div>
                <p className="font-semibold">{c.name}</p>
                <p className="text-[10px] text-zinc-500">{c.myRole}</p>
              </div>
              {activeClub._id === c._id && <Check size={16} className="text-yellow-400" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}