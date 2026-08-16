import { NextFunction, Request, Response } from "express";
import { verifyToken } from "./token.js";

export interface AuthedRequest extends Request {
  user?: { id: number; role: string };
}

export function authRequired(req: AuthedRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  try {
    req.user = verifyToken(token);
    next();
  } catch {
    return res.status(401).json({ error: "Token tidak valid atau kedaluwarsa" });
  }
}

export function optionalAuth(req: AuthedRequest, _res: Response, next: NextFunction) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (token) {
    try {
      req.user = verifyToken(token);
    } catch {
      // abaikan token tidak valid
    }
  }
  next();
}

export function requireRole(...roles: string[]) {
  return (req: AuthedRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Akses ditolak" });
    }
    next();
  };
}
