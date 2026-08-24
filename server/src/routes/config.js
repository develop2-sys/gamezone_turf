import { Router } from "express";
import { env } from "../env.js";

const router = Router();

// Public — safe to expose. Used by the booking detail page to render the pay QR.
router.get("/", (_req, res) => {
  res.json({ upiId: env.UPI_ID, payeeName: env.UPI_PAYEE_NAME });
});

export default router;