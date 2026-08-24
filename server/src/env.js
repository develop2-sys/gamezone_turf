import "dotenv/config";

function required(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env var: ${name}`);
  return v;
}

export const env = {
  DATABASE_URL: required("DATABASE_URL"),
  AUTH_SECRET: required("AUTH_SECRET"),
  UPI_ID: required("UPI_ID"),
  UPI_PAYEE_NAME: required("UPI_PAYEE_NAME"),
  BOOKING_MIN_ADVANCE_MINUTES: Number(process.env.BOOKING_MIN_ADVANCE_MINUTES ?? 60),
  BOOKING_MAX_ADVANCE_DAYS: Number(process.env.BOOKING_MAX_ADVANCE_DAYS ?? 30),
  SLOT_HOLD_MINUTES: Number(process.env.SLOT_HOLD_MINUTES ?? 10),
  CASH_BOOKING_EXPIRY_MINUTES: Number(process.env.CASH_BOOKING_EXPIRY_MINUTES ?? 120),
  PORT: Number(process.env.PORT ?? 4000),
  CLIENT_ORIGIN: process.env.CLIENT_ORIGIN ?? "http://localhost:5173",
};
