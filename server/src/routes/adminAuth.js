import { Router } from "express";
import { z } from "zod";
import { db } from "../db.js";
import { verifySecret, createSessionToken } from "../auth.js";

const router = Router();

const schema = z.object({ email: z.string().email(), password: z.string().min(1) });

router.post("/", async (req, res) => {
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input." });
  const { email, password } = parsed.data;

  const admin = await db.admin.findUnique({ where: { email } });
  if (!admin || !(await verifySecret(password, admin.passwordHash))) {
    return res.status(401).json({ error: "Invalid email or password." });
  }

  const token = createSessionToken({ sub: admin.id, role: "admin" });
    res.cookie("gz_admin_session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 86_400_000,
  });
  res.json({ id: admin.id, email: admin.email });
});

router.post("/logout", (_req, res) => {
  res.clearCookie("gz_admin_session");
  res.json({ ok: true });
});

router.get("/me", (req, res) => {
  const token = req.cookies?.gz_admin_session;
  res.json({ loggedIn: !!token });
});

export default router;
