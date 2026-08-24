import { Router } from "express";
import { db } from "../db.js";
import { env } from "../env.js";

const router = Router();

// Public: available slots for a turf on a date. Source of truth — never trust frontend.
router.get("/", async (req, res) => {
  const { turfId, date: dateParam } = req.query;
  if (!turfId || !dateParam) return res.status(400).json({ error: "turfId and date are required." });

  const date = new Date(dateParam);
  if (isNaN(date.getTime())) return res.status(400).json({ error: "Invalid date." });

  const now = new Date();
  const minStart = new Date(now.getTime() + env.BOOKING_MIN_ADVANCE_MINUTES * 60_000);
  const maxDate = new Date(now.getTime() + env.BOOKING_MAX_ADVANCE_DAYS * 86_400_000);
  if (date > maxDate) return res.status(400).json({ error: "This date is beyond the allowed booking window." });

  const slots = await db.slot.findMany({ where: { turfId, date }, orderBy: { startTime: "asc" } });
  const result = slots.map((s) => ({ ...s, bookable: s.status === "AVAILABLE" && s.startTime >= minStart }));
  res.json(result);
});

export default router;
