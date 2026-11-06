
"use client";

import { useState } from "react";
import {
  Award, BookOpen, FileBadge, Plus, ExternalLink, Sparkles,
  Upload, Clock3, UserRound, Mail, Phone, Loader2,
  CheckCircle2, CalendarDays, ArrowUpRight
} from "lucide-react";

const tabs = [
  { id: "achievements", label: "ACHIEVEMENTS", icon: Award },
  { id: "certificates", label: "CERTIFICATES", icon: FileBadge },
  { id: "notes", label: "EVENT JOURNAL", icon: BookOpen },
];

export default function Portfolio({
  achievements = [],
  certificates = [],
  notes = [],
  events = [],
}) {
  const [tab, setTab] = useState("achievements");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e, url) {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const response = await fetch(url, {
        method: "POST",
        body: new FormData(e.currentTarget),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || "Something went wrong");
        return;
      }

      window.location.reload();
    } catch (error) {
      console.error(error);
      setMessage("Unable to save. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const counts = {
    achievements: achievements.length,
    certificates: certificates.length,
    notes: notes.length,
  };

  const total = Object.values(counts).reduce((a, b) => a + b, 0);

  return (
    <main className="relative mt-8 space-y-6 overflow-hidden bg-[#e9e9e7] p-4 text-[#171717] sm:p-6">

      

      {/* STATS */}
     

  
       

      {/* CONTENT */}
      <section className="grid items-start gap-5 lg:grid-cols-[0.85fr_1.15fr]">

        {/* ACHIEVEMENTS FORM */}
        {tab === "achievements" && (
          <>
            <FormPanel
              number="01"
              title="New achievement"
              subtitle="REGISTER A NEW MILESTONE"
              onSubmit={(e) => submit(e, "/api/portfolio/achievements")}
              loading={loading}
              button="SAVE ACHIEVEMENT"
            >
              <Field label="ACHIEVEMENT TITLE">
                <input name="title" required placeholder="e.g. Hackathon Winner" className="industrial-input" />
              </Field>

              <Field label="ORGANIZATION / ISSUER">
                <input name="issuer" placeholder="Organization name" className="industrial-input" />
              </Field>

              <Field label="DATE">
                <input type="date" name="date" className="industrial-input" />
              </Field>

              <Field label="PROOF URL">
                <input type="url" name="proofUrl" placeholder="https://" className="industrial-input" />
              </Field>

              <Field label="DESCRIPTION">
                <textarea name="notes" rows={4} placeholder="Describe your achievement..." className="industrial-input resize-y" />
              </Field>
            </FormPanel>

            <RecordSection title="Achievement archive" count={achievements.length}>
              {achievements.map((item) => (
                <article key={item._id} className="industrial-record">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="mb-3 inline-block bg-[#d5f34b] px-2 py-1 font-mono text-[9px] font-bold">
                        VERIFIED RECORD
                      </span>
                      <h3 className="text-lg font-black">{item.title}</h3>
                      <p className="mt-1 text-sm text-[#777]">{item.issuer || "Independent achievement"}</p>
                    </div>
                    <Award size={23} />
                  </div>

                  {item.notes && <p className="mt-4 text-sm leading-6 text-[#666]">{item.notes}</p>}

                  {item.date && (
                    <p className="mt-4 flex items-center gap-2 font-mono text-[10px] text-[#777]">
                      <Clock3 size={13} />
                      {new Date(item.date).toLocaleDateString()}
                    </p>
                  )}

                  {item.proofUrl && (
                    <a href={item.proofUrl} target="_blank" rel="noreferrer"
                      className="mt-4 inline-flex items-center gap-2 border-b border-black pb-1 font-mono text-[10px] font-bold">
                      VIEW PROOF <ExternalLink size={13} />
                    </a>
                  )}
                </article>
              ))}
              {achievements.length === 0 && <EmptyState text="NO ACHIEVEMENTS REGISTERED" />}
            </RecordSection>
          </>
        )}

        {/* CERTIFICATES FORM */}
        {tab === "certificates" && (
          <>
            <FormPanel
              number="02"
              title="New certificate"
              subtitle="UPLOAD YOUR CREDENTIAL"
              onSubmit={(e) => submit(e, "/api/portfolio/certificates")}
              loading={loading}
              button="UPLOAD CERTIFICATE"
            >
              <Field label="CERTIFICATE NAME">
                <input name="title" required placeholder="Certificate title" className="industrial-input" />
              </Field>

              <Field label="ISSUED BY">
                <input name="issuer" placeholder="Organization / Platform" className="industrial-input" />
              </Field>

              <Field label="ISSUE DATE">
                <input type="date" name="issuedAt" className="industrial-input" />
              </Field>

              <Field label="CERTIFICATE FILE">
                <div className="border border-dashed border-[#aaa] bg-[#e6e6e3] p-7 text-center transition hover:border-[#9ab52e]">
                  <Upload size={28} className="mx-auto mb-3" />
                  <p className="text-sm font-bold">UPLOAD DOCUMENT</p>
                  <p className="mt-2 font-mono text-[10px] text-[#777]">
                    PDF / PNG / JPG
                  </p>
                  <input
                    type="file"
                    name="file"
                    required
                    accept="application/pdf,image/png,image/jpeg"
                    className="mt-5 block w-full text-xs"
                  />
                </div>
              </Field>
            </FormPanel>

            <RecordSection title="Certificate archive" count={certificates.length}>
              {certificates.map((item) => (
                <article key={item._id} className="industrial-record flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center bg-[#d5f34b]">
                    <FileBadge size={22} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-black">{item.title}</h3>
                    <p className="mt-1 text-xs text-[#777]">{item.issuer || "Certificate"}</p>
                    {item.issuedAt && (
                      <p className="mt-2 font-mono text-[10px] text-[#888]">
                        {new Date(item.issuedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  {item.fileUrl && (
                    <a href={item.fileUrl} target="_blank" rel="noreferrer"
                      className="flex h-10 w-10 items-center justify-center border border-[#aaa] hover:bg-[#d5f34b]">
                      <ExternalLink size={16} />
                    </a>
                  )}
                </article>
              ))}
              {certificates.length === 0 && <EmptyState text="NO CERTIFICATES UPLOADED" />}
            </RecordSection>
          </>
        )}

        {/* EVENT NOTES FORM */}
        {tab === "notes" && (
          <>
            <FormPanel
              number="03"
              title="New event note"
              subtitle="DOCUMENT YOUR EXPERIENCE"
              onSubmit={(e) => submit(e, "/api/portfolio/notes")}
              loading={loading}
              button="SAVE EVENT NOTE"
            >
              <Field label="SELECT EVENT">
                <select name="eventId" required defaultValue="" className="industrial-input">
                  <option value="" disabled>Choose participated event</option>
                  {events.map((event) => (
                    <option key={event._id} value={event._id}>{event.title}</option>
                  ))}
                </select>
              </Field>

              <Field label="CONTACT NAME">
                <input name="contactName" placeholder="Full name" className="industrial-input" />
              </Field>

              <Field label="CONTACT EMAIL">
                <input name="contactEmail" type="email" placeholder="Email address" className="industrial-input" />
              </Field>

              <Field label="CONTACT PHONE">
                <input name="contactPhone" placeholder="Phone number" className="industrial-input" />
              </Field>

              <Field label="SUMMARY / KEY TAKEAWAYS">
                <textarea name="summary" rows={5} required placeholder="What did you learn? What did you discuss?" className="industrial-input resize-y" />
              </Field>
            </FormPanel>

            <RecordSection title="Event journal" count={notes.length}>
              {notes.map((note) => (
                <article key={note._id} className="industrial-record">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="inline-flex items-center gap-2 bg-[#d5f34b] px-2 py-1 font-mono text-[9px] font-bold">
                        <CheckCircle2 size={12} /> COMPLETED
                      </span>
                      <h3 className="mt-3 text-lg font-black">{note.eventId?.title || "Event"}</h3>
                    </div>
                    <CalendarDays size={20} />
                  </div>

                  <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-[#666]">
                    {note.summary}
                  </p>

                  {(note.contactName || note.contactEmail || note.contactPhone) && (
                    <div className="mt-5 flex flex-wrap gap-4 border-t border-[#ccc] pt-4 text-xs text-[#666]">
                      {note.contactName && <span className="flex items-center gap-1"><UserRound size={13} />{note.contactName}</span>}
                      {note.contactEmail && <span className="flex items-center gap-1"><Mail size={13} />{note.contactEmail}</span>}
                      {note.contactPhone && <span className="flex items-center gap-1"><Phone size={13} />{note.contactPhone}</span>}
                    </div>
                  )}
                </article>
              ))}
              {notes.length === 0 && <EmptyState text="YOUR EVENT JOURNAL IS EMPTY" />}
            </RecordSection>
          </>
        )}
      </section>

   
    </main>
 

    )}
function FormPanel({ number, title, subtitle, onSubmit, loading, button, children }) {
  return (
    <div className="border border-[#bdbdb9] bg-[#dcdcd9]">
      <div className="flex items-center justify-between border-b border-[#bdbdb9] p-5">
        <div>
          <p className="font-mono text-[9px] tracking-[0.2em] text-[#777]">
            FORM / {number}
          </p>
          <h2 className="mt-2 text-2xl font-black uppercase tracking-tight">{title}</h2>
          <p className="mt-1 font-mono text-[9px] tracking-widest text-[#777]">{subtitle}</p>
        </div>
        <Sparkles size={22} />
      </div>

      <form onSubmit={onSubmit} className="space-y-5 p-5">
        {children}

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-3 bg-[#d5f34b] px-5 py-4 font-mono text-xs font-black tracking-widest text-black transition hover:bg-[#c2df3c] disabled:opacity-50"
        >
          {loading ? <Loader2 size={17} className="animate-spin" /> : <Plus size={17} />}
          {loading ? "PROCESSING..." : button}
        </button>
      </form>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block space-y-2">
      <span className="font-mono text-[10px] font-bold tracking-widest text-[#666]">
        {label}
      </span>
      {children}
    </label>
  );
}

function RecordSection({ title, count, children }) {
  return (
    <div>
      <div className="mb-4 flex items-center justify-between border-b border-[#bdbdb9] pb-3">
        <h2 className="text-lg font-black uppercase tracking-tight">{title}</h2>
        <span className="bg-[#d5f34b] px-3 py-1 font-mono text-[10px] font-bold">
          {String(count).padStart(2, "0")} RECORDS
        </span>
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function EmptyState({ text }) {
  return (
    <div className="border border-dashed border-[#aaa] bg-[#dededb] px-5 py-14 text-center">
      <FileBadge size={25} className="mx-auto mb-4 text-[#888]" />
      <p className="font-mono text-[10px] font-bold tracking-widest text-[#888]">{text}</p>
    </div>
  );
}
