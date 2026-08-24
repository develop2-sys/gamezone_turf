import { Router } from "express";
import { z } from "zod";
import { db } from "../db.js";
import { requireAdmin } from "../middleware/requireAdmin.js";
import { logAdminAction } from "../audit.js";
import { generateBookingRef } from "../booking/bookingRef.js";

const router = Router();
router.use(requireAdmin);

const schema = z.object({
  turfId: z.string(), slotId: z.string(),
  customerName: z.string().min(1),
  customerPhone: z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit phone number."),
  paymentMethod: z.enum(["UPI", "CASH"]),
  paid: z.boolean(),
});

router.post("/", async (req, res) => {
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });
  const { turfId, slotId, customerName, customerPhone, paymentMethod, paid } = parsed.data;

  const slot = await db.slot.findUnique({ where: { id: slotId } });
  if (!slot || slot.turfId !== turfId) return res.status(404).json({ error: "This slot is no longer available." });

  try {
    const booking = await db.$transaction(async (tx) => {
      const claim = await tx.slot.updateMany({
        where: { id: slotId, status: "AVAILABLE" },
        data: { status: paid ? "BOOKED" : "PENDING" },
      });
      if (claim.count === 0) throw new Error("SLOT_TAKEN");

      const bookingRef = await generateBookingRef();
      const paymentStatus = paid ? "PAID" : paymentMethod === "CASH" ? "CASH_PENDING" : "UNPAID";
      const bookingStatus = paid ? "CONFIRMED" : "PENDING";

      const created = await tx.booking.create({
        data: { bookingRef, turfId, slotId, customerName, customerPhone, paymentMethod, bookingStatus, paymentStatus, amount: slot.price, isWalkIn: true },
      });
      await tx.payment.create({
        data: { bookingId: created.id, method: paymentMethod, status: paymentStatus, verifiedByAdmin: paid ? req.admin.sub : undefined, verifiedAt: paid ? new Date() : undefined },
      });
      return created;
    });

    await logAdminAction(req.admin.sub, "CREATE_WALKIN_BOOKING", booking.id);
    res.status(201).json(booking);
  } catch (err) {
    if (err.message === "SLOT_TAKEN") return res.status(409).json({ error: "The selected slot is no longer available." });
    console.error(err);
    res.status(500).json({ error: "Something went wrong. Please try again." });
  }
});

export default router;
