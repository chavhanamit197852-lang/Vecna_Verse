"use client";
import { useEffect } from "react";

export default function EventVerseFX() {
  useEffect(() => {
    // 1. Scroll reveal via IntersectionObserver
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    document.querySelectorAll(".reveal-node").forEach((n) => observer.observe(n));

    // 2. Spotlight hover on cards
    const cleanups = [];
    document.querySelectorAll(".spotlight-card").forEach((card) => {
      const onMove = (e) => {
        const r = card.getBoundingClientRect();
        card.style.setProperty("--mouse-x", `${e.clientX - r.left}px`);
        card.style.setProperty("--mouse-y", `${e.clientY - r.top}px`);
      };
      card.addEventListener("mousemove", onMove);
      cleanups.push(() => card.removeEventListener("mousemove", onMove));
    });

    // 3. Hero parallax (uses `translate` so `rotate-*` classes stay intact)
    const hero = document.querySelector("[data-hero]");
    const tickets = document.querySelectorAll(".hero-ticket");
    let onHeroMove, onHeroLeave;
    if (hero && tickets.length) {
      onHeroMove = (e) => {
        const x = (window.innerWidth / 2 - e.clientX) / 60;
        const y = (window.innerHeight / 2 - e.clientY) / 60;
        tickets.forEach((t, i) => {
          const speed = i === 0 ? 1 : 1.4;
          t.style.setProperty("--tx", `${x * speed}px`);
          t.style.setProperty("--ty", `${y * speed}px`);
        });
      };
      onHeroLeave = () => {
        tickets.forEach((t) => {
          t.style.setProperty("--tx", "0px");
          t.style.setProperty("--ty", "0px");
        });
      };
      hero.addEventListener("mousemove", onHeroMove);
      hero.addEventListener("mouseleave", onHeroLeave);
    }

    return () => {
      observer.disconnect();
      cleanups.forEach((fn) => fn());
      if (hero && onHeroMove) hero.removeEventListener("mousemove", onHeroMove);
      if (hero && onHeroLeave) hero.removeEventListener("mouseleave", onHeroLeave);
    };
  }, []);

  return null;
}