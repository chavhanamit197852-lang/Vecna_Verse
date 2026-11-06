"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
export default function ClubAdSpotlight({ placement = "HOMEPAGE" }) {
  const [ads, setAds] = useState([]);
  useEffect(() => { fetch(`/api/club-ads/active?placement=${placement}`).then((r) => r.json()).then((d) => setAds(Array.isArray(d) ? d : d.data || [])).catch(() => {}); }, [placement]);
  if (!ads.length) return null;
  async function track(id) { fetch(`/api/club-ads/${id}/click`, { method: "POST", keepalive: true }).catch(() => {}); }
  return <aside className="border-y border-[#263D2D]/10 bg-[#EEF0E5] px-4 py-8 text-[#203326] sm:px-8"><div className="mx-auto max-w-[1400px]"><div className="mb-4 flex items-center justify-between"><div><p className="text-[9px] font-black uppercase tracking-[.2em] text-[#75816D]">Club promotions</p><h2 className="mt-1 text-xl font-black">Discover what campus clubs are building</h2></div><Link href="/clubs" className="text-xs font-bold underline">Explore clubs</Link></div><div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">{ads.map((ad) => <a key={ad._id} href={ad.targetUrl} target="_blank" rel="noreferrer" onClick={() => track(ad._id)} className="group overflow-hidden rounded-2xl border border-[#263D2D]/10 bg-white transition hover:-translate-y-1">{ad.imageUrl && <img src={ad.imageUrl} alt="" className="h-32 w-full object-cover"/>}<div className="p-4"><p className="text-[9px] font-black uppercase tracking-wider text-[#8B7542]">Sponsored · {ad.clubId?.name || "Campus club"}</p><h3 className="mt-2 font-black group-hover:underline">{ad.title}</h3><p className="mt-2 line-clamp-2 text-xs leading-5 text-[#657365]">{ad.body}</p></div></a>)}</div></div></aside>;
}
