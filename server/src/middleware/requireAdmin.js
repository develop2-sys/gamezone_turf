import { verifySessionToken } from "../auth.js";

export function requireAdmin(req, res, next) {
  const token = req.cookies?.gz_admin_session;
  const session = token ? verifySessionToken(token) : null;
  if (!session || session.role !== "admin") {
    return res.status(403).json({ error: "Only administrators can perform this action." });
  }
  req.admin = session;
  next();
}
