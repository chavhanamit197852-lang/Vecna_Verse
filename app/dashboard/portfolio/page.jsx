import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import Achievement from "@/models/Achievement";
import Certificate from "@/models/Certificate";
import Registration from "@/models/Registration";
import EventNote from "@/models/EventNote";
import Portfolio from "@/components/Portfolio";
import PortfolioView from "./_PortfolioView";

export default async function PortfolioPage() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) redirect("/login");

  await dbConnect();

  // Wrap in try/catch to prevent a single DB error from crashing the whole page
  let user = null;
  let achievements = [];
  let certificates = [];
  let attendance = [];
  let notes = [];

  try {
    const results = await Promise.all([
      User.findById(userId).lean(),
      Achievement.find({ userId }).sort({ date: -1 }).lean(),
      Certificate.find({ userId }).sort({ issuedAt: -1 }).lean(),
      Registration.find({ userId, status: "CHECKED_IN" }).populate("eventId", "title aicteCategory").lean(),
      EventNote.find({ userId }).populate("eventId", "title").sort({ updatedAt: -1 }).lean(),
    ]);
    
    user = results[0];
    achievements = results[1] || [];
    certificates = results[2] || [];
    attendance = results[3] || [];
    notes = results[4] || [];
  } catch (error) {
    console.error("Failed to load portfolio data:", error);
    // Fallback to empty arrays so the page still renders
  }

  // Safely calculate AICTE category distribution
  const categoryMap = {};
  attendance.forEach((a) => {
    const cat = a.eventId?.aicteCategory || "Other";
    categoryMap[cat] = (categoryMap[cat] || 0) + (a.aicteAwarded || 0);
  });
  
  // Real data only — never fabricate placeholder categories.
  const radarData = Object.keys(categoryMap).map((k) => ({ subject: k, A: categoryMap[k], fullMark: 100 }));
  const attendedEvents = attendance.filter((a) => a.eventId).map((a) => ({ _id: String(a.eventId._id), title: a.eventId.title }));

  return (
    <>
    <PortfolioView
      user={JSON.parse(JSON.stringify(user || {}))}
      achievements={JSON.parse(JSON.stringify(achievements))}
      certificates={JSON.parse(JSON.stringify(certificates))}
      radarData={radarData}
      totalEvents={attendance.length}
    />
    <div className="mx-auto max-w-6xl px-5 pb-16 text-white md:px-10 lg:ml-64">
      <h2 className="text-xl font-black">Add to your portfolio</h2>
      <p className="mt-1 text-sm text-zinc-500">Upload certificates, record achievements and attach notes to events you attended.</p>
      <Portfolio
        achievements={JSON.parse(JSON.stringify(achievements))}
        certificates={JSON.parse(JSON.stringify(certificates))}
        notes={JSON.parse(JSON.stringify(notes))}
        events={attendedEvents}
      />
    </div>
    </>
  );
}
export const dynamic = "force-dynamic";
