import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "./env.js";

export function hashSecret(plain) {
  return bcrypt.hash(plain, 10);
}
export function verifySecret(plain, hash) {
  return bcrypt.compare(plain, hash);
}
export function createSessionToken(payload) {
  return jwt.sign(payload, env.AUTH_SECRET, { expiresIn: "1d" });
}
export function verifySessionToken(token) {
  try {
    return jwt.verify(token, env.AUTH_SECRET);
  } catch {
    return null;
  }
}
