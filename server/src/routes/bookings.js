import { Router } from "express";
import { z } from "zod";
import { db } from "../db.js";
import { env } from "../env.js";
import { generateBookingRef } from "../booking/bookingRef.js";
import { expireStaleBookings } from "../booking/expireStale.js";

const router = Router();

const createSchema = z.object({
  turfId: z.string(),
  slotId: z.string(),
  customerName: z.string().min(1, "Name is required."),
  customerPhone: z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit phone number."),
  paymentMethod: z.enum(["UPI", "CASH"]),
});

router.post("/", async (req, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });
  const { turfId, slotId, customerName, customerPhone, paymentMethod } = parsed.data;

  const slot = await db.slot.findUnique({ where: { id: slotId } });
  if (!slot || slot.turfId !== turfId) return res.status(404).json({ error: "This slot is no longer available." });

  const now = new Date();
  const minStart = new Date(now.getTime() + env.BOOKING_MIN_ADVANCE_MINUTES * 60_000);
  const maxDate = new Date(now.getTime() + env.BOOKING_MAX_ADVANCE_DAYS * 86_400_000);
  if (slot.startTime < minStart) return res.status(400).json({ error: "This slot is too soon to book." });
  if (slot.date > maxDate) return res.status(400).json({ error: "This date is beyond the allowed booking window." });

  const holdMinutes = paymentMethod === "UPI" ? env.SLOT_HOLD_MINUTES : env.CASH_BOOKING_EXPIRY_MINUTES;
  const expiresAt = new Date(now.getTime() + holdMinutes * 60_000);
  const paymentStatus = paymentMethod === "UPI" ? "UNPAID" : "CASH_PENDING";

  try {
    const booking = await db.$transaction(async (tx) => {
      const claim = await tx.slot.updateMany({ where: { id: slotId, status: "AVAILABLE" }, data: { status: "PENDING" } });
      if (claim.count === 0) throw new Error("SLOT_TAKEN");

      const bookingRef = await generateBookingRef();
      const created = await tx.booking.create({
        data: {
          bookingRef, turfId, slotId, customerName, customerPhone, paymentMethod,
          bookingStatus: "PENDING", paymentStatus, amount: slot.price, expiresAt,
        },
      });
      await tx.payment.create({ data: { bookingId: created.id, method: paymentMethod, status: paymentStatus } });
      return created;
    });

    res.status(201).json({
      bookingId: booking.id, bookingRef: booking.bookingRef, amount: booking.amount,
      paymentMethod: booking.paymentMethod, bookingStatus: booking.bookingStatus,
      paymentStatus: booking.paymentStatus, expiresAt: booking.expiresAt,
      upi: paymentMethod === "UPI" ? { upiId: env.UPI_ID, payeeName: env.UPI_PAYEE_NAME } : undefined,
    });
  } catch (err) {
    if (err.message === "SLOT_TAKEN") return res.status(409).json({ error: "The selected slot is no longer available." });
    console.error(err);
    res.status(500).json({ error: "Something went wrong. Please try again." });
  }
});

router.get("/lookup", async (req, res) => {
  const schema = z.object({ phone: z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit phone number.") });
  const parsed = schema.safeParse({ phone: req.query.phone });
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });

  const bookings = await db.booking.findMany({
    where: { customerPhone: parsed.data.phone },
    include: { turf: true, slot: true },
    orderBy: { createdAt: "desc" },
  });
  res.json(bookings);
});

router.get("/:id", async (req, res) => {
  const booking = await db.booking.findUnique({
    where: { id: req.params.id },
    include: { turf: true, slot: true },
  });
  if (!booking) return res.status(404).json({ error: "Booking not found." });
  res.json(booking);
});

const paySchema = z.object({
  transactionRef: z.string().optional(),
});

router.post("/:id/pay", async (req, res) => {
  const parsed = paySchema.safeParse(req.body ?? {});
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });

  const booking = await db.booking.findUnique({ where: { id: req.params.id } });
  if (!booking || booking.paymentMethod !== "UPI") return res.status(404).json({ error: "Booking not found." });
  if (booking.bookingStatus !== "PENDING" || (booking.expiresAt && booking.expiresAt < new Date())) {
    return res.status(410).json({ error: "Your booking has expired." });
  }
  if (booking.paymentStatus !== "UNPAID") return res.status(409).json({ error: "Payment verification is still pending." });

  const updated = await db.booking.update({ where: { id: booking.id }, data: { paymentStatus: "VERIFICATION_PENDING" } });
  await db.payment.update({
    where: { bookingId: booking.id },
    data: { status: "VERIFICATION_PENDING", transactionRef: parsed.data.transactionRef || null },
  });
  res.json({ bookingId: updated.id, paymentStatus: updated.paymentStatus });
});

router.post("/expire", async (_req, res) => {
  const count = await expireStaleBookings();
  res.json({ expired: count });
});

export default router;