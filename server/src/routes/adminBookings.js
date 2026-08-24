import { Router } from "express";
import { db } from "../db.js";
import { requireAdmin } from "../middleware/requireAdmin.js";
import { logAdminAction } from "../audit.js";

const router = Router();
router.use(requireAdmin);

router.get("/", async (req, res) => {
  const { status } = req.query;
  const bookings = await db.booking.findMany({
    where: status ? { bookingStatus: status } : undefined,
    include: { turf: true, slot: true, payment: true },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  res.json(bookings);
});

router.post("/:id/confirm-payment", async (req, res) => {
  const booking = await db.booking.findUnique({ where: { id: req.params.id } });
  if (!booking || booking.paymentMethod !== "UPI") return res.status(404).json({ error: "Booking not found." });
  if (booking.paymentStatus !== "VERIFICATION_PENDING") return res.status(409).json({ error: "Payment verification is still pending." });

  await db.$transaction([
    db.booking.update({ where: { id: booking.id }, data: { paymentStatus: "PAID", bookingStatus: "CONFIRMED" } }),
    db.payment.update({ where: { bookingId: booking.id }, data: { status: "PAID", verifiedByAdmin: req.admin.sub, verifiedAt: new Date() } }),
    db.slot.update({ where: { id: booking.slotId }, data: { status: "BOOKED" } }),
  ]);
  await logAdminAction(req.admin.sub, "CONFIRMED_PAYMENT", booking.id);
  res.json({ ok: true });
});

router.post("/:id/reject-payment", async (req, res) => {
  const booking = await db.booking.findUnique({ where: { id: req.params.id } });
  if (!booking || booking.paymentMethod !== "UPI") return res.status(404).json({ error: "Booking not found." });

  await db.$transaction([
    db.booking.update({ where: { id: booking.id }, data: { paymentStatus: "FAILED", bookingStatus: "REJECTED" } }),
    db.payment.update({ where: { bookingId: booking.id }, data: { status: "FAILED" } }),
    db.slot.updateMany({ where: { id: booking.slotId, status: "PENDING" }, data: { status: "AVAILABLE" } }),
  ]);
  await logAdminAction(req.admin.sub, "REJECTED_PAYMENT", booking.id);
  res.json({ ok: true });
});

router.post("/:id/confirm-cash", async (req, res) => {
  const booking = await db.booking.findUnique({ where: { id: req.params.id } });
  if (!booking || booking.paymentMethod !== "CASH") return res.status(404).json({ error: "Booking not found." });

  await db.$transaction([
    db.booking.update({ where: { id: booking.id }, data: { paymentStatus: "PAID", bookingStatus: "CONFIRMED" } }),
    db.payment.update({ where: { bookingId: booking.id }, data: { status: "PAID", verifiedByAdmin: req.admin.sub, verifiedAt: new Date() } }),
    db.slot.update({ where: { id: booking.slotId }, data: { status: "BOOKED" } }),
  ]);
  await logAdminAction(req.admin.sub, "CONFIRMED_CASH", booking.id);
  res.json({ ok: true });
});

router.post("/:id/reject-cash", async (req, res) => {
  const booking = await db.booking.findUnique({ where: { id: req.params.id } });
  if (!booking || booking.paymentMethod !== "CASH") return res.status(404).json({ error: "Booking not found." });

  await db.$transaction([
    db.booking.update({ where: { id: booking.id }, data: { bookingStatus: "REJECTED" } }),
    db.slot.updateMany({ where: { id: booking.slotId, status: "PENDING" }, data: { status: "AVAILABLE" } }),
  ]);
  await logAdminAction(req.admin.sub, "REJECTED_CASH", booking.id);
  res.json({ ok: true });
});

router.post("/:id/cancel", async (req, res) => {
  const booking = await db.booking.findUnique({ where: { id: req.params.id } });
  if (!booking) return res.status(404).json({ error: "Booking not found." });
  if (booking.bookingStatus !== "CONFIRMED") return res.status(409).json({ error: "Only confirmed bookings can be cancelled." });

  await db.$transaction([
    db.booking.update({ where: { id: booking.id }, data: { bookingStatus: "CANCELLED" } }),
    db.slot.update({ where: { id: booking.slotId }, data: { status: "AVAILABLE" } }),
  ]);
  await logAdminAction(req.admin.sub, "CANCELLED_BOOKING", booking.id);
  res.json({ ok: true });
});

export default router;
