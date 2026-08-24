import { db } from "../db.js";

export async function generateBookingRef() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const dateStr = `${y}${m}${d}`;

  const startOfDay = new Date(y, now.getMonth(), now.getDate());
  const countToday = await db.booking.count({ where: { createdAt: { gte: startOfDay } } });
  const seq = String(countToday + 1).padStart(3, "0");
  return `GZ-${dateStr}-${seq}`;
}
