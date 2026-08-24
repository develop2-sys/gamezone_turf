import { Router } from "express";
import { z } from "zod";
import { db } from "../db.js";
import { requireAdmin } from "../middleware/requireAdmin.js";
import { logAdminAction } from "../audit.js";

const router = Router();
router.use(requireAdmin);

const createSchema = z.object({
  turfId: z.string(), date: z.string(), startTime: z.string(), endTime: z.string(), price: z.number().positive(),
});

router.post("/", async (req, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input." });
  const { turfId, date, startTime, endTime, price } = parsed.data;
  const slot = await db.slot.create({
    data: { turfId, date: new Date(date), startTime: new Date(startTime), endTime: new Date(endTime), price },
  });
  await logAdminAction(req.admin.sub, "CREATE_SLOT", null, { slotId: slot.id });
  res.status(201).json(slot);
});

const patchSchema = z.object({
  slotId: z.string(), status: z.enum(["AVAILABLE", "BLOCKED"]).optional(), price: z.number().positive().optional(),
});

router.patch("/", async (req, res) => {
  const parsed = patchSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input." });
  const { slotId, status, price } = parsed.data;
  const slot = await db.slot.update({ where: { id: slotId }, data: { status, price } });
  await logAdminAction(req.admin.sub, "UPDATE_SLOT", null, { slotId, changes: { status, price } });
  res.json(slot);
});

export default router;
