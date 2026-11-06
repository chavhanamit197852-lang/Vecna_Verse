import mongoose from "mongoose";
import { randomBytes } from "node:crypto";
import { dbConnect } from "../lib/db.js";
import Attendance from "../models/Attendance.js";
import Registration from "../models/Registration.js";
import Event from "../models/Event.js";

async function migrate() {
  await dbConnect();
  const legacyRows = await Attendance.find().lean();
  let migrated = 0;
  let skipped = 0;

  for (const row of legacyRows) {
    try {
      const existing = await Registration.findOne({ eventId: row.eventId, userId: row.userId });
      if (existing) {
        if (row.status === "CHECKED_IN" && existing.status !== "CHECKED_IN") {
          existing.status = "CHECKED_IN";
          existing.checkedInAt = row.checkedInAt || new Date();
          existing.aicteAwarded = Number(row.aicteAwarded || 0);
          await existing.save();
          migrated += 1;
        } else {
          skipped += 1;
        }
      } else {
        await Registration.create({
          eventId: row.eventId,
          userId: row.userId,
          qrToken: row.qrToken || randomBytes(32).toString("hex"),
          status: row.status === "CHECKED_IN" ? "CHECKED_IN" : "REGISTERED",
          checkedInAt: row.checkedInAt || null,
          aicteAwarded: Number(row.aicteAwarded || 0),
          payment: { mode: "FREE", status: "NOT_REQUIRED", amount: 0 },
          createdAt: row.createdAt || new Date(),
          updatedAt: row.updatedAt || new Date(),
        });
        migrated += 1;
      }
    } catch (error) {
      console.error(`Could not migrate attendance ${row._id}:`, error.message);
    }
  }

  const events = await Event.find().select("_id").lean();
  for (const event of events) {
    const count = await Registration.countDocuments({
      eventId: event._id,
      status: { $in: ["PAYMENT_PENDING", "REGISTERED", "CHECKED_IN"] },
    });
    await Event.updateOne({ _id: event._id }, { $set: { registeredCount: count } });
  }

  console.log(`Attendance migration finished. Migrated: ${migrated}; already present: ${skipped}; legacy rows: ${legacyRows.length}`);
  await mongoose.disconnect();
}

migrate().catch(async (error) => {
  console.error("Attendance migration failed:", error);
  await mongoose.disconnect();
  process.exitCode = 1;
});
