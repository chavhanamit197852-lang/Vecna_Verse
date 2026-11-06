
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { dbConnect } from "@/lib/db";

import User from "@/models/User";
import Event from "@/models/Event";
import Registration from "@/models/Registration";

import AdminDashboardView from "./_AdminDashboardView.jsx";

export const dynamic = "force-dynamic";

export default async function AdminAnalytics() {
  // 1. Authorization
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  await dbConnect();

  // 2. Fetch dashboard KPIs
  const [
    totalUsers,
    totalEvents,
    totalRegistrations,
    checkedInCount,
  ] = await Promise.all([
    User.countDocuments(),

    Event.countDocuments({
      isPublished: true,
    }),

    Registration.countDocuments({
      status: { $in: ["REGISTERED", "CHECKED_IN"] },
    }),

    Registration.countDocuments({ status: "CHECKED_IN" }),
  ]);

  // 3. Attendance percentage
  const checkInRate =
    totalRegistrations > 0
      ? Math.round(
          (checkedInCount / totalRegistrations) * 100
        )
      : 0;

  // 4. Fetch recent registrations
  const recentRegistrations = await Registration.find({
    status: { $in: ["REGISTERED", "CHECKED_IN"] },
  })
    .populate("userId", "name email")
    .populate("eventId", "title city")
    .sort({ createdAt: -1 })
    .limit(5)
    .lean();

  // 5. Fetch event category statistics
  const categoriesRaw = await Event.aggregate([
    {
      $match: {
        isPublished: true,
      },
    },
    {
      $group: {
        _id: {
          $ifNull: ["$category", "Other"],
        },
        value: {
          $sum: 1,
        },
      },
    },
    {
      $project: {
        _id: 0,
        name: "$_id",
        value: 1,
      },
    },
    {
      $sort: {
        value: -1,
      },
    },
  ]);

  // 6. Prepare serializable registration data
  const safeRegistrations = recentRegistrations.map((r) => ({
    _id: String(r._id),

    userId: r.userId?._id
      ? String(r.userId._id)
      : null,

    eventId: r.eventId?._id
      ? String(r.eventId._id)
      : null,

    userName: r.userId?.name || "Unknown",
    userEmail: r.userId?.email || "",

    eventTitle: r.eventId?.title || "Deleted Event",
    eventCity: r.eventId?.city || "",

    status: r.status || "REGISTERED",

    attendanceStatus:
      r.attendance?.status || "PENDING",

    checkedInAt:
      r.attendance?.checkedInAt?.toISOString?.() || null,

    createdAt:
      r.createdAt?.toISOString?.() || null,
  }));

  // 7. Safe chart fallback
  const categories =
    categoriesRaw.length > 0
      ? categoriesRaw.map((category) => ({
          name: category.name,
          value: Number(category.value),
        }))
      : [{ name: "No published events", value: 0 }];

  // 8. Render analytics
  return (
   <AdminDashboardView
  kpis={{
    totalUsers,
    totalEvents,
    totalRegistrations,
    checkedInCount,
    checkInRate,
  }}
  recentRegistrations={safeRegistrations}
  categories={categories}
/>
  );
}
