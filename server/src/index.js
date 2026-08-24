import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { env } from "./env.js";
import { expireStaleBookings } from "./booking/expireStale.js";

import turfsRouter from "./routes/turfs.js";
import slotsRouter from "./routes/slots.js";
import bookingsRouter from "./routes/bookings.js";
import adminAuthRouter from "./routes/adminAuth.js";
import adminBookingsRouter from "./routes/adminBookings.js";
import adminSlotsRouter from "./routes/adminSlots.js";
import walkinsRouter from "./routes/walkins.js";
import configRouter from "./routes/config.js";

const app = express();
app.set("trust proxy", 1);

app.use(cors({ origin: env.CLIENT_ORIGIN, credentials: true }));

app.use(express.json());
app.use(cookieParser());

app.use("/api/turfs", turfsRouter);
app.use("/api/slots", slotsRouter);
app.use("/api/bookings", bookingsRouter);
app.use("/api/auth/admin", adminAuthRouter);
app.use("/api/admin/bookings", adminBookingsRouter);
app.use("/api/admin/slots", adminSlotsRouter);
app.use("/api/admin/walkins", walkinsRouter);
app.use("/api/config", configRouter);

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Something went wrong. Please try again." });
});

// Auto-release expired holds every minute — keeps slot availability accurate
// without requiring a customer action to trigger it.
setInterval(() => {
  expireStaleBookings().catch((e) => console.error("expireStaleBookings failed:", e));
}, 60_000);

app.listen(env.PORT, () => {
  console.log(`GameZone API running on http://localhost:${env.PORT}`);
});
