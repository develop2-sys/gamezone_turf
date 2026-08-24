import { db } from "./db.js";

export function logAdminAction(adminId, action, targetBookingId, metadata) {
  return db.auditLog.create({
    data: { adminId, action, targetBookingId: targetBookingId ?? undefined, metadata: metadata ?? undefined },
  });
}
