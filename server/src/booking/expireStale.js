import { db } from "../db.js";

export async function expireStaleBookings() {
  const now = new Date();
  const stale = await db.booking.findMany({
    where: { bookingStatus: "PENDING", expiresAt: { lt: now } },
  });
  for (const booking of stale) {
    await db.$transaction([
      db.booking.update({ where: { id: booking.id }, data: { bookingStatus: "EXPIRED" } }),
      db.slot.updateMany({ where: { id: booking.slotId, status: "PENDING" }, data: { status: "AVAILABLE" } }),
    ]);
  }
  return stale.length;
}
