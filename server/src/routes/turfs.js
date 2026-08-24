import { Router } from "express";
import { z } from "zod";
import { db } from "../db.js";
import { requireAdmin } from "../middleware/requireAdmin.js";
import { logAdminAction } from "../audit.js";

const router = Router();

router.get("/", async (req, res) => {
  const turfs = await db.turf.findMany({
    where: { isActive: true },
    select: { id: true, name: true, description: true },
    orderBy: { name: "asc" },
  });
  res.json(turfs);
});

const createSchema = z.object({ name: z.string().min(1), description: z.string().optional() });

router.post("/", requireAdmin, async (req, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input." });
  const turf = await db.turf.create({ data: parsed.data });
  await logAdminAction(req.admin.sub, "CREATE_TURF", null, { turfId: turf.id });
  res.status(201).json(turf);
});

const patchSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
});

router.patch("/:id", requireAdmin, async (req, res) => {
  const parsed = patchSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input." });
  const turf = await db.turf.update({ where: { id: req.params.id }, data: parsed.data });
  await logAdminAction(req.admin.sub, "UPDATE_TURF", null, { turfId: turf.id, changes: parsed.data });
  res.json(turf);
});

export default router;
